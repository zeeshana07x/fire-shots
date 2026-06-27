'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface AppNavProps {
  credits?: number;
  userEmail?: string;
}

export default function AppNav({ credits = 0, userEmail }: AppNavProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const initials = userEmail ? userEmail[0].toUpperCase() : 'A';

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        height: '56px',
        background: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 700, letterSpacing: '-1.5px', color: 'var(--accent)' }}>
          Fire
        </span>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 700, letterSpacing: '-1.5px', color: 'var(--text-primary)' }}>
          shots
        </span>
      </Link>

      {/* Right: Upgrade · credits · avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Link
          href="/pricing"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            padding: '6px 13px',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            transition: 'border-color 0.15s, color 0.15s',
          }}
        >
          Upgrade
        </Link>

        <div
          className="badge badge-accent"
          style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600 }}
        >
          {credits} credits
        </div>

        <button
          onClick={handleSignOut}
          title={userEmail ?? 'Sign out'}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--accent-tint)',
            border: '1px solid var(--accent-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-heading)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '-0.5px',
            color: 'var(--accent-hover)',
            cursor: 'pointer',
          }}
        >
          {initials}
        </button>
      </div>
    </nav>
  );
}
