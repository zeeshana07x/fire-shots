import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { grantSubscriptionCredits } from '@/lib/credits';
import { PLAN_CREDITS } from '@/lib/polar';
import crypto from 'crypto';

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const digest = hmac.digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('webhook-signature') ?? '';
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET ?? '';

    if (webhookSecret && !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const { type, data } = event;

    const supabase = await createServiceClient();

    switch (type) {
      case 'subscription.created':
      case 'subscription.updated': {
        const subscription = data;
        const metadata = subscription.metadata ?? {};
        const userId: string = metadata.userId ?? '';
        const plan: string = metadata.plan ?? '';
        const customerId: string = subscription.customerId ?? '';

        if (!userId || !plan) break;

        const credits = PLAN_CREDITS[plan] ?? 0;

        // Store polar customer id
        await supabase
          .from('profiles')
          .update({ polar_customer_id: customerId })
          .eq('id', userId);

        // Grant credits + update plan (only on creation or plan change)
        if (type === 'subscription.created') {
          await grantSubscriptionCredits(userId, plan, credits);
        } else {
          // On update: only change plan name, don't reset credits
          await supabase
            .from('profiles')
            .update({ plan })
            .eq('id', userId);
        }
        break;
      }

      case 'subscription.canceled':
      case 'subscription.revoked': {
        const subscription = data;
        const metadata = subscription.metadata ?? {};
        const userId: string = metadata.userId ?? '';
        if (!userId) break;

        await supabase
          .from('profiles')
          .update({ plan: 'none' })
          .eq('id', userId);
        break;
      }

      case 'order.created': {
        // Handled via subscription events — no action needed
        break;
      }

      default:
        // Ignore unrecognized events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
