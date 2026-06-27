'use client';

import Link from 'next/link';
import { PLANS } from '@/lib/types';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Navbar Minimal */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-6 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <Link href="/" className="inline-flex items-center gap-2 no-underline">
          <span className="text-2xl">🔥</span>
          <span className="font-display text-xl font-extrabold text-[var(--text-primary)] tracking-tight">Fireshots</span>
        </Link>
        <Link href="/login" className="btn btn-ghost font-medium">Log In</Link>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="font-display text-4xl lg:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Get professional, store-ready marketing mockups in seconds. No complex design software, just upload and go.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {PLANS.map((plan, i) => {
            const isPopular = plan.id === 'pro';
            return (
              <div 
                key={plan.id}
                className={`card animate-fade-in p-8 relative flex flex-col ${isPopular ? 'border-2 border-[var(--accent)] shadow-xl scale-105 z-10' : ''}`}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {isPopular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 badge badge-accent px-3 py-1 text-xs">
                    Most Popular
                  </span>
                )}
                
                <h3 className="font-display text-2xl font-bold capitalize mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-display text-5xl font-extrabold">${plan.price}</span>
                  <span className="text-[var(--text-secondary)] font-medium">/mo</span>
                </div>
                
                <div className="p-4 rounded-xl bg-[var(--bg-inset)] mb-8">
                  <div className="text-lg font-bold text-[var(--accent)] mb-1">{plan.credits} Credits</div>
                  <div className="text-sm text-[var(--text-secondary)]">~{plan.credits} generated mockups</div>
                </div>

                <ul className="flex flex-col gap-4 mb-8 flex-1">
                  {[
                    `${plan.credits} AI generations`,
                    'Smart color matching',
                    'High-res PNG exports',
                    'AI copy revisions (0.25cr each)',
                  ].map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-[var(--text-secondary)] font-medium">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--success)] shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link 
                  href={`/api/checkout?plan=${plan.id}`} 
                  className={`btn btn-lg w-full ${isPopular ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Subscribe
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-24 max-w-3xl mx-auto animate-fade-in delay-300">
          <h2 className="font-display text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold mb-2">What is a credit?</h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                One credit equals one generated marketing screenshot. Revising the AI copy on a generated screenshot costs 0.25 credits. Unused credits roll over as long as your subscription is active.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Can I cancel anytime?</h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Yes, you can manage or cancel your subscription at any time from your dashboard. You will keep your existing credits until they run out or your billing period ends.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
