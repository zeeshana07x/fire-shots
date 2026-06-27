'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface SidebarProps {
  userEmail?: string;
  credits?: number;
}

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5L10 4l7 6.5" />
        <path d="M5 9.5V16a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V9.5" />
      </svg>
    ),
  },
  {
    label: 'Studio',
    href: '/studio',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 3l1.5 4L17 8l-3.5 3L14.5 16 11 13.5 7.5 16 8.5 11 5 8l4.5-1z" />
        <path d="M3 17l2-6" />
      </svg>
    ),
  },
  {
    label: 'Pricing',
    href: '/pricing',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h7l5 5-7 7-5-5V4z" />
        <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export default function Sidebar({ userEmail, credits = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const initials = userEmail ? userEmail[0].toUpperCase() : '?';

  return (
    <aside
      className="flex flex-col h-screen shrink-0"
      style={{
        width: 220,
        background: '#ffffff',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 20px 24px' }}>
        <Link href="/dashboard" className="inline-flex items-center gap-0 no-underline">
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
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-sm no-underline transition-all duration-150"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--accent-hover)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-tint)' : 'transparent',
              }}
            >
              <span style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Credits pill */}
      <div style={{ padding: '0 12px 12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-tint)',
            border: '1px solid var(--accent-border)',
          }}
        >
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--accent-hover)' }}>
            Credits
          </span>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--accent-hover)' }}>
            {credits}
          </span>
        </div>
      </div>

      {/* Bottom User Section */}
      <div
        style={{
          padding: '12px 12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--accent-tint)',
            border: '1px solid var(--accent-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-heading)',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--accent-hover)',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {userEmail ?? 'Account'}
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          title="Sign out"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.15s',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 15H4a1 1 0 01-1-1V4a1 1 0 011-1h2" />
            <polyline points="11,12 15,9 11,6" />
            <line x1="15" y1="9" x2="7" y2="9" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
