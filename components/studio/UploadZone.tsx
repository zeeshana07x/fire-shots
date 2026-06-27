'use client';

import { useCallback, useRef, useState } from 'react';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_FILES = 10;
const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

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
        return `"${file.name}" exceeds the 15 MB size limit.`;
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
          padding: '56px 24px',
          borderRadius: '14px',
          border: `2px dashed ${dragOver ? 'var(--accent)' : '#c8c8d8'}`,
          background: dragOver ? 'var(--accent-tint)' : '#f1f1f5',
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
        }}
      >
        {/* Yellow Folder Icon */}
        <div
          className="flex items-center justify-center"
          style={{
            width: '64px',
            height: '64px',
            transition: 'all 0.2s ease',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path
              d="M10 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6H12L10 4Z"
              fill="#fbbf24"
            />
          </svg>
        </div>

        {/* Title */}
        <div className="text-center">
          <p
            className="font-display text-base font-semibold mb-1"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.5px' }}
          >
            Drop screenshots here
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            or click to browse · PNG, JPG · max 15 MB · up to 10
          </p>
        </div>

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
