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
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
      {screenshots.map((item, index) => (
        <div
          key={item.id}
          className={`card relative overflow-hidden group animate-fade-in-scale ${
            delayClasses[index % delayClasses.length]
          }`}
          style={{ padding: 0, background: '#f4f4f8' }}
        >
          {/* Image Thumbnail */}
          <div className="relative aspect-[3/4] overflow-hidden" style={{ borderRadius: 'var(--radius-lg)' }}>
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

            {/* Position Badge — bottom-left as a dark block */}
            <span
              className="absolute bottom-2 left-2 flex items-center justify-center rounded"
              style={{
                background: '#1e293b',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                width: 18,
                height: 18,
              }}
            >
              {index + 1}
            </span>

            {/* Remove Button — top-right dark circle with white cross */}
            {!generating && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
                className="absolute top-2 right-2 flex items-center justify-center rounded-full hover:scale-105 active:scale-95 transition-transform"
                style={{
                  width: 20,
                  height: 20,
                  background: '#334155',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label={`Remove screenshot ${item.position}`}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="2" y1="2" x2="8" y2="8" />
                  <line x1="8" y1="2" x2="2" y2="8" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
