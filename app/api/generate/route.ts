import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { anthropic } from '@/lib/anthropic';
import { deductMockupCredits, getCredits } from '@/lib/credits';
import { MAX_BATCH_SIZE } from '@/lib/types';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { images } = body as { images: { base64: string; mediaType: string }[] };

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

    // Build Claude message with all images
    const imageBlocks = images.map((img) => ({
      type: 'image' as const,
      source: {
        type: 'base64' as const,
        media_type: img.mediaType as 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif',
        data: img.base64,
      },
    }));

    const prompt = `You are a professional app store marketing specialist. You are looking at ${images.length} app screenshots that belong to the same app.

Analyze all screenshots together as a cohesive set and return a JSON response with:

1. ONE unified color palette derived from the actual UI colors visible across all screenshots. The palette should feel professional and work well as marketing screenshot backgrounds.

2. For EACH screenshot (in the same order they were provided), generate:
   - eyebrow: a short 2-3 word category label (e.g., "Quick Setup", "Smart Search")
   - headline: a punchy 2-4 word benefit-first description of what's shown. Use plain language. No exclamation marks. No generic marketing buzzwords like "revolutionize", "seamless", "unleash", "transform", "supercharge".
   - supporting: one sentence under 90 characters describing the feature shown
   - icon: choose exactly one from this fixed set that best matches what the screen shows: spark, stack, bolt, check, heart, shield, star, grid

Return ONLY valid JSON in this exact format, no markdown fences, no extra text:
{
  "palette": {
    "bg": "#hex (gradient start, derived from app's primary color, lightened)",
    "bg2": "#hex (gradient end, slightly different shade)",
    "text": "#hex (readable text color on the gradient bg)",
    "accent": "#hex (vibrant accent from the app's UI)",
    "card1": "#hex (decorative card color 1, semi-transparent feel)",
    "card2": "#hex (decorative card color 2, complementary)"
  },
  "screenshots": [
    {
      "eyebrow": "...",
      "headline": "...",
      "supporting": "...",
      "icon": "spark|stack|bolt|check|heart|shield|star|grid"
    }
  ]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [...imageBlocks, { type: 'text' as const, text: prompt }],
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'AI returned no text response' }, { status: 500 });
    }

    let parsed;
    try {
      // Strip any markdown fencing if present
      let rawText = textContent.text.trim();
      if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```$/, '');
      }
      parsed = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { error: 'AI returned invalid JSON. Please try again.' },
        { status: 500 },
      );
    }

    // Create batch in DB
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .insert({
        user_id: user.id,
        palette: parsed.palette,
      })
      .select()
      .single();

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Failed to save batch' }, { status: 500 });
    }

    // Save screenshots
    const screenshotInserts = parsed.screenshots.map(
      (s: { eyebrow: string; headline: string; supporting: string; icon: string }, i: number) => ({
        batch_id: batch.id,
        position: i,
        eyebrow: s.eyebrow,
        headline: s.headline,
        supporting: s.supporting,
        icon: s.icon,
      }),
    );

    const { data: savedScreenshots, error: ssError } = await supabase
      .from('screenshots')
      .insert(screenshotInserts)
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
      palette: parsed.palette,
      screenshots: savedScreenshots,
      creditsRemaining: deduction.remaining,
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
