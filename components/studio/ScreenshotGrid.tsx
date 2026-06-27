'use client';

import { ScreenshotItem } from '@/lib/types';

interface ScreenshotGridProps {
  screenshots: ScreenshotItem[];
  onRemove: (index: number) => void;
  generating: boolean;
}

const delayClasses = [
  '',
  'delay-75',
  'delay-150',
  'delay-225',
  'delay-300',
  'delay-375',
];

export default function ScreenshotGrid({
  screenshots,
  onRemove,
  generating,
}: ScreenshotGridProps) {
  if (screenshots.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {screenshots.map((item, index) => (
        <div
          key={item.id}
          className={`card relative overflow-hidden group animate-fade-in-scale ${
            delayClasses[index % delayClasses.length]
          }`}
          style={{ padding: 0 }}
        >
          {/* Image Thumbnail */}
          <div className="relative aspect-[3/4] overflow-hidden" style={{ borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
            {item.dataUrl && (
              <img
                src={item.dataUrl}
                alt={`Screenshot ${item.position}`}
                className="w-full h-full object-cover"
              />
            )}

            {/* Skeleton Shimmer Overlay (during generation) */}
            {generating && (
              <div
                className="absolute inset-0 skeleton"
                style={{
                  opacity: 0.65,
                  borderRadius: 0,
                }}
              />
            )}

            {/* Position Badge — top-left */}
            <span
              className="absolute top-2.5 left-2.5 badge"
              style={{
                background: 'rgba(26,24,22,0.7)',
                color: '#fff',
                backdropFilter: 'blur(4px)',
                fontSize: 11,
                fontWeight: 700,
                minWidth: 24,
                justifyContent: 'center',
              }}
            >
              {item.position}
            </span>

            {/* Remove Button — top-right */}
            {!generating && (
              <button
                onClick={() => onRemove(index)}
                className="absolute top-2 right-2 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                style={{
                  width: 28,
                  height: 28,
                  background: 'rgba(26,24,22,0.65)',
                  backdropFilter: 'blur(4px)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
                aria-label={`Remove screenshot ${item.position}`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="3" x2="11" y2="11" />
                  <line x1="11" y1="3" x2="3" y2="11" />
                </svg>
              </button>
            )}
          </div>

          {/* Footer Info */}
          <div className="px-3 py-2.5">
            <p
              className="text-xs font-medium truncate"
              style={{ color: 'var(--text-secondary)' }}
            >
              {item.file?.name || `Screenshot ${item.position}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
