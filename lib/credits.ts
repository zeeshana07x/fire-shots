import { createServiceClient } from './supabase/server';
import { CREDIT_COST_MOCKUP, CREDIT_COST_REVISION } from './types';

export async function getCredits(userId: string): Promise<number> {
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from('profiles')
    .select('credits_remaining')
    .eq('id', userId)
    .single();
  return data?.credits_remaining ?? 0;
}

export async function deductMockupCredits(
  userId: string,
  count: number,
  batchId: string,
): Promise<{ ok: boolean; remaining: number }> {
  const supabase = await createServiceClient();
  const cost = count * CREDIT_COST_MOCKUP;

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_remaining')
    .eq('id', userId)
    .single();

  if (!profile || profile.credits_remaining < cost) {
    return { ok: false, remaining: profile?.credits_remaining ?? 0 };
  }

  const newBalance = profile.credits_remaining - cost;

  await supabase
    .from('profiles')
    .update({ credits_remaining: newBalance })
    .eq('id', userId);

  await supabase.from('credit_transactions').insert({
    user_id: userId,
    delta: -cost,
    reason: 'mockup_generated',
    batch_id: batchId,
  });

  return { ok: true, remaining: newBalance };
}

export async function deductRevisionCredit(
  userId: string,
  screenshotId: string,
): Promise<{ ok: boolean; remaining: number }> {
  const supabase = await createServiceClient();
  const cost = CREDIT_COST_REVISION;

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_remaining')
    .eq('id', userId)
    .single();

  if (!profile || profile.credits_remaining < cost) {
    return { ok: false, remaining: profile?.credits_remaining ?? 0 };
  }

  const newBalance = Math.max(0, profile.credits_remaining - cost);

  await supabase
    .from('profiles')
    .update({ credits_remaining: newBalance })
    .eq('id', userId);

  await supabase.from('credit_transactions').insert({
    user_id: userId,
    delta: -cost,
    reason: 'revision_used',
    screenshot_id: screenshotId,
  });

  return { ok: true, remaining: newBalance };
}

export async function grantSubscriptionCredits(
  userId: string,
  plan: string,
  credits: number,
): Promise<void> {
  const supabase = await createServiceClient();

  await supabase
    .from('profiles')
    .update({ credits_remaining: credits, plan })
    .eq('id', userId);

  await supabase.from('credit_transactions').insert({
    user_id: userId,
    delta: credits,
    reason: `subscription_${plan}`,
  });
}
