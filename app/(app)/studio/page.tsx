'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import JSZip from 'jszip';
import { ScreenshotItem, ColorPalette, ScreenshotContent } from '@/lib/types';
import AppNav from '@/components/layout/AppNav';
import UploadZone from '@/components/studio/UploadZone';
import ScreenshotGrid from '@/components/studio/ScreenshotGrid';
import EditorPanel from '@/components/studio/EditorPanel';
import CanvasPreview from '@/components/studio/CanvasPreview';

export default function StudioPage() {
  const router = useRouter();

  // Phase 1: Uploads
  const [screenshots, setScreenshots] = useState<ScreenshotItem[]>([]);
  const [palette, setPalette] = useState<ColorPalette | null>(null);

  // Phase 2/3: Editor state
  const [generating, setGenerating] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [revising, setRevising] = useState(false);

  // Phase 4: Download state
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    setError(null);
    const newItems: ScreenshotItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      newItems.push({
        id: `local-${Date.now()}-${i}`,
        position: screenshots.length + i,
        file,
        dataUrl,
        eyebrow: '',
        headline: '',
        supporting: '',
        icon: 'spark',
      });
    }

    setScreenshots((prev) => [...prev, ...newItems].slice(0, 10)); // Max 10
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy.map((s, i) => ({ ...s, position: i }));
    });
    if (selectedIndex >= screenshots.length - 1) {
      setSelectedIndex(Math.max(0, screenshots.length - 2));
    }
  };

  const handleGenerate = async () => {
    if (screenshots.length === 0) return;
    setGenerating(true);
    setError(null);

    try {
      const imagesPayload = screenshots.map(s => {
        const parts = s.dataUrl!.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        return {
          base64: parts[1],
          mediaType: mimeMatch ? mimeMatch[1] : 'image/png'
        };
      });

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: imagesPayload }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate');
      }

      setPalette(data.palette);
      setScreenshots((prev) =>
        prev.map((s, i) => ({
          ...s,
          id: data.screenshots[i]?.id || s.id,
          eyebrow: data.screenshots[i]?.eyebrow || 'New Feature',
          headline: data.screenshots[i]?.headline || 'Feature Title',
          supporting: data.screenshots[i]?.supporting || 'Feature description',
          icon: data.screenshots[i]?.icon || 'spark',
        }))
      );
      setSelectedIndex(0);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const updateScreenshot = (fields: Partial<ScreenshotContent>) => {
    setScreenshots((prev) => {
      const copy = [...prev];
      copy[selectedIndex] = { ...copy[selectedIndex], ...fields };
      return copy;
    });
  };

  const handleRevise = async (instruction: string) => {
    const current = screenshots[selectedIndex];
    if (!current.id || current.id.startsWith('local-')) {
      setError('Cannot revise unsaved screenshot');
      return;
    }

    setRevising(true);
    setError(null);

    try {
      const res = await fetch('/api/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screenshotId: current.id,
          instruction,
          currentContent: {
            eyebrow: current.eyebrow,
            headline: current.headline,
            supporting: current.supporting,
            icon: current.icon
          }
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Revision failed');

      updateScreenshot({
        eyebrow: data.eyebrow,
        headline: data.headline,
        supporting: data.supporting,
        icon: data.icon,
      });
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRevising(false);
    }
  };

  const getCanvasBlob = async (id: string): Promise<Blob | null> => {
    const canvas = document.querySelector(`canvas[data-canvas-id="${id}"]`) as HTMLCanvasElement | null;
    if (!canvas) return null;
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
  };

  const handleDownloadSingle = async () => {
    setDownloading(true);
    try {
      const current = screenshots[selectedIndex];
      const blob = await getCanvasBlob(current.id);
      if (!blob) throw new Error('Canvas not found');

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mockup-${current.position + 1}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Failed to download');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadAll = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      
      // Hidden canvas generator loop to assemble the ZIP properly
      for (const s of screenshots) {
        const blob = await getCanvasBlob(s.id);
        if (blob) {
          zip.file(`mockup-${s.position + 1}.png`, blob);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fireshots-mockups.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Failed to zip all screenshots');
    } finally {
      setDownloading(false);
    }
  };

  const phase = palette ? 'edit' : 'upload';
  const projectTitle = screenshots[0]?.headline || 'HealthTrack Pro';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>
      
      {/* --- HEADER --- */}
      {phase === 'upload' ? (
        <AppNav credits={150} userEmail="zeeshana07x" />
      ) : (
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            height: '56px',
            background: '#ffffff',
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0,
          }}
        >
          {/* Left info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link
              href="/dashboard"
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Dashboard
            </Link>
            
            <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)' }} />

            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, letterSpacing: '-1.2px', color: 'var(--accent)' }}>
                Fire
              </span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, letterSpacing: '-1.2px', color: 'var(--text-primary)' }}>
                shots
              </span>
            </div>

            <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)' }} />

            <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {projectTitle}
            </span>
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleDownloadSingle}
              className="btn btn-secondary btn-sm"
              disabled={downloading}
            >
              This one
            </button>
            <button
              onClick={handleDownloadAll}
              className="btn btn-primary btn-sm"
              disabled={downloading}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download all
            </button>
          </div>
        </header>
      )}

      {/* --- BODY --- */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {error && (
          <div style={{ margin: '16px 24px', padding: '12px 16px', borderRadius: '8px', background: 'var(--error-light)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.15)', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {phase === 'upload' ? (
          <div style={{ height: '100%', overflowY: 'auto', padding: '48px 24px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 'var(--max-width)', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div className="animate-fade-in">
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 700, letterSpacing: '-1.5px', marginBottom: '5px' }}>
                  New batch
                </h1>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Upload up to 10 screenshots. Order is preserved in the output.
                </p>
              </div>

              <UploadZone onFilesSelected={handleFilesSelected} disabled={generating} />

              {screenshots.length > 0 && (
                <div className="animate-slide-in-right" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <ScreenshotGrid
                    screenshots={screenshots}
                    onRemove={removeScreenshot}
                    generating={generating}
                  />

                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {generating ? 'Generating mockups...' : `Generate ${screenshots.length} screenshot${screenshots.length !== 1 ? 's' : ''} · ${screenshots.length} credit${screenshots.length !== 1 ? 's' : ''}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden' }}>
            
            {/* COLUMN 1: LEFT VERTICAL SLIDES / THUMBNAILS (Width: 160px) */}
            <div
              style={{
                width: '160px',
                background: '#ffffff',
                borderRight: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '16px 12px',
                overflowY: 'auto',
                flexShrink: 0,
              }}
            >
              {screenshots.map((s, i) => {
                const isActive = i === selectedIndex;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedIndex(i)}
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '3/5',
                      borderRadius: '10px',
                      border: isActive ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                      background: `linear-gradient(135deg, ${palette?.bg || '#5B47E0'} 0%, ${palette?.bg2 || '#3730A3'} 100%)`,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'border-color 0.15s, transform 0.15s',
                    }}
                  >
                    {/* Simulated Phone Mockup inside Left Thumbnail Button */}
                    <div
                      style={{
                        width: '75%',
                        height: '75%',
                        borderRadius: '6px',
                        background: '#0a0a0a',
                        border: '1.5px solid #1a1816',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {s.dataUrl && (
                        <img
                          src={s.dataUrl}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      )}
                    </div>

                    {/* Small number indicator on active selection */}
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '6px',
                        left: '6px',
                        fontSize: '9px',
                        fontWeight: 700,
                        color: '#ffffff',
                        background: 'rgba(0,0,0,0.4)',
                        padding: '1px 4px',
                        borderRadius: '3px',
                      }}
                    >
                      {i + 1}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* COLUMN 2: CENTER WORKSPACE WORK AREA (Large mockup preview) */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px',
                background: 'var(--bg-base)',
                overflowY: 'auto',
              }}
            >
              {palette && screenshots[selectedIndex] && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '380px' }}>
                  <div
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '16px',
                    }}
                  >
                    <CanvasPreview
                      screenshot={screenshots[selectedIndex]}
                      palette={palette}
                      className="w-full"
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                      1080 × 1920 px · store-ready
                    </span>
                    <button
                      onClick={handleDownloadSingle}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                    >
                      Download PNG
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* COLUMN 3: RIGHT PANEL EDITOR FIELDS (Width: 340px) */}
            {palette && screenshots[selectedIndex] && (
              <EditorPanel
                screenshot={screenshots[selectedIndex]}
                onUpdate={updateScreenshot}
                onRevise={handleRevise}
                revising={revising}
              />
            )}

          </div>
        )}
      </div>

    </div>
  );
}
