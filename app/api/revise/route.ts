import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { anthropic } from '@/lib/anthropic';
import { deductRevisionCredit } from '@/lib/credits';

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
    const { screenshotId, instruction, currentContent } = body as {
      screenshotId: string;
      instruction: string;
      currentContent: {
        eyebrow: string;
        headline: string;
        supporting: string;
        icon: string;
      };
    };

    if (!screenshotId || !instruction || !currentContent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify ownership
    const { data: screenshot } = await supabase
      .from('screenshots')
      .select('*, batches!inner(user_id)')
      .eq('id', screenshotId)
      .single();

    if (!screenshot || (screenshot.batches as { user_id: string }).user_id !== user.id) {
      return NextResponse.json({ error: 'Screenshot not found' }, { status: 404 });
    }

    // Check credits
    const deduction = await deductRevisionCredit(user.id, screenshotId);
    if (!deduction.ok) {
      return NextResponse.json(
        {
          error: 'Insufficient credits for revision. 1 credit = 4 revisions.',
          creditsRemaining: deduction.remaining,
        },
        { status: 402 },
      );
    }

    // AI revision — no image needed, just text
    const prompt = `You are a professional app store marketing specialist. Here is the current marketing copy for an app screenshot:

Eyebrow: ${currentContent.eyebrow}
Headline: ${currentContent.headline}
Supporting: ${currentContent.supporting}
Icon: ${currentContent.icon}

The user wants you to revise this content based on the following instruction:
"${instruction}"

Rules:
- eyebrow: 2-3 words
- headline: 2-4 words, benefit-first, plain language, no exclamation marks, no buzzwords
- supporting: under 90 characters
- icon: must be exactly one of: spark, stack, bolt, check, heart, shield, star, grid

Return ONLY valid JSON, no markdown fences:
{
  "eyebrow": "...",
  "headline": "...",
  "supporting": "...",
  "icon": "..."
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'AI returned no text response' }, { status: 500 });
    }

    let parsed;
    try {
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

    // Update in DB
    await supabase
      .from('screenshots')
      .update({
        eyebrow: parsed.eyebrow,
        headline: parsed.headline,
        supporting: parsed.supporting,
        icon: parsed.icon,
        updated_at: new Date().toISOString(),
      })
      .eq('id', screenshotId);

    return NextResponse.json({
      ...parsed,
      creditsRemaining: deduction.remaining,
    });
  } catch (error) {
    console.error('Revise error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
