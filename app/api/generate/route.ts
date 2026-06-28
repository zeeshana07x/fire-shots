import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI, { toFile } from 'openai';
import sharp from 'sharp';
import { deductMockupCredits, getCredits } from '@/lib/credits';
import { MAX_BATCH_SIZE } from '@/lib/types';

// Generous ceiling for the background work itself. Note: on Vercel this is
// still capped by your plan (Hobby: 60s hard limit even with after();
// Pro: up to 300s; Enterprise: higher). Confirm your plan's actual ceiling —
// after()/waitUntil() extend the invocation, they don't bypass the plan cap.
export const maxDuration = 300;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  timeout: 280000, // keep slightly below maxDuration so we fail cleanly, not via hard kill
  maxRetries: 1, // retries add latency; 1 retry is plenty for a transient network blip
});

async function toOpenAIFile(
  img: { base64: string; mediaType: string },
  filename: string,
) {
  const buffer = Buffer.from(img.base64, 'base64');
  return await toFile(buffer, filename, { type: img.mediaType });
}

// Picks a canvas size so each panel keeps roughly phone-shaped proportions
// instead of getting squeezed into a thin vertical sliver as panel count
// grows. gpt-image-2 constraints: width/height divisible by 16, aspect
// ratio between 1:3 and 3:1, max dimension 3840x2160 (above 2560x1440 is
// "experimental").
//
// Verified output for panel counts 1-4 (the common cases):
//   1 panel:  1024x1536 canvas → 1 panel at 1024x1536 (clean 2:3 phone ratio)
//   2 panels: 2048x1536 canvas → 2 panels at 1024x1536 each (clean)
//   3 panels: 3072x1536 canvas → 3 panels at 1024x1536 each (clean)
//   4 panels: 3840x1536 canvas → 4 panels at  960x1536 each (slightly
//             narrower than the others — this is the API's max-resolution
//             ceiling being hit, not a bug. Above 4 panels this same cap
//             means panels keep getting narrower; there's no way to avoid
//             that within a single generation call.)
//
// Single-panel case returns immediately — no batching math needed at all
// when there's only one screenshot.
function pickCanvasSize(panelCount: number): { width: number; height: number } {
  const height = 1536; // fixed portrait height, matches phone aspect ratio

  if (panelCount === 1) {
    return { width: 1024, height }; // single screenshot, no batching math needed
  }

  const perPanelWidth = 1024; // gives each panel a ~2:3 phone-like ratio

  // Round width up to nearest multiple of 16, per API requirement.
  const rawWidth = perPanelWidth * panelCount;
  let width = Math.ceil(rawWidth / 16) * 16;

  // Enforce the 1:3–3:1 aspect ratio ceiling (width:height <= 3:1 here,
  // since we only ever go wider than tall in this flow).
  const maxWidthForRatio = height * 3;
  width = Math.min(width, maxWidthForRatio);

  // Enforce the documented max resolution. This is what causes the slight
  // narrowing at 4+ panels noted in the table above.
  width = Math.min(width, 3840);

  return { width, height };
}

// Splits one combined PNG buffer into `panelCount` equal-width vertical
// slices. For a single screenshot, this is a no-op — there is nothing to
// crop, since the model only ever drew one panel and the canvas was sized
// for exactly one panel (see pickCanvasSize above). Cropping logic only
// runs for 2+ panels.
//
// Assumes the model laid panels out left-to-right at equal widths, which
// is what our prompt explicitly asks for — if the model occasionally
// ignores that and draws uneven panel widths, slices may cut into adjacent
// panels. There's no way to detect panel boundaries from pixels alone
// without doing actual edge/content detection, so this is a "trust the
// prompt" approach — flag any visibly bad crops you see in testing and
// we can add a manual re-crop/adjust step in the UI if it's common enough.
async function splitIntoPanels(
  pngBuffer: Buffer,
  panelCount: number,
): Promise<Buffer[]> {
  if (panelCount === 1) {
    // No cropping needed at all — single screenshot, single panel,
    // the generated image IS the final output as-is.
    return [pngBuffer];
  }

  const metadata = await sharp(pngBuffer).metadata();
  const totalWidth = metadata.width;
  const totalHeight = metadata.height;

  if (!totalWidth || !totalHeight) {
    throw new Error('Could not read generated image dimensions for cropping.');
  }

  const panelWidth = Math.floor(totalWidth / panelCount);
  const panels: Buffer[] = [];

  for (let i = 0; i < panelCount; i++) {
    const left = i * panelWidth;
    // Last panel absorbs any leftover pixels from the floor() rounding,
    // so the slices always sum to exactly totalWidth with no gap/overlap.
    const width = i === panelCount - 1 ? totalWidth - left : panelWidth;

    const cropped = await sharp(pngBuffer)
      .extract({ left, top: 0, width, height: totalHeight })
      .png()
      .toBuffer();

    panels.push(cropped);
  }

  return panels;
}

