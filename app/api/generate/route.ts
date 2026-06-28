import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import { deductMockupCredits, getCredits } from '@/lib/credits';
import { MAX_BATCH_SIZE } from '@/lib/types';

export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  timeout: 120000, // 120 seconds timeout to allow large image uploads
  maxRetries: 2,
});

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

    // Check credits
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

    // Create batch in DB
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .insert({
        user_id: user.id,
        palette: {}, // We don't use palette anymore
      })
      .select()
      .single();

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Failed to save batch' }, { status: 500 });
    }

    const systemPrompt = `You are an expert App Store / Play Store screenshot designer operating gpt-image-2.

You will receive:
- One REFERENCE image: defines the illustration style, color palette, character
  design, typography style, and panel layout to replicate.
- Between 1 and 10 RAW SCREENSHOT images: real screenshots of the user's app,
  each to be placed inside a phone mockup frame.
- A metadata block describing app name, panel count, and per-panel captions.

Your job: generate one cohesive multi-panel marketing screenshot SET, where
every panel shares the same character(s), color palette, typography, and
illustration style as the REFERENCE image, but each panel's phone frame
displays the content from the corresponding RAW SCREENSHOT.

Hard rules:
1. NEVER redraw, distort, blur, or stylize the contents of the phone screen
   itself. The screen content must remain crisp, accurate, and pixel-faithful
   to the raw screenshot provided. Treat the screen area as a "window" — only
   the background, characters, decorations, and headline text around the
   phone may be illustrated/stylized.
2. Maintain identical character design (face, outfit, color) across all
   panels in the set. Do not let character appearance drift panel-to-panel.
3. Maintain identical background color treatment, font family/weight for
   headlines, and decorative motifs (stars, hearts, sparkles, etc.) across
   all panels, matching the REFERENCE image's style.
4. Each panel must include: a short headline (max 6 words), one supporting
   line of subtext (max 10 words), and the phone mockup with the raw
   screenshot inserted.
5. Render all text with perfect spelling, high contrast, and no distortion.
   Keep text blocks short — never invent additional UI text beyond what is
   given in the metadata.
6. Output panels in the same left-to-right order as the input screenshots.
7. If a requested panel count exceeds what can be rendered with full
   legibility, prioritize fewer, higher-quality panels over cramming.

Do not add watermarks, logos, or placeholder text. Do not alter the aspect
ratio away from the one specified in the metadata.`;

    const content: any[] = [
      { type: 'text', text: systemPrompt },
    ];

    if (referenceImage) {
      content.push({ type: 'text', text: 'REFERENCE IMAGE:' });
      content.push({
        type: 'image_url',
        image_url: { url: `data:${referenceImage.mediaType};base64,${referenceImage.base64}` }
      });
    }

    content.push({ type: 'text', text: `RAW SCREENSHOT IMAGES (${images.length} panels):` });
    images.forEach((img, index) => {
       content.push({ type: 'text', text: `Screenshot ${index + 1}:` });
       content.push({
         type: 'image_url',
         image_url: { url: `data:${img.mediaType};base64,${img.base64}` }
       });
    });

    const imageResponse = await openai.images.generate({
      model: "gpt-image-2",
      prompt: content as any, // Passing the complex content array
      n: images.length, // Generate as many images as there are screenshots in the batch
      size: "1024x1792"
    });

    if (!imageResponse.data || imageResponse.data.length === 0) {
      throw new Error("OpenAI returned an empty image response.");
    }

    const generatedScreenshots = [];
    for (let i = 0; i < imageResponse.data.length; i++) {
      const b64 = imageResponse.data[i].b64_json;
      if (!b64) continue; // If an image failed, skip it
      
      const generatedUrl = `data:image/png;base64,${b64}`;
      generatedScreenshots.push({
        batch_id: batch.id,
        position: i,
        eyebrow: '',
        headline: '',
        supporting: '',
        icon: 'spark',
        storage_path: generatedUrl
      });
    }

    // Save screenshots to DB
    const { data: savedScreenshots, error: ssError } = await supabase
      .from('screenshots')
      .insert(generatedScreenshots)
      .select();

    if (ssError) {
      return NextResponse.json({ error: 'Failed to save screenshots' }, { status: 500 });
    }

    // Deduct credits
    const deduction = await deductMockupCredits(user.id, images.length, batch.id);
    if (!deduction.ok) {
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 });
    }

    return NextResponse.json({
      batchId: batch.id,
      screenshots: savedScreenshots,
      creditsRemaining: deduction.remaining,
    });
  } catch (error: any) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
