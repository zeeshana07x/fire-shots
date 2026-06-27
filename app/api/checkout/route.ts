import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { polar, PLAN_PRODUCT_IDS } from '@/lib/polar';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/login?next=/pricing', req.url));
    }

    const plan = req.nextUrl.searchParams.get('plan');
    if (!plan || !PLAN_PRODUCT_IDS[plan]) {
      return NextResponse.redirect(new URL('/pricing', req.url));
    }

    const productId = PLAN_PRODUCT_IDS[plan];

    // Get or create Polar customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('polar_customer_id')
      .eq('id', user.id)
      .single();

    const checkoutParams: Record<string, string> = {
      productId,
      customerEmail: user.email ?? '',
      metadata: JSON.stringify({ userId: user.id, plan }),
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true`,
    };

    if (profile?.polar_customer_id) {
      checkoutParams.customerId = profile.polar_customer_id;
    }

    const checkout = await polar.checkouts.create({
      productId,
      customerEmail: user.email ?? '',
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true`,
      metadata: { userId: user.id, plan },
    });

    return NextResponse.redirect(checkout.url);
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.redirect(new URL('/pricing?error=checkout_failed', req.url));
  }
}
