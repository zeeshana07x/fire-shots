'use client';

import { useState } from 'react';
import {
  ScreenshotItem,
  ScreenshotContent,
  ColorPalette,
  ICON_KEYWORDS,
  IconKeyword,
} from '@/lib/types';
import CanvasPreview from './CanvasPreview';
import Spinner from '@/components/ui/Spinner';

interface EditorPanelProps {
  screenshot: ScreenshotItem;
  palette: ColorPalette;
  onUpdate: (fields: Partial<ScreenshotContent>) => void;
  onRevise: (instruction: string) => void;
  revising: boolean;
}

export default function EditorPanel({
  screenshot,
  palette,
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
    <div className="card p-0 overflow-hidden animate-fade-in">
      <div className="flex flex-col lg:flex-row">
        {/* Left: Canvas Preview */}
        <div
          className="flex items-center justify-center p-6 lg:p-8"
          style={{
            background: 'var(--bg-inset)',
            borderRight: '1px solid var(--border-subtle)',
            minWidth: 320,
          }}
        >
          <CanvasPreview
            screenshot={screenshot}
            palette={palette}
            className="w-full"
          />
        </div>

        {/* Right: Fields */}
        <div className="flex-1 p-6 lg:p-8 flex flex-col gap-6">
          <div>
            <h3
              className="font-display text-base font-bold mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              Edit Content
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Adjust the marketing copy for screenshot #{screenshot.position}
            </p>
          </div>

          {/* Eyebrow */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Eyebrow Label
            </label>
            <input
              type="text"
              className="input"
              value={screenshot.eyebrow}
              onChange={(e) => onUpdate({ eyebrow: e.target.value })}
              placeholder="e.g. New Feature"
            />
          </div>

          {/* Headline */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Headline
            </label>
            <input
              type="text"
              className="input"
              value={screenshot.headline}
              onChange={(e) => onUpdate({ headline: e.target.value })}
              placeholder="e.g. Track your progress effortlessly"
            />
          </div>

          {/* Supporting Text */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Supporting Text
              </label>
              <span
                className="text-xs tabular-nums"
                style={{
                  color:
                    screenshot.supporting.length > 90
                      ? 'var(--error)'
                      : 'var(--text-tertiary)',
                }}
              >
                {screenshot.supporting.length}/90
              </span>
            </div>
            <input
              type="text"
              className="input"
              value={screenshot.supporting}
              onChange={(e) => onUpdate({ supporting: e.target.value })}
              placeholder="e.g. See real-time analytics at a glance"
              maxLength={120}
            />
          </div>

          {/* Icon Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Icon
            </label>
            <select
              className="input cursor-pointer"
              value={screenshot.icon}
              onChange={(e) =>
                onUpdate({ icon: e.target.value as IconKeyword })
              }
            >
              {ICON_KEYWORDS.map((kw) => (
                <option key={kw} value={kw}>
                  {kw.charAt(0).toUpperCase() + kw.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Divider */}
          <div className="divider" />

          {/* AI Revision */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              AI Revision
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input flex-1"
                value={reviseText}
                onChange={(e) => setReviseText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRevise()}
                placeholder="e.g. Make headline more exciting"
                disabled={revising}
              />
              <button
                className="btn btn-primary shrink-0"
                onClick={handleRevise}
                disabled={!reviseText.trim() || revising}
              >
                {revising ? (
                  <>
                    <Spinner size="sm" className="[&_path]:stroke-white [&_circle]:stroke-white/30" />
                    Revising…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 3l1.5 4L16 8l-3.5 3L13.5 16 11 13.5 8.5 16 9.5 11 6 8l3.5-1z" />
                    </svg>
                    Revise with AI
                  </>
                )}
              </button>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Describe how you&apos;d like the copy changed. Costs 0.25 credits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
