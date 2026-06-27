'use client';

import Link from 'next/link';
import { PLANS } from '@/lib/types';

interface CreditMeterProps {
  credits: number;
  plan: string;
}

export default function CreditMeter({ credits, plan }: CreditMeterProps) {
  const planData = PLANS.find((p) => p.id === plan);
  const maxCredits = planData?.credits ?? 30;
  const percentage = Math.min((credits / maxCredits) * 100, 100);
  const isStarter = plan === 'starter';

  return (
    <div className="card p-6 flex flex-col items-center gap-5 animate-fade-in">
      {/* Plan Badge */}
      <span className="badge badge-accent">
        {planData?.name ?? 'Starter'} Plan
      </span>

      {/* Credit Number */}
      <div className="text-center">
        <p
          className="font-display font-bold leading-none"
          style={{ fontSize: 48, color: 'var(--text-primary)' }}
        >
          {credits}
        </p>
        <p className="text-sm mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
          credits remaining
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs">
        <div
          className="w-full overflow-hidden"
          style={{
            height: 8,
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-inset)',
          }}
        >
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${percentage}%`,
              borderRadius: 'var(--radius-full)',
              background:
                percentage > 20
                  ? 'var(--accent)'
                  : 'var(--amber)',
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            0
          </span>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {maxCredits}
          </span>
        </div>
      </div>

      {/* Upgrade CTA */}
      {isStarter && (
        <Link
          href="/pricing"
          className="btn btn-primary btn-sm no-underline mt-1"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 12V2" />
            <polyline points="3,6 7,2 11,6" />
          </svg>
          Upgrade Plan
        </Link>
      )}
    </div>
  );
}
