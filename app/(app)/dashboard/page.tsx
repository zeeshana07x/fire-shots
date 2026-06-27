import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import AppNav from '@/components/layout/AppNav';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDelta(delta: number) {
  return delta > 0 ? `+${delta}` : `${delta}`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_remaining, plan')
    .eq('id', user!.id)
    .single();

  const { data: batches } = await supabase
    .from('batches')
    .select('*, screenshots(id, position, eyebrow, headline, icon, storage_path)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(6);

  const { data: transactions } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const credits = profile?.credits_remaining ?? 0;
  const plan = profile?.plan ?? 'none';

  const planCredits: Record<string, number> = { starter: 30, pro: 150, studio: 400, none: 0 };
  const maxCredits = planCredits[plan] || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Top Navbar */}
      <AppNav credits={credits} userEmail={user?.email} />

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '48px 24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 'var(--max-width)' }}>
          {/* Header */}
          <div className="animate-fade-in" style={{ marginBottom: '40px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '28px',
                  fontWeight: 700,
                  letterSpacing: '-1.5px',
                  marginBottom: '5px',
                }}
              >
                Your workspace
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: '14px' }}>
                Upload screenshots and turn them into store-ready images
              </p>
            </div>
            <Link href="/studio" className="btn btn-primary btn-sm">
              + New batch
            </Link>
          </div>

          {/* Stats Row */}
          <div className="animate-fade-in delay-75" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
            {[
              { value: credits, label: 'Credits remaining', color: 'var(--accent-hover)' },
              { value: batches?.length ?? 0, label: 'Batches created', color: '#6366f1' },
              { value: batches?.reduce((acc, b) => acc + ((b.screenshots as unknown[])?.length ?? 0), 0) ?? 0, label: 'Screenshots made', color: 'var(--accent-hover)' },
            ].map((stat, i) => (
              <div
                key={i}
                className="card"
                style={{ padding: '24px 28px' }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '40px',
                    fontWeight: 700,
                    letterSpacing: '-2px',
                    color: stat.color,
                    lineHeight: 1,
                    marginBottom: '6px',
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Credit progress */}
          <div className="animate-fade-in delay-75 card" style={{ padding: '24px 28px', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                Credit Balance
              </span>
              <span className="badge badge-accent" style={{ textTransform: 'capitalize' }}>
                {plan === 'none' ? 'No Plan' : plan}
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: '5px', background: 'var(--bg-input)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '16px' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, (credits / maxCredits) * 100)}%`,
                  background: credits < 5 ? 'var(--error)' : 'var(--accent)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Link href="/studio" className="btn btn-primary btn-sm">Open Studio</Link>
              <Link href="/api/portal" className="btn btn-ghost btn-sm">Manage Plan</Link>
            </div>
          </div>

          {/* Past Batches */}
          <div className="animate-fade-in delay-150" style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '17px',
                  fontWeight: 700,
                  letterSpacing: '-1px',
                  color: 'var(--text-primary)',
                }}
              >
                Past batches
              </h2>
            </div>

            {!batches || batches.length === 0 ? (
              <div
                className="card"
                style={{ padding: '56px 32px', textAlign: 'center' }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-tint)',
                    border: '1px solid var(--accent-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
                    <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8m-4-4h8"/>
                  </svg>
                </div>
                <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '15px', letterSpacing: '-0.5px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  No batches yet
                </p>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
                  Head to Studio to generate your first batch of marketing screenshots.
                </p>
                <Link href="/studio" className="btn btn-primary btn-sm">Go to Studio</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                {batches.map((batch, i) => {
                  const screenshots = (batch.screenshots as Array<{ id: string; position: number; eyebrow: string; headline: string; icon: string; storage_path: string | null }> | undefined) ?? [];
                  const palette = batch.palette as { bg: string; bg2: string; accent: string } | null;
                  return (
                    <Link
                      key={batch.id}
                      href={`/studio?batch=${batch.id}`}
                      className="animate-fade-in no-underline"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px 20px',
                        background: '#ffffff',
                        transition: 'background 0.15s',
                        animationDelay: `${i * 50}ms`,
                        textDecoration: 'none',
                      }}
                    >
                      {/* Palette swatches / thumbnail area */}
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        {palette && [palette.bg, palette.bg2, palette.accent].filter(Boolean).map((color, ci) => (
                          <div
                            key={ci}
                            style={{
                              width: '36px',
                              height: '48px',
                              borderRadius: '6px',
                              background: color,
                              border: '1px solid var(--border-subtle)',
                            }}
                          />
                        ))}
                        {(!palette) && (
                          <>
                            <div style={{ width: '36px', height: '48px', borderRadius: '6px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }} />
                            <div style={{ width: '36px', height: '48px', borderRadius: '6px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }} />
                            <div style={{ width: '36px', height: '48px', borderRadius: '6px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }} />
                          </>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '14px', letterSpacing: '-0.5px', color: 'var(--text-primary)', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {screenshots[0]?.headline || 'Untitled batch'}
                        </p>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
                          {formatDate(batch.created_at)} · {screenshots.length} screenshots · {screenshots.length} credits used
                        </p>
                      </div>

                      {/* Badge */}
                      <span className="badge badge-neutral" style={{ flexShrink: 0 }}>
                        {screenshots.length} credits
                      </span>

                      {/* Arrow */}
                      <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Usage History */}
          <div className="animate-fade-in delay-225">
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '17px',
                fontWeight: 700,
                letterSpacing: '-1px',
                marginBottom: '16px',
                color: 'var(--text-primary)',
              }}
            >
              Usage History
            </h2>
            {!transactions || transactions.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: '14px' }}>
                No transactions yet.
              </p>
            ) : (
              <div className="card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-input)' }}>
                      {['Date', 'Action', 'Credits'].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: '10px 18px',
                            textAlign: 'left',
                            fontFamily: 'var(--font-body)',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.07em',
                            borderBottom: '1px solid var(--border-subtle)',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, i) => (
                      <tr
                        key={tx.id}
                        style={{ borderBottom: i < transactions.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                      >
                        <td style={{ padding: '12px 18px', fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>
                          {formatDate(tx.created_at)}
                        </td>
                        <td style={{ padding: '12px 18px', fontFamily: 'var(--font-body)', color: 'var(--text-primary)', fontWeight: 500, textTransform: 'capitalize' }}>
                          {tx.reason.replace(/_/g, ' ')}
                        </td>
                        <td style={{ padding: '12px 18px' }}>
                          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: '-0.5px', color: tx.delta > 0 ? 'var(--accent)' : 'var(--error)', fontSize: '13px' }}>
                            {formatDelta(Number(tx.delta))}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