function buildPrompt(
  images: { base64: string; mediaType: string }[],
  styleType: '2D' | '3D',
) {
  const panelWord = images.length === 1 ? 'panel' : 'panels';
  const panelCountSpelled = images.length;

  const systemPrompt = `You are an expert App Store / Play Store screenshot designer operating gpt-image-2.

You will receive a REFERENCE image first, followed by exactly ${panelCountSpelled}
RAW SCREENSHOT image(s) of the user's app.

Your job: generate one cohesive multi-panel marketing screenshot SET in a premium, beautiful ${styleType} illustration style, where
every panel shares the same character(s), color palette, typography, and
${styleType} illustration style as the REFERENCE image, but each panel's phone frame
displays the content from the corresponding RAW SCREENSHOT.

=== PANEL COUNT — READ THIS FIRST ===
The REFERENCE image may visually show a different number of panels than what
you are asked to generate. IGNORE the REFERENCE image's panel count entirely.
The REFERENCE image is a STYLE GUIDE ONLY — copy its ${styleType} illustration style,
color palette, character design, and typography, but NOT its layout, grid,
or number of panels.

The ONLY thing that determines how many panels you output is the number of
RAW SCREENSHOT images provided. Exactly ${panelCountSpelled} RAW SCREENSHOT
image(s) were provided, so you must generate EXACTLY ${panelCountSpelled}
${panelWord}. Not more, not fewer.

This means: generate exactly ${panelCountSpelled} ${panelWord} side-by-side,
one per RAW SCREENSHOT, in the same left-to-right order they were provided
(panel 1 = screenshot 1, panel 2 = screenshot 2, etc). Do NOT add extra
panels and do NOT drop any panels, even if the REFERENCE image shows a
different number of panels than ${panelCountSpelled}. The REFERENCE image's
own panel count (whatever it is) is NOT the target — ${panelCountSpelled} is
the target, because that is how many RAW SCREENSHOT images were provided.

Explicit mapping, follow exactly:
${images.map((_, i) => `  - Panel ${i + 1} must display the content of RAW SCREENSHOT ${i + 1}, and no other screenshot.`).join('\n')}

Before finalizing, verify: does the output contain exactly ${panelCountSpelled}
panels, with each panel showing the correct screenshot from the list above,
in the correct position? If not, fix it before returning the result.
=== END PANEL COUNT ===

=== STYLE vs. SUBJECT MATTER — DO NOT CONFUSE THESE ===
The REFERENCE image teaches you a STYLE: line weight, shading technique,
color palette, roundness, typography, and overall ${styleType} illustration mood. It is
NOT a library of assets to copy.

Do NOT reuse the REFERENCE image's specific mascot, character, animal,
plant, or any named decorative prop (for example: if the REFERENCE shows a
cactus character, a wooden sign, or a trophy icon, do NOT draw that same
cactus, sign, or trophy in your output). Copying the reference's specific
character or props is WRONG even if the colors and line style match.

Instead, INVENT a new, original character and new decorative props that:
- Match the REFERENCE's ${styleType} illustration STYLE (rounded shapes, color palette,
  shading, line weight, typography) — yes, copy the style.
- Are thematically relevant to the app shown in the RAW SCREENSHOT(s)
  instead of the reference's subject (for example, for a cricket scoring
  app, consider a cricket bat, ball, trophy, or a friendly sports-themed
  mascot — not a cactus, not a habit-tracker plant, not anything specific
  to what the reference happened to depict).
- Stay completely original — do not trace, copy, or closely imitate the
  reference's specific drawn subject in any panel.
=== END STYLE vs. SUBJECT MATTER ===

Hard rules:
1. NEVER redraw, distort, blur, or stylize the contents of the phone screen
   itself. The screen content must remain crisp, accurate, and pixel-faithful
   to the raw screenshot provided. Treat the screen area as a "window" — only
   the background, characters, decorations, and headline text around the
   phone may be illustrated/stylized.
2. Invent ONE new original character (thematically relevant to the app, not
   copied from the REFERENCE image) and keep its face, outfit, and color
   IDENTICAL across all ${panelWord} in this set. Do not let it drift
   panel-to-panel, and do not let it resemble the REFERENCE's own character.
   If multiple screenshots show different accent colors, pick the most
   frequently recurring one as the primary palette, and keep that SAME
   app-derived palette consistent across all ${panelWord} in this set
   (panels may still vary in background tint/shade for visual variety, but
   should stay within the same color family derived from the app).
   Maintain identical font family/weight for headlines and decorative
   motif style across all ${panelWord}, matching the REFERENCE image's
   TYPOGRAPHY and illustration STYLE only — never its color palette, its
   specific subject matter (mascot/props), or its overall panel COUNT.
   (Note: you SHOULD copy the REFERENCE's spatial composition *within* a
   single panel — see the LAYOUT / COMPOSITION section below. The "don't
   copy layout" rule here refers only to panel count/grid structure, not
   in-panel positioning.)
4. Each panel must include a short headline (max 6 words) and one supporting
   line of subtext (max 10 words) above the phone mockup.
5. Render all text with perfect spelling, high contrast, and no distortion.
6. Output panels left-to-right in the same order as the input screenshots.
7. Do not add watermarks, logos, or placeholder text.
8. Do not add a second, third, or fourth phone frame beyond what is required
   to display the ${panelCountSpelled} provided screenshot(s).

=== LAYOUT / COMPOSITION — MATCH THE REFERENCE'S SPATIAL STRUCTURE ===
Copy the REFERENCE image's COMPOSITION exactly — where things sit on the
canvas (phone size/position, text placement, character placement) — NOT
its colors. Colors come from the RAW SCREENSHOT's app branding, per the
COLOR SOURCE rule above. Composition and color are independent: copy the
former from the REFERENCE, derive the latter from the RAW SCREENSHOT(s).

Phone mockup:
- The phone mockup must be LARGE and DOMINANT — it should occupy the
  majority of the panel's vertical space (roughly 65-75% of panel height),
  matching the REFERENCE image's proportions. Do not shrink it to make room
  for decorative elements.
- Center the phone mockup horizontally within the panel, or position it
  exactly where the REFERENCE places its phone mockup relative to the
  panel's width. Do not push the phone to one side with large empty space
  on the other side unless the REFERENCE image does the same.
- The phone should appear anchored toward the bottom of the panel, with the
  headline/subtext text block above it — matching the REFERENCE's vertical
  rhythm of [headline] → [subtext] → [phone mockup], top to bottom.

Character placement:
- The character should be positioned beside or slightly overlapping the
  phone mockup's edge (as in the REFERENCE), not floating in empty space
  separate from the phone. The character and phone should read as one
  cohesive grouping, not two disconnected elements.

Text block:
- Headline and subtext must be horizontally centered (or left-aligned,
  matching whichever the REFERENCE uses) with consistent, even letter
  spacing and clean alignment between the headline and the subtext line
  directly below it.
- Leave clear visual breathing room between the text block and the top of
  the phone mockup — do not let them crowd each other.
- Headline font size should be large and bold enough to dominate the top of
  the panel, matching the REFERENCE's type scale, not a smaller or
  thinner-weight rendering.
=== END LAYOUT / COMPOSITION ===`;

  return systemPrompt;
}

