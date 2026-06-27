'use client';

import Link from 'next/link';

interface TopBarProps {
  title: string;
  credits?: number;
}

export default function TopBar({ title, credits = 0 }: TopBarProps) {
  return (
    <header
      className="flex items-center justify-between px-6 shrink-0"
      style={{
        height: 60,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Page Title */}
      <h1 className="font-display text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h1>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Credit Badge */}
        <div className="badge badge-amber">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {credits} credits
        </div>

        {/* Buy Credits Link */}
        <Link
          href="/pricing"
          className="btn btn-sm btn-primary no-underline"
        >
          Buy Credits
        </Link>
      </div>
    </header>
  );
}
