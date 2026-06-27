'use client';

import { useState } from 'react';
import {
  ScreenshotItem,
  ScreenshotContent,
  ColorPalette,
  ICON_KEYWORDS,
  IconKeyword,
} from '@/lib/types';
import Spinner from '@/components/ui/Spinner';

interface EditorPanelProps {
  screenshot: ScreenshotItem;
  onUpdate: (fields: Partial<ScreenshotContent>) => void;
  onRevise: (instruction: string) => void;
  revising: boolean;
}

// Icon mappings to SVGs
function renderIconSvg(icon: IconKeyword) {
  switch (icon) {
    case 'spark':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.3-6.3l-.7.7M6.7 17.3l-.7.7m12.6 0l-.7-.7M6.7 6.7l-.7-.7N" />
          <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      );
    case 'stack':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case 'bolt':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10" />
        </svg>
      );
    case 'check':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case 'heart':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78v0z" />
        </svg>
      );
    case 'shield':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'star':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case 'grid':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    default:
      return null;
  }
}

export default function EditorPanel({
  screenshot,
  onUpdate,
  onRevise,
  revising,
}: EditorPanelProps) {
  const [reviseText, setReviseText] = useState('');

  const handleRevise = () => {
    if (!reviseText.trim() || revising) return;
    onRevise(reviseText.trim());
    setReviseText('');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '24px',
        background: '#ffffff',
        borderLeft: '1px solid var(--border-subtle)',
        width: '340px',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      {/* Section 1: Copy */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            marginBottom: '-8px',
          }}
        >
          Copy
        </h3>

        {/* Eyebrow Label */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Eyebrow Label
          </label>
          <input
            type="text"
            className="input"
            value={screenshot.eyebrow}
            onChange={(e) => onUpdate({ eyebrow: e.target.value })}
            placeholder="Track Progress"
          />
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Headline
          </label>
          <input
            type="text"
            className="input"
            value={screenshot.headline}
            onChange={(e) => onUpdate({ headline: e.target.value })}
            placeholder="Hit Every Goal"
          />
        </div>

        {/* Supporting Line */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Supporting Line
            </label>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                color: screenshot.supporting.length > 88 ? 'var(--error)' : 'var(--text-muted)',
                fontWeight: 500,
              }}
            >
              {screenshot.supporting.length} / 88
            </span>
          </div>
          <textarea
            className="input"
            value={screenshot.supporting}
            onChange={(e) => onUpdate({ supporting: e.target.value })}
            placeholder="Daily streaks and smart reminders keep you on track."
            maxLength={120}
            rows={3}
            style={{ resize: 'none', fontFamily: 'var(--font-body)', fontSize: '13px' }}
          />
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

      {/* Section 2: Icon Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            marginBottom: '-2px',
          }}
        >
          Icon
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {ICON_KEYWORDS.map((kw) => {
            const isSelected = screenshot.icon === kw;
            return (
              <button
                key={kw}
                onClick={() => onUpdate({ icon: kw as IconKeyword })}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px 6px',
                  border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  background: isSelected ? 'var(--accent-tint)' : '#ffffff',
                  color: isSelected ? 'var(--accent-hover)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {renderIconSvg(kw as IconKeyword)}
                <span style={{ fontSize: '9px', fontWeight: 600, textTransform: 'capitalize' }}>
                  {kw}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

      {/* Section 3: AI Revision */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            marginBottom: '-4px',
          }}
        >
          AI Revision
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            className="input"
            value={reviseText}
            onChange={(e) => setReviseText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRevise()}
            placeholder="e.g. Make headline more exciting"
            disabled={revising}
          />
          <button
            className="btn btn-primary"
            onClick={handleRevise}
            disabled={!reviseText.trim() || revising}
            style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
          >
            {revising ? (
              <>
                <Spinner size="sm" className="[&_path]:stroke-white [&_circle]:stroke-white/30" />
                Revising…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3" />
                  <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
                Revise with AI
              </>
            )}
          </button>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Describe how you&apos;d like the copy changed. Costs 0.25 credits.
        </p>
      </div>
    </div>
  );
}