// The actual long-running work: calls OpenAI, then updates the batch row.
// Runs inside after(), so it continues executing after the response is sent.
async function runGeneration({
  batchId,
  userId,
  images,
  referenceImage,
  styleType,
}: {
  batchId: string;
  userId: string;
  images: { base64: string; mediaType: string }[];
  referenceImage?: { base64: string; mediaType: string };
  styleType: '2D' | '3D';
}) {
  const supabase = await createClient();

  try {
    const userPrompt = buildPrompt(images, styleType);

    const imageFiles = [];
    if (referenceImage) {
      imageFiles.push(await toOpenAIFile(referenceImage, 'reference.png'));
    }
    for (let i = 0; i < images.length; i++) {
      imageFiles.push(await toOpenAIFile(images[i], `screenshot-${i + 1}.png`));
    }

    const { width, height } = pickCanvasSize(images.length);

    const imageResponse = await openai.images.edit({
      model: 'gpt-image-2',
      image: imageFiles,
      prompt: userPrompt,
      quality: 'medium',
      size: `${width}x${height}`,
    });

    const b64 = imageResponse.data?.[0]?.b64_json;
    if (!b64) {
      throw new Error('OpenAI response did not include image data.');
    }

    const combinedBuffer = Buffer.from(b64, 'base64');
    const panelBuffers = await splitIntoPanels(combinedBuffer, images.length);

    const screenshotRows = panelBuffers.map((buf, i) => ({
      batch_id: batchId,
      position: i,
      eyebrow: '',
      headline: '',
      supporting: '',
      icon: 'spark',
      // Storing as base64 data URLs for now, same as before — if/when you
      // move to actual Supabase Storage uploads, swap this for a real
      // storage_path and upload each `buf` there instead.
      storage_path: `data:image/png;base64,${buf.toString('base64')}`,
    }));

    const { error: ssError } = await supabase
      .from('screenshots')
      .insert(screenshotRows);

    if (ssError) {
      throw new Error(`Failed to save screenshots: ${ssError.message}`);
    }

    // Only deduct credits on success — see refund/no-charge-on-failure note below.
    await deductMockupCredits(userId, images.length, batchId);

    await supabase
      .from('batches')
      .update({ status: 'completed' })
      .eq('id', batchId);
  } catch (error: any) {
    console.error('Background generation error:', error);
    await supabase
      .from('batches')
      .update({
        status: 'failed',
        error_message: error?.message?.slice(0, 500) || 'Generation failed',
      })
      .eq('id', batchId);
    // No credits deducted, since deductMockupCredits is only called on the
    // success path above — user keeps their credits if generation fails.
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API Key is missing. Please add OPENAI_API_KEY to your environment.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { images, referenceImage, styleType } = body as {
      images: { base64: string; mediaType: string }[];
      referenceImage?: { base64: string; mediaType: string };
      styleType: '2D' | '3D';
    };

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    if (images.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: `Maximum ${MAX_BATCH_SIZE} screenshots per batch` },
        { status: 400 },
      );
    }

    // Check credits up front (fast fail), but DO NOT deduct yet — deduction
    // now happens only after a successful generation, inside runGeneration().
    const credits = await getCredits(user.id);
    if (credits < images.length) {
      return NextResponse.json(
        {
          error: `Insufficient credits. You need ${images.length} but have ${credits}.`,
          creditsNeeded: images.length,
          creditsRemaining: credits,
        },
        { status: 402 },
      );
    }

    // Create batch row with a 'processing' status immediately.
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .insert({
        user_id: user.id,
        palette: {},
        status: 'processing',
      })
      .select()
      .single();

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Failed to save batch' }, { status: 500 });
    }

    after(() =>
      runGeneration({
        batchId: batch.id,
        userId: user.id,
        images,
        referenceImage,
        styleType,
      })
    );

    // Return right away with just enough for the frontend to start polling.
    return NextResponse.json({
      batchId: batch.id,
      status: 'processing',
    });
  } catch (error: any) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
