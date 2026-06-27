import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

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
    <div style={{ padding: '40px', maxWidth: '960px' }}>
      {/* Header */}
      <div className="animate-fade-in" style={{ marginBottom: '40px' }}>
        <h1 className="font-display" style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '6px' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Welcome back — your workspace and credits at a glance.
        </p>
      </div>

      {/* Credits card */}
      <div className="animate-fade-in delay-75" style={{ marginBottom: '32px' }}>
        <div className="card" style={{ padding: '28px 32px', display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <h2 className="font-display" style={{ fontSize: '18px', fontWeight: 700 }}>Credit Balance</h2>
              <span className={`badge ${plan === 'none' ? 'badge-neutral' : 'badge-accent'}`} style={{ textTransform: 'capitalize' }}>
                {plan === 'none' ? 'No Plan' : plan}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
              <span className="font-display" style={{ fontSize: '52px', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', lineHeight: 1 }}>
                {credits}
              </span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '16px' }}>credits remaining</span>
            </div>
            {/* Progress bar */}
            <div style={{ height: '6px', background: 'var(--bg-inset)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '20px' }}>
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
              <Link href="/api/portal" className="btn btn-secondary btn-sm">Manage Plan</Link>
            </div>
          </div>
          {/* Usage hint */}
          <div className="card-inset" style={{ padding: '20px 24px', minWidth: '220px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Usage Rate</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>1 mockup</span>
                <span style={{ fontWeight: 600 }}>1 credit</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>AI revision</span>
                <span style={{ fontWeight: 600 }}>0.25 credit</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="animate-fade-in delay-150" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 className="font-display" style={{ fontSize: '20px', fontWeight: 700 }}>Recent Projects</h2>
          <Link href="/studio" className="btn btn-ghost btn-sm" style={{ gap: '6px' }}>
            New project
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </Link>
        </div>

        {!batches || batches.length === 0 ? (
          <div
            className="card-inset"
            style={{ padding: '48px 32px', textAlign: 'center' }}
          >
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎨</div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>No projects yet</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
              Head to Studio to generate your first batch of marketing screenshots.
            </p>
            <Link href="/studio" className="btn btn-primary btn-sm">Go to Studio</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {batches.map((batch, i) => {
              const screenshots = (batch.screenshots as Array<{ id: string; position: number; eyebrow: string; headline: string; icon: string; storage_path: string | null }> | undefined) ?? [];
              const palette = batch.palette as { bg: string; bg2: string; accent: string } | null;
              return (
                <div
                  key={batch.id}
                  className="card animate-fade-in"
                  style={{ padding: '20px', animationDelay: `${i * 60}ms`, overflow: 'hidden' }}
                >
                  {/* Palette strip */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                    {palette && [palette.bg, palette.bg2, palette.accent].filter(Boolean).map((color, ci) => (
                      <div
                        key={ci}
                        style={{ width: '20px', height: '20px', borderRadius: '50%', background: color, border: '2px solid var(--border-subtle)' }}
                      />
                    ))}
                    <div style={{ marginLeft: 'auto' }}>
                      <span className="badge badge-neutral">{screenshots.length} shots</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                    {formatDate(batch.created_at)}
                  </p>
                  {screenshots[0] && (
                    <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {screenshots[0].headline || 'Untitled batch'}
                    </p>
                  )}
                  <Link
                    href={`/studio?batch=${batch.id}`}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Open in Studio
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Usage History */}
      <div className="animate-fade-in delay-225">
        <h2 className="font-display" style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Usage History</h2>
        {!transactions || transactions.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No transactions yet.</p>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-inset)' }}>
                  {['Date', 'Action', 'Credits'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border-subtle)' }}>
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
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{formatDate(tx.created_at)}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 500, textTransform: 'capitalize' }}>
                      {tx.reason.replace(/_/g, ' ')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 700, color: tx.delta > 0 ? 'var(--success)' : 'var(--error)' }}>
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
  );
}
