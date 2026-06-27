import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import { deductMockupCredits, getCredits } from '@/lib/credits';
import { MAX_BATCH_SIZE } from '@/lib/types';

export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
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

    // Process each image sequentially (to avoid rate limits or timeout, but Vercel limits to 60s)
    // For production, this should ideally be asynchronous or use batch API.
    const generatedScreenshots = [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      
      // Step 1: Use GPT-4o to write the DALL-E prompt
      const content = [
        { type: 'text', text: `You are an expert prompt engineer for DALL-E 3. We are generating an App Store mockup. 
          The user uploaded a screenshot of their app UI. We want to generate a final 3D marketing image.
          ${stylePrompt ? `The user requested this specific style: "${stylePrompt}"` : 'Make it a highly stylized, modern 3D illustration.'}
          Please write a highly detailed DALL-E 3 image generation prompt that describes the scene, the style, and explicitly mentions placing a generic phone displaying the app UI in the center. Write ONLY the prompt, no introductory text.` },
        {
          type: 'image_url',
          image_url: { url: `data:${img.mediaType};base64,${img.base64}` }
        }
      ];

      if (referenceImage) {
        content.push({ type: 'text', text: 'Use this reference image for the overall art style and layout:' });
        content.push({
          type: 'image_url',
          image_url: { url: `data:${referenceImage.mediaType};base64,${referenceImage.base64}` }
        });
      }

      const gptResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: content as any }],
        max_tokens: 500,
      });

      const dallePrompt = gptResponse.choices[0].message.content || 'A 3D mobile app store mockup...';

      // Step 2: Call GPT Image 2
      const dalleResponse = await openai.images.generate({
        model: "gpt-image-2",
        prompt: dallePrompt,
        n: 1,
        size: "1024x1792", // DALL-E 3 supports vertical format
        response_format: "b64_json"
      });

      const b64 = dalleResponse.data[0].b64_json;
      const generatedUrl = `data:image/png;base64,${b64}`;

      generatedScreenshots.push({
        batch_id: batch.id,
        position: i,
        eyebrow: '',
        headline: '',
        supporting: '',
        icon: 'spark',
        storage_path: generatedUrl // Store the data URL so the frontend can render it directly
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
