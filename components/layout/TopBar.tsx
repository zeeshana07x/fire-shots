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
        height: 56,
        background: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Page Title */}
      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '17px',
          fontWeight: 700,
          letterSpacing: '-1px',
          color: 'var(--text-primary)',
        }}
      >
        {title}
      </h1>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Credit Badge */}
        <div className="badge badge-accent">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {credits} credits
        </div>

        {/* Upgrade Link */}
        <Link href="/pricing" className="btn btn-primary btn-sm no-underline">
          Upgrade
        </Link>
      </div>
    </header>
  );
}
