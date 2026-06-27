'use client';

import Link from 'next/link';
import { PLANS } from '@/lib/types';

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* Navbar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        height: '60px',
        background: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <Link href="/" className="inline-flex items-center gap-0 no-underline">
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '17px',
              fontWeight: 700,
              letterSpacing: '-1.5px',
              color: 'var(--accent)',
            }}
          >
            Fire
          </span>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '17px',
              fontWeight: 700,
              letterSpacing: '-1.5px',
              color: 'var(--text-primary)',
            }}
          >
            shots
          </span>
        </Link>
        <Link href="/login" className="btn btn-ghost btn-sm">Log In</Link>
      </nav>

      <main style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '72px 24px' }}>

        {/* Header */}
        <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div className="badge badge-accent" style={{ marginBottom: '20px' }}>
            Simple credit pricing
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 700,
              letterSpacing: '-1.5px',
              color: 'var(--text-primary)',
              marginBottom: '12px',
            }}
          >
            Simple, transparent pricing
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.65 }}>
            1 credit = 1 finished screenshot · 1 credit = 4 AI revisions
          </p>
        </div>

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', alignItems: 'start', marginBottom: '72px' }}>
          {PLANS.map((plan, i) => {
            const isPopular = plan.id === 'pro';
            return (
              <div
                key={plan.id}
                className="animate-fade-in"
                style={{
                  background: '#ffffff',
                  border: isPopular ? '1.5px solid var(--accent)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '32px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  animationDelay: `${i * 120}ms`,
                }}
              >
                {isPopular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'var(--accent)',
                      color: '#ffffff',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                      padding: '4px 14px',
                      borderRadius: 'var(--radius-full)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Most popular
                  </div>
                )}

                {/* Plan name */}
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '16px',
                  }}
                >
                  {plan.name}
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', marginBottom: '4px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '44px',
                      fontWeight: 700,
                      letterSpacing: '-2px',
                      color: 'var(--text-primary)',
                      lineHeight: 1,
                    }}
                  >
                    ${plan.price}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                  per month
                </div>

                {/* Credits highlight */}
                <div
                  style={{
                    padding: '14px 16px',
                    background: 'var(--accent-tint)',
                    border: '1px solid var(--accent-border)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '24px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '20px',
                      fontWeight: 700,
                      letterSpacing: '-1px',
                      color: 'var(--accent-hover)',
                      marginBottom: '2px',
                    }}
                  >
                    {plan.credits} credits
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    = {plan.credits} screenshots
                  </div>
                </div>

                {/* Features */}
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', flex: 1 }}>
                  {[
                    `${plan.credits} AI generations`,
                    'Smart color matching',
                    'High-res PNG exports',
                    'AI copy revisions (0.25cr each)',
                  ].map((feature, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={`/api/checkout?plan=${plan.id}`}
                  className={`btn btn-lg ${isPopular ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {isPopular ? `Choose ${plan.name}` : `Choose ${plan.name}`}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Fine print */}
        <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '72px' }}>
          Credits top up monthly. Unused credits roll over for 1 month. Cancel anytime.
        </p>

        {/* FAQ */}
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '-1.5px',
              textAlign: 'center',
              marginBottom: '32px',
            }}
          >
            Frequently asked questions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <h4
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '-0.5px',
                  marginBottom: '8px',
                  color: 'var(--text-primary)',
                }}
              >
                What is a credit?
              </h4>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                One credit equals one generated marketing screenshot. Revising the AI copy costs 0.25 credits. Unused credits roll over as long as your subscription is active.
              </p>
            </div>
            <div className="card" style={{ padding: '20px' }}>
              <h4
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '-0.5px',
                  marginBottom: '8px',
                  color: 'var(--text-primary)',
                }}
              >
                Can I cancel anytime?
              </h4>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                Yes, manage or cancel your subscription at any time from your dashboard. You keep your existing credits until they run out or your billing period ends.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
