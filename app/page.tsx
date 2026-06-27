import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', overflowX: 'hidden' }}>

      {/* ── Navigation ─────────────────────────────────────────────── */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        height: '80px',
        background: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '24px',
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
              fontSize: '24px',
              fontWeight: 700,
              letterSpacing: '-1.5px',
              color: 'var(--text-primary)',
            }}
          >
            shots
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/login" className="btn btn-ghost" style={{ padding: '10px 20px', fontSize: '15px' }}>
            Log in
          </Link>
          <Link href="/signup" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '15px' }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section style={{ padding: '88px 32px 72px', textAlign: 'center', position: 'relative' }}>
        {/* Badge */}
        <div className="animate-fade-in" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 16px',
          background: 'var(--accent-tint)',
          border: '1px solid var(--accent-border)',
          borderRadius: 'var(--radius-full)',
          marginBottom: '32px',
        }}>
          <span style={{ fontSize: '14px' }}>✨</span>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--accent)',
          }}>Store-ready screenshots in seconds</span>
        </div>

        {/* Main headline */}
        <h1
          className="animate-fade-in delay-75"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(42px, 6vw, 72px)',
            fontWeight: 800,
            letterSpacing: '-2px',
            lineHeight: 1.1,
            maxWidth: '900px',
            margin: '0 auto 24px',
            color: '#064e3b',
          }}
        >
          Raw screenshots.<br/>Store-ready in one click.
        </h1>

        {/* Subheadline */}
        <p
          className="animate-fade-in delay-150"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '18px',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '640px',
            margin: '0 auto 48px',
          }}
        >
          Upload your app screenshots. Fireshots analyzes them,
          writes the copy, picks the palette, and renders finished
          marketing images — ready to upload.
        </p>

        {/* CTAs */}
        <div className="animate-fade-in delay-225" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <Link href="/signup" className="btn btn-primary btn-lg" style={{ padding: '16px 32px', fontSize: '16px' }}>
            Start now →
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'var(--font-body)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              No design skills needed
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Cohesive palette across batch
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Editable after generation
            </span>
          </div>
        </div>
      </section>

      {/* ── Preview Cards ─────────────────────────────────────────── */}
      <section style={{ padding: '0 32px 96px', overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          {/* Card left */}
          <div
            className="animate-fade-in delay-150"
            style={{
              width: '280px',
              background: '#ffffff',
              borderRadius: '24px',
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden',
              transform: 'translateY(40px)',
              flexShrink: 0,
            }}
          >
            <div style={{ height: '140px', background: '#f8f8fb', padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Activity</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1.1, color: '#064e3b' }}>Track your workouts</div>
            </div>
            <div style={{ padding: '16px', background: '#f8f8fb' }}>
              <div style={{ width: '100%', height: '180px', background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)', width: '48px', height: '12px', background: '#f4f4f8', borderRadius: '6px' }} />
                <div style={{ margin: '32px 16px 12px', height: '40px', background: 'var(--accent-tint)', borderRadius: '8px' }} />
                <div style={{ margin: '0 16px', height: '24px', background: '#f4f4f8', borderRadius: '6px' }} />
              </div>
            </div>
          </div>

          {/* Card center */}
          <div
            className="animate-fade-in delay-75"
            style={{
              width: '320px',
              background: '#ffffff',
              borderRadius: '24px',
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden',
              flexShrink: 0,
              zIndex: 10,
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ height: '160px', background: '#f8f8fb', padding: '32px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Collaborate</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1.1, color: '#064e3b' }}>Work together in real-time</div>
            </div>
            <div style={{ padding: '20px', background: '#f8f8fb' }}>
              <div style={{ width: '100%', height: '240px', background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', width: '60px', height: '16px', background: '#f4f4f8', borderRadius: '8px' }} />
                <div style={{ margin: '40px 20px 16px', height: '60px', background: 'var(--accent-tint)', borderRadius: '12px' }} />
                <div style={{ margin: '0 20px', display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, height: '40px', background: '#f4f4f8', borderRadius: '8px' }} />
                  <div style={{ flex: 1, height: '40px', background: '#f4f4f8', borderRadius: '8px' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Card right */}
          <div
            className="animate-fade-in delay-225"
            style={{
              width: '280px',
              background: '#ffffff',
              borderRadius: '24px',
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden',
              transform: 'translateY(40px)',
              flexShrink: 0,
            }}
          >
            <div style={{ height: '140px', background: '#f8f8fb', padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Security</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1.1, color: '#064e3b' }}>Keep your data protected</div>
            </div>
            <div style={{ padding: '16px', background: '#f8f8fb' }}>
              <div style={{ width: '100%', height: '180px', background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)', width: '48px', height: '12px', background: '#f4f4f8', borderRadius: '6px' }} />
                <div style={{ margin: '32px auto 0', width: '80px', height: '80px', background: 'var(--accent-tint)', borderRadius: '50%' }} />
              </div>
            </div>
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
