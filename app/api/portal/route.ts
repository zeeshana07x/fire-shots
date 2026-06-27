import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { polar } from '@/lib/polar';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('polar_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.polar_customer_id) {
      return NextResponse.redirect(new URL('/pricing', req.url));
    }

    const session = await polar.customerSessions.create({
      customerId: profile.polar_customer_id,
    });

    return NextResponse.redirect(session.customerPortalUrl);
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.redirect(new URL('/dashboard?error=portal_failed', req.url));
  }
}
