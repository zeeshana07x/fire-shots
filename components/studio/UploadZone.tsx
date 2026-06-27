'use client';

import { useCallback, useRef, useState } from 'react';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_FILES = 10;
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export default function UploadZone({ onFilesSelected, disabled }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((files: File[]): string | null => {
    if (files.length === 0) return 'No files selected.';
    if (files.length > MAX_FILES) return `You can upload up to ${MAX_FILES} files at once.`;

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return `"${file.name}" is not a supported format. Use PNG, JPG, or WebP.`;
      }
      if (file.size > MAX_SIZE_BYTES) {
        return `"${file.name}" exceeds the 5 MB size limit.`;
      }
    }

    return null;
  }, []);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const files = Array.from(fileList);
      const err = validate(files);

      if (err) {
        setError(err);
        return;
      }

      setError(null);
      onFilesSelected(files);
    },
    [validate, onFilesSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        className="flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200"
        style={{
          padding: 'var(--space-12) var(--space-8)',
          borderRadius: 'var(--radius-xl)',
          border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border-medium)'}`,
          background: dragOver ? 'var(--accent-light)' : 'var(--bg-inset)',
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
        }}
      >
        {/* Cloud Upload Icon */}
        <div
          className="flex items-center justify-center rounded-2xl"
          style={{
            width: 64,
            height: 64,
            background: dragOver ? 'var(--accent)' : 'var(--bg-surface)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease',
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            stroke={dragOver ? '#fff' : 'var(--accent)'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 20a5 5 0 01-.7-9.9 7 7 0 0113.6-2A5 5 0 0122 14a5 5 0 01-5 5H6z" />
            <polyline points="10,15 14,11 18,15" />
            <line x1="14" y1="11" x2="14" y2="21" />
          </svg>
        </div>

        {/* Title */}
        <div className="text-center">
          <p
            className="font-display text-base font-semibold mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            Drop your screenshots here
          </p>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            PNG, JPG or WebP · up to 10 at once
          </p>
        </div>

        {/* Browse Button Visual */}
        <span className="btn btn-sm btn-secondary mt-1">
          Browse Files
        </span>

        {/* Hidden File Input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Inline Error */}
      {error && (
        <div
          className="flex items-center gap-2 mt-3 px-4 py-2.5 text-sm rounded-lg animate-fade-in"
          style={{
            background: 'var(--error-light)',
            color: 'var(--error)',
            border: '1px solid rgba(239,68,68,0.15)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
            <line x1="8" y1="5" x2="8" y2="8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="8" cy="11" r="0.8" fill="currentColor" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
