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
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5L10 4l7 6.5" />
        <path d="M5 9.5V16a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V9.5" />
      </svg>
    ),
  },
  {
    label: 'Studio',
    href: '/studio',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 3l1.5 4L17 8l-3.5 3L14.5 16 11 13.5 7.5 16 8.5 11 5 8l4.5-1z" />
        <path d="M3 17l2-6" />
      </svg>
    ),
  },
  {
    label: 'Pricing',
    href: '/pricing',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
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
        width: 240,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-8">
        <Link href="/dashboard" className="flex items-center gap-2 no-underline">
          <span className="text-xl">🔥</span>
          <span
            className="font-display text-lg font-bold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Fireshots
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-all duration-150"
              style={{
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-light)' : 'transparent',
                borderLeft: isActive
                  ? '3px solid var(--accent)'
                  : '3px solid transparent',
              }}
            >
              <span
                className="flex items-center"
                style={{ color: isActive ? 'var(--accent)' : 'var(--text-tertiary)' }}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Credits mini badge */}
      <div className="px-4 pb-3">
        <div
          className="flex items-center justify-between px-3 py-2 rounded-lg"
          style={{ background: 'var(--amber-light)', border: '1px solid #FDE68A' }}
        >
          <span className="text-xs font-semibold" style={{ color: 'var(--amber-text)' }}>Credits</span>
          <span className="font-display text-base font-bold" style={{ color: 'var(--text-primary)' }}>{credits}</span>
        </div>
      </div>

      {/* Bottom User Section */}
      <div
        className="px-4 py-4 flex items-center gap-3"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        {/* Avatar */}
        <div
          className="flex items-center justify-center rounded-full font-display text-xs font-bold shrink-0"
          style={{
            width: 34,
            height: 34,
            background: 'var(--accent-light)',
            color: 'var(--accent)',
          }}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div
            className="text-xs truncate"
            style={{ color: 'var(--text-secondary)' }}
          >
            {userEmail ?? 'Account'}
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="btn-ghost p-1.5 rounded-md"
          title="Sign out"
          style={{ color: 'var(--text-tertiary)', cursor: 'pointer', background: 'none', border: 'none' }}
        >
          <svg
            width="18"
            height="18"
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
