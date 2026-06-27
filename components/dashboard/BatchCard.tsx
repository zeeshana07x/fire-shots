'use client';

import Link from 'next/link';
import { Batch } from '@/lib/types';

interface BatchCardProps {
  batch: Batch;
}

export default function BatchCard({ batch }: BatchCardProps) {
  const dateStr = new Date(batch.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = new Date(batch.createdAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const thumbnails = batch.screenshots.slice(0, 4);
  const remaining = batch.screenshots.length - 4;

  return (
    <div className="card overflow-hidden animate-fade-in hover:shadow-md transition-shadow duration-200">
      {/* Thumbnail Strip */}
      <div
        className="flex gap-1 p-3"
        style={{ background: 'var(--bg-inset)' }}
      >
        {thumbnails.map((ss) => (
          <div
            key={ss.id}
            className="relative flex-1 aspect-[3/4] rounded-md overflow-hidden"
            style={{
              background: 'var(--bg-hover)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {(ss.dataUrl || ss.storageUrl) && (
              <img
                src={ss.dataUrl || ss.storageUrl}
                alt={`Screenshot ${ss.position}`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}
        {remaining > 0 && (
          <div
            className="flex-1 aspect-[3/4] rounded-md flex items-center justify-center text-xs font-semibold"
            style={{
              background: 'var(--bg-hover)',
              color: 'var(--text-tertiary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            +{remaining}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="px-4 py-4 flex flex-col gap-3">
        {/* Date & Count */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {dateStr}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {timeStr}
            </p>
          </div>
          <span className="badge badge-neutral">
            {batch.screenshots.length} screenshot{batch.screenshots.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Palette Swatches */}
        <div className="flex items-center gap-1.5">
          {[
            batch.palette.bg,
            batch.palette.bg2,
            batch.palette.accent,
            batch.palette.card1,
            batch.palette.card2,
          ].map((color, i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: 18,
                height: 18,
                background: color,
                border: '2px solid var(--bg-surface)',
                boxShadow: 'var(--shadow-xs)',
              }}
              title={color}
            />
          ))}
          <span className="text-xs ml-1" style={{ color: 'var(--text-tertiary)' }}>
            palette
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            href={`/studio?batch=${batch.id}`}
            className="btn btn-sm btn-primary flex-1 no-underline justify-center"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 1l1 3.5L12 5.5 9 8l1 4-3-2.5L4 12l1-4-3-2.5L6 4.5z" />
            </svg>
            Open in Studio
          </Link>
          <button className="btn btn-sm btn-secondary">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 2v7" />
              <polyline points="4,7 7,10 10,7" />
              <line x1="3" y1="12" x2="11" y2="12" />
            </svg>
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
