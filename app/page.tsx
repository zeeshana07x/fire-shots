import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', overflowX: 'hidden' }}>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 48px',
        height: '64px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🔥</span>
          <span className="font-display" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Fireshots
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/pricing" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none', padding: '8px 12px' }}>
            Pricing
          </Link>
          <Link href="/login" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none', padding: '8px 12px' }}>
            Log in
          </Link>
          <Link href="/signup" className="btn btn-primary btn-sm" style={{ marginLeft: '4px' }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 48px 100px', textAlign: 'center', position: 'relative' }}>
        {/* Subtle glow behind hero */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '400px',
          background: 'radial-gradient(ellipse at center, rgba(91,71,224,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Badge */}
        <div className="animate-fade-in" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)', marginBottom: '28px', boxShadow: 'var(--shadow-xs)' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>AI-Powered Marketing</span>
        </div>

        {/* Main headline */}
        <h1
          className="font-display animate-fade-in delay-75"
          style={{
            fontSize: 'clamp(36px, 6vw, 72px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: 'var(--text-primary)',
            maxWidth: '820px',
            margin: '0 auto 20px',
          }}
        >
          Turn screenshots into{' '}
          <span style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, #8B5CF6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            store-ready magic.
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className="animate-fade-in delay-150"
          style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            maxWidth: '540px',
            margin: '0 auto 40px',
          }}
        >
          Upload your app's UI. Our AI analyzes colors, writes punchy marketing copy,
          and generates beautiful device mockups — in under a minute.
        </p>

        {/* CTAs */}
        <div className="animate-fade-in delay-225" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/signup" className="btn btn-primary btn-lg" style={{ boxShadow: '0 4px 16px rgba(91,71,224,0.3)' }}>
            Start Creating
          </Link>
          <Link href="/pricing" className="btn btn-secondary btn-lg">
            See Pricing →
          </Link>
        </div>

        {/* Social proof */}
        <p className="animate-fade-in delay-300" style={{ marginTop: '24px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
          No free tier. Serious results from day one.
        </p>
      </section>

      {/* ── Hero Preview Cards ────────────────────────────────────────── */}
      <section style={{ padding: '0 48px 100px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: '24px',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          {/* Card 1 — left, slightly smaller */}
          <div
            className="animate-fade-in delay-150"
            style={{
              width: '240px',
              background: 'var(--bg-surface)',
              borderRadius: '20px',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
              transform: 'translateY(24px) rotate(-4deg)',
              flexShrink: 0,
            }}
          >
            <div style={{ height: '120px', background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', padding: '20px 18px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Activity</div>
              <div className="font-display" style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1.2, color: 'var(--text-primary)' }}>Track your workouts</div>
            </div>
            <div style={{ padding: '14px', background: '#F5F5F5' }}>
              <div style={{ width: '100%', height: '120px', background: '#E8E8E8', borderRadius: '12px', border: '3px solid #1A1816', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '6px', left: '50%', transform: 'translateX(-50%)', width: '40px', height: '8px', background: '#1A1816', borderRadius: '0 0 8px 8px' }} />
                <div style={{ margin: '24px 12px 8px', height: '32px', background: '#6366F1', borderRadius: '6px', opacity: 0.3 }} />
                <div style={{ margin: '0 12px', height: '20px', background: '#6366F1', borderRadius: '6px', opacity: 0.15 }} />
              </div>
            </div>
          </div>

          {/* Card 2 — center, tallest, most prominent */}
          <div
            className="animate-fade-in delay-75"
            style={{
              width: '280px',
              background: 'var(--bg-surface)',
              borderRadius: '24px',
              border: '2px solid var(--accent)',
              boxShadow: '0 20px 60px rgba(91,71,224,0.2)',
              overflow: 'hidden',
              flexShrink: 0,
              zIndex: 10,
            }}
          >
            <div style={{ height: '140px', background: 'linear-gradient(135deg, var(--accent-light) 0%, #E0E7FF 100%)', padding: '24px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Collaborate</div>
              <div className="font-display" style={{ fontSize: '22px', fontWeight: 800, lineHeight: 1.2, color: 'var(--text-primary)' }}>Work together in real-time</div>
            </div>
            <div style={{ padding: '16px', background: '#F0F0F0' }}>
              <div style={{ width: '100%', height: '150px', background: '#E4E4E4', borderRadius: '16px', border: '4px solid #1A1816', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '6px', left: '50%', transform: 'translateX(-50%)', width: '48px', height: '10px', background: '#1A1816', borderRadius: '0 0 10px 10px' }} />
                <div style={{ margin: '26px 14px 10px', height: '40px', background: 'var(--accent)', borderRadius: '8px', opacity: 0.25 }} />
                <div style={{ margin: '0 14px', display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1, height: '28px', background: 'var(--accent)', borderRadius: '6px', opacity: 0.15 }} />
                  <div style={{ flex: 1, height: '28px', background: 'var(--accent)', borderRadius: '6px', opacity: 0.15 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 — right, slightly smaller */}
          <div
            className="animate-fade-in delay-225"
            style={{
              width: '240px',
              background: 'var(--bg-surface)',
              borderRadius: '20px',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
              transform: 'translateY(24px) rotate(4deg)',
              flexShrink: 0,
            }}
          >
            <div style={{ height: '120px', background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', padding: '20px 18px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Security</div>
              <div className="font-display" style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1.2, color: 'var(--text-primary)' }}>Keep your data protected</div>
            </div>
            <div style={{ padding: '14px', background: '#F5F5F5' }}>
              <div style={{ width: '100%', height: '120px', background: '#E8E8E8', borderRadius: '12px', border: '3px solid #1A1816', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '6px', left: '50%', transform: 'translateX(-50%)', width: '40px', height: '8px', background: '#1A1816', borderRadius: '0 0 8px 8px' }} />
                <div style={{ margin: '24px auto 0', width: '52px', height: '52px', background: '#F59E0B', borderRadius: '50%', opacity: 0.25 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section style={{ padding: '80px 48px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 className="font-display" style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '12px' }}>How it works</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>From raw screenshot to app store ready in 3 simple steps.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              {
                step: '1',
                title: 'Upload Screenshots',
                desc: 'Drag and drop your raw app UI screenshots. Batches of up to 10 images at once, order preserved.',
                color: 'var(--accent-light)',
                textColor: 'var(--accent)',
              },
              {
                step: '2',
                title: 'AI Analyzes & Writes',
                desc: 'Claude vision AI reads your UI, picks a cohesive color palette, and writes punchy marketing copy for every screen.',
                color: 'var(--amber-light)',
                textColor: '#92400E',
              },
              {
                step: '3',
                title: 'Edit & Download',
                desc: 'Fine-tune text with AI revisions, swap icons, then download high-res 1080×1920 PNGs or a full ZIP.',
                color: 'var(--success-light)',
                textColor: '#15803D',
              },
            ].map((s, i) => (
              <div
                key={i}
                className="card animate-fade-in"
                style={{ padding: '32px 28px', animationDelay: `${i * 100}ms` }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: s.color, color: s.textColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px',
                  marginBottom: '20px',
                }}>
                  {s.step}
                </div>
                <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>{s.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 className="font-display" style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '12px' }}>Everything you need</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Professional results, zero design experience required.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {[
              { icon: '🎨', title: 'Smart Color Matching', desc: 'AI derives a cohesive palette from your actual app colors — consistent across every screenshot in the batch.' },
              { icon: '✍️', title: 'Benefit-First Copy', desc: 'No buzzwords. Claude writes clear, punchy headlines that describe what each screen actually does.' },
              { icon: '📱', title: 'Live Canvas Preview', desc: 'Every text edit instantly re-renders the 1080×1920 canvas. What you see is exactly what you get.' },
              { icon: '⬇️', title: 'One-Click Export', desc: 'Download individual PNGs or the whole batch as a ZIP. Store-ready dimensions, every time.' },
            ].map((f, i) => (
              <div
                key={i}
                className="card animate-fade-in"
                style={{ padding: '28px', display: 'flex', gap: '16px', animationDelay: `${i * 75}ms` }}
              >
                <div style={{ fontSize: '28px', flexShrink: 0, lineHeight: 1 }}>{f.icon}</div>
                <div>
                  <h4 className="font-display" style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>{f.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing CTA ──────────────────────────────────────────────── */}
      <section style={{ padding: '80px 48px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="font-display" style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '16px' }}>
            Ready to make your app shine?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.7, marginBottom: '32px' }}>
            Plans start at $9/month. No free tier — we built this for people serious about their app store presence.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Link href="/signup" className="btn btn-primary btn-lg" style={{ boxShadow: '0 4px 16px rgba(91,71,224,0.3)' }}>
              Start Creating
            </Link>
            <Link href="/pricing" className="btn btn-secondary btn-lg">
              View Plans
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer style={{ padding: '32px 48px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🔥</span>
          <span className="font-display" style={{ fontWeight: 700, fontSize: '15px' }}>Fireshots</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
          © {new Date().getFullYear()} Fireshots. All rights reserved.
        </p>
      </footer>

    </div>
  );
}
