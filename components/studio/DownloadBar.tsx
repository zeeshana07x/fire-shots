'use client';

import Spinner from '@/components/ui/Spinner';

interface DownloadBarProps {
  onDownloadSingle: (index: number) => void;
  onDownloadAll: () => void;
  screenshotCount: number;
  currentIndex?: number;
  downloading: boolean;
}

export default function DownloadBar({
  onDownloadSingle,
  onDownloadAll,
  screenshotCount,
  currentIndex = 0,
  downloading,
}: DownloadBarProps) {
  return (
    <div
      className="card flex items-center justify-between px-5 py-3.5 animate-fade-in"
    >
      {/* Left Info */}
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {screenshotCount} screenshot{screenshotCount !== 1 ? 's' : ''} ready
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          className="btn btn-secondary"
          onClick={() => onDownloadSingle(currentIndex)}
          disabled={downloading}
        >
          {downloading ? (
            <Spinner size="sm" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v9" />
              <polyline points="4,8 8,12 12,8" />
              <line x1="3" y1="14" x2="13" y2="14" />
            </svg>
          )}
          Download This
        </button>

        <button
          className="btn btn-primary"
          onClick={onDownloadAll}
          disabled={downloading}
        >
          {downloading ? (
            <Spinner size="sm" className="[&_path]:stroke-white [&_circle]:stroke-white/30" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v9" />
              <polyline points="4,8 8,12 12,8" />
              <line x1="3" y1="14" x2="13" y2="14" />
            </svg>
          )}
          Download All ({screenshotCount})
        </button>
      </div>
    </div>
  );
}
