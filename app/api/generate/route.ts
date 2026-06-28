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
// Per-panel target is ~2:3 (portrait phone-like). We widen the canvas as
// panel count grows, but cap it so we never cross the 1:3–3:1 aspect ratio
// limit or the max resolution — past that cap, panels start getting
// genuinely squeezed again, which is the point at which splitting the
// batch into multiple calls (see chat) becomes the better move.
function pickCanvasSize(panelCount: number): { width: number; height: number } {
  const height = 1536; // fixed portrait height, matches phone aspect ratio
  const perPanelWidth = 1024; // gives each panel a ~2:3 phone-like ratio

  // Round width up to nearest multiple of 16, per API requirement.
  const rawWidth = perPanelWidth * panelCount;
  let width = Math.ceil(rawWidth / 16) * 16;

  // Enforce the 1:3–3:1 aspect ratio ceiling (width:height <= 3:1 here,
  // since we only ever go wider than tall in this flow).
  const maxWidthForRatio = height * 3;
  width = Math.min(width, maxWidthForRatio);

  // Enforce the documented max resolution.
  width = Math.min(width, 3840);

  return { width, height };
}

// Splits one combined PNG buffer into `panelCount` equal-width vertical
// slices. Assumes the model laid panels out left-to-right at equal widths,
// which is what our prompt explicitly asks for — if the model occasionally
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
  stylePrompt?: string,
) {
  const panelWord = images.length === 1 ? 'panel' : 'panels';
  const panelCountSpelled = images.length;

  const systemPrompt = `You are an expert App Store / Play Store screenshot designer.

You will receive a REFERENCE image first, followed by exactly ${panelCountSpelled}
RAW SCREENSHOT image(s) of the user's app.

=== PANEL COUNT — READ THIS FIRST ===
The REFERENCE image may visually show a different number of panels than what
you are asked to generate. IGNORE the REFERENCE image's panel count entirely.
The REFERENCE image is a STYLE GUIDE ONLY — copy its illustration style,
color palette, character design, and typography, but NOT its layout, grid,
or number of panels.

The ONLY thing that determines how many panels you output is the number of
RAW SCREENSHOT images provided. Exactly ${panelCountSpelled} RAW SCREENSHOT
image(s) were provided, so you must generate EXACTLY ${panelCountSpelled}
${panelWord}. Not more, not fewer.
${images.length === 1 ? `
This means: generate a SINGLE phone mockup with ONE headline and ONE
supporting line of subtext. Do NOT split the canvas into multiple frames.
Do NOT repeat or duplicate the screenshot side-by-side. Do NOT imitate a
multi-panel grid just because the REFERENCE image has one. There is only
one screenshot, so there is only one panel, period.` : `
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
in the correct position? If not, fix it before returning the result.`}
=== END PANEL COUNT ===

=== STYLE vs. SUBJECT MATTER — DO NOT CONFUSE THESE ===
The REFERENCE image teaches you a STYLE: line weight, shading technique,
color palette, roundness, typography, and overall illustration mood. It is
NOT a library of assets to copy.

Do NOT reuse the REFERENCE image's specific mascot, character, animal,
plant, or any named decorative prop (for example: if the REFERENCE shows a
cactus character, a wooden sign, or a trophy icon, do NOT draw that same
cactus, sign, or trophy in your output). Copying the reference's specific
character or props is WRONG even if the colors and line style match.

Instead, INVENT a new, original character and new decorative props that:
- Match the REFERENCE's illustration STYLE (rounded shapes, color palette,
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
3. Maintain identical background color treatment, font family/weight for
   headlines, and decorative motifs across all ${panelWord}, matching the
   REFERENCE image's STYLE only (palette, shading, typography) — never its
   specific subject matter, panel count, or layout.
4. Each panel must include a short headline (max 6 words) and one supporting
   line of subtext (max 10 words) above the phone mockup.
5. Render all text with perfect spelling, high contrast, and no distortion.
6. Output panels left-to-right in the same order as the input screenshots.
7. Do not add watermarks, logos, or placeholder text.
8. Do not add a second, third, or fourth phone frame beyond what is required
   to display the ${panelCountSpelled} provided screenshot(s).`;

  return stylePrompt
    ? `${systemPrompt}\n\nAdditional style direction from the user: ${stylePrompt}`
    : systemPrompt;
}

// The actual long-running work: calls OpenAI, then updates the batch row.
// Runs inside after(), so it continues executing after the response is sent.
async function runGeneration({
  batchId,
  userId,
  images,
  referenceImage,
  stylePrompt,
}: {
  batchId: string;
  userId: string;
  images: { base64: string; mediaType: string }[];
  referenceImage?: { base64: string; mediaType: string };
  stylePrompt?: string;
}) {
  const supabase = await createClient();

  try {
    const userPrompt = buildPrompt(images, stylePrompt);

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
      quality: 'low', // bump once validated
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
    const { images, referenceImage, stylePrompt } = body as {
      images: { base64: string; mediaType: string }[];
      referenceImage?: { base64: string; mediaType: string };
      stylePrompt?: string;
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

    // Schedule the actual generation to run after this response is sent.
    // The HTTP response below returns almost immediately; runGeneration()
    // keeps executing in the background up to maxDuration.
    after(() =>
      runGeneration({
        batchId: batch.id,
        userId: user.id,
        images,
        referenceImage,
        stylePrompt,
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
