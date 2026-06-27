import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', overflowX: 'hidden' }}>

      {/* ── Navigation ─────────────────────────────────────────────── */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '18px',
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
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '-1.5px',
              color: 'var(--text-primary)',
            }}
          >
            shots
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Link href="/pricing" style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            transition: 'color 0.15s',
          }}>
            Pricing
          </Link>
          <Link href="/login" style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            transition: 'color 0.15s',
          }}>
            Log in
          </Link>
          <Link href="/signup" className="btn btn-primary btn-sm" style={{ marginLeft: '8px' }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section style={{ padding: '88px 32px 72px', textAlign: 'center', position: 'relative' }}>
        {/* Badge */}
        <div className="animate-fade-in" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 14px',
          background: 'var(--accent-tint)',
          border: '1px solid var(--accent-border)',
          borderRadius: 'var(--radius-full)',
          marginBottom: '32px',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: 'var(--accent-hover)',
            textTransform: 'uppercase',
          }}>AI-Powered Marketing</span>
        </div>

        {/* Main headline — text-clipped gradient only here */}
        <h1
          className="animate-fade-in delay-75"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(36px, 5.5vw, 64px)',
            fontWeight: 700,
            letterSpacing: '-1.5px',
            lineHeight: 1.1,
            maxWidth: '760px',
            margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #0d0d12 0%, #065f46 55%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Turn screenshots into store-ready magic.
        </h1>

        {/* Subheadline */}
        <p
          className="animate-fade-in delay-150"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '17px',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            maxWidth: '500px',
            margin: '0 auto 40px',
          }}
        >
          Upload your app's UI. Our AI analyzes colors, writes punchy marketing copy,
          and generates beautiful device mockups — in under a minute.
        </p>

        {/* CTAs */}
        <div className="animate-fade-in delay-225" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/signup" className="btn btn-primary btn-lg">
            Start Creating →
          </Link>
          <Link href="/pricing" className="btn btn-ghost btn-lg">
            See Pricing
          </Link>
        </div>

        {/* Social proof */}
        <p className="animate-fade-in delay-300" style={{ marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          No free tier. Serious results from day one.
        </p>
      </section>

      {/* ── Preview Cards ─────────────────────────────────────────── */}
      <section style={{ padding: '0 32px 96px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: '20px',
          maxWidth: 'var(--max-width)',
          margin: '0 auto',
        }}>
          {/* Card left */}
          <div
            className="animate-fade-in delay-150"
            style={{
              width: '230px',
              background: '#ffffff',
              borderRadius: '18px',
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden',
              transform: 'translateY(20px) rotate(-3.5deg)',
              flexShrink: 0,
            }}
          >
            <div style={{ height: '110px', background: '#f4f4f8', padding: '18px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Activity</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.2, color: 'var(--text-primary)' }}>Track your workouts</div>
            </div>
            <div style={{ padding: '12px', background: '#f4f4f8' }}>
              <div style={{ width: '100%', height: '110px', background: '#e2e2ea', borderRadius: '10px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '5px', left: '50%', transform: 'translateX(-50%)', width: '36px', height: '7px', background: 'var(--text-primary)', borderRadius: '0 0 6px 6px', opacity: 0.15 }} />
                <div style={{ margin: '22px 10px 8px', height: '28px', background: 'var(--accent)', borderRadius: '5px', opacity: 0.2 }} />
                <div style={{ margin: '0 10px', height: '16px', background: 'var(--text-primary)', borderRadius: '5px', opacity: 0.08 }} />
              </div>
            </div>
          </div>

          {/* Card center — featured */}
          <div
            className="animate-fade-in delay-75"
            style={{
              width: '270px',
              background: '#ffffff',
              borderRadius: '20px',
              border: '1.5px solid var(--accent)',
              overflow: 'hidden',
              flexShrink: 0,
              zIndex: 10,
              position: 'relative',
            }}
          >
            {/* Popular pill */}
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              padding: '3px 10px',
              background: 'var(--accent-tint)',
              border: '1px solid var(--accent-border)',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--accent-hover)',
              fontFamily: 'var(--font-body)',
            }}>
              Featured
            </div>
            <div style={{ height: '130px', background: '#f4f4f8', padding: '22px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Collaborate</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '21px', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.2, color: 'var(--text-primary)' }}>Work together in real-time</div>
            </div>
            <div style={{ padding: '14px', background: '#f4f4f8' }}>
              <div style={{ width: '100%', height: '140px', background: '#e2e2ea', borderRadius: '14px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '5px', left: '50%', transform: 'translateX(-50%)', width: '44px', height: '9px', background: 'var(--text-primary)', borderRadius: '0 0 9px 9px', opacity: 0.12 }} />
                <div style={{ margin: '26px 12px 10px', height: '36px', background: 'var(--accent)', borderRadius: '7px', opacity: 0.22 }} />
                <div style={{ margin: '0 12px', display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1, height: '24px', background: 'var(--accent)', borderRadius: '5px', opacity: 0.12 }} />
                  <div style={{ flex: 1, height: '24px', background: 'var(--accent)', borderRadius: '5px', opacity: 0.12 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Card right */}
          <div
            className="animate-fade-in delay-225"
            style={{
              width: '230px',
              background: '#ffffff',
              borderRadius: '18px',
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden',
              transform: 'translateY(20px) rotate(3.5deg)',
              flexShrink: 0,
            }}
          >
            <div style={{ height: '110px', background: '#f4f4f8', padding: '18px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Security</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.2, color: 'var(--text-primary)' }}>Keep your data protected</div>
            </div>
            <div style={{ padding: '12px', background: '#f4f4f8' }}>
              <div style={{ width: '100%', height: '110px', background: '#e2e2ea', borderRadius: '10px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '5px', left: '50%', transform: 'translateX(-50%)', width: '36px', height: '7px', background: 'var(--text-primary)', borderRadius: '0 0 6px 6px', opacity: 0.15 }} />
                <div style={{ margin: '22px auto 0', width: '48px', height: '48px', background: 'var(--accent)', borderRadius: '50%', opacity: 0.18 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section style={{ padding: '80px 32px', background: '#ffffff', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '34px', fontWeight: 700, letterSpacing: '-1.5px', marginBottom: '10px' }}>
              How it works
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: '15px' }}>
              From raw screenshot to app store ready in 3 simple steps.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[
              {
                step: '01',
                title: 'Upload Screenshots',
                desc: 'Drag and drop your raw app UI screenshots. Batches of up to 10 images at once, order preserved.',
              },
              {
                step: '02',
                title: 'AI Analyzes & Writes',
                desc: 'Claude vision AI reads your UI, picks a cohesive color palette, and writes punchy marketing copy for every screen.',
              },
              {
                step: '03',
                title: 'Edit & Download',
                desc: 'Fine-tune text with AI revisions, swap icons, then download high-res 1080×1920 PNGs or a full ZIP.',
              },
            ].map((s, i) => (
              <div
                key={i}
                className="card animate-fade-in"
                style={{ padding: '32px 28px', animationDelay: `${i * 100}ms` }}
              >
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-tint)',
                  border: '1px solid var(--accent-border)',
                  marginBottom: '20px',
                }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: 'var(--accent-hover)', letterSpacing: '0' }}>
                    {s.step}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 700, letterSpacing: '-1px', marginBottom: '10px' }}>
                  {s.title}
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: '14px' }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section style={{ padding: '80px 32px' }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '34px', fontWeight: 700, letterSpacing: '-1.5px', marginBottom: '10px' }}>
              Everything you need
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: '15px' }}>
              Professional results, zero design experience required.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                  </svg>
                ),
                title: 'Smart Color Matching',
                desc: 'AI derives a cohesive palette from your actual app colors — consistent across every screenshot in the batch.',
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                ),
                title: 'Benefit-First Copy',
                desc: 'No buzzwords. Claude writes clear, punchy headlines that describe what each screen actually does.',
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
                  </svg>
                ),
                title: 'Live Canvas Preview',
                desc: 'Every text edit instantly re-renders the 1080×1920 canvas. What you see is exactly what you get.',
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                ),
                title: 'One-Click Export',
                desc: 'Download individual PNGs or the whole batch as a ZIP. Store-ready dimensions, every time.',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="card animate-fade-in"
                style={{ padding: '28px', display: 'flex', gap: '18px', alignItems: 'flex-start', animationDelay: `${i * 75}ms` }}
              >
                <div style={{
                  flexShrink: 0,
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-tint)',
                  border: '1px solid var(--accent-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)',
                }}>
                  {f.icon}
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 700, letterSpacing: '-0.8px', marginBottom: '6px' }}>
                    {f.title}
                  </h4>
                  <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.65 }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────────────── */}
      <section style={{ padding: '80px 32px', background: '#ffffff', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
          <div className="badge badge-accent" style={{ marginBottom: '24px' }}>
            Ready to ship
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '34px', fontWeight: 700, letterSpacing: '-1.5px', marginBottom: '14px' }}>
            Ready to make your app shine?
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '32px' }}>
            Plans start at $9/month. No free tier — we built this for people serious about their app store presence.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn btn-primary btn-lg">
              Start Creating →
            </Link>
            <Link href="/pricing" className="btn btn-ghost btn-lg">
              View Plans
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer style={{ padding: '28px 32px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '14px', color: 'var(--accent)', letterSpacing: '-0.5px' }}>Fire</span>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>shots</span>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Fireshots. All rights reserved.
        </p>
      </footer>

    </div>
  );
}
