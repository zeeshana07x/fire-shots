'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import JSZip from 'jszip';
import { ScreenshotItem } from '@/lib/types';
import AppNav from '@/components/layout/AppNav';
import UploadZone from '@/components/studio/UploadZone';

const PRESET_STYLES = [
  { id: 'ref1-2d', name: '2D Playful Habit', image: '/references/ref1_2d.webp' },
  { id: 'ref1-3d', name: '3D Clean Isometric', image: '/references/ref1_3d.webp' },
  { id: 'ref2-2d', name: '2D App Store Standard', image: '/references/ref2_2d.webp' },
  { id: 'ref2-3d', name: '3D Angled Mockup', image: '/references/ref2_3d.webp' },
  { id: 'ref3-2d', name: '2D Minimal Light', image: '/references/ref3_2d.webp' },
  { id: 'ref3-3d', name: '3D Claymation Dark', image: '/references/ref3_3d.webp' },
  { id: 'ref4-2d', name: '2D Bright Vector', image: '/references/ref4_2d.webp' },
  { id: 'ref4-3d', name: '3D Colorful Soft', image: '/references/ref4_3d.webp' },
  { id: 'ref5-2d', name: '2D Sharp UI Focus', image: '/references/ref5_2d.webp' },
  { id: 'ref5-3d', name: '3D Soft UI Focus', image: '/references/ref5_3d.webp' },
  { id: 'ref6-3d', name: '3D Glassmorphism', image: '/references/ref6_3d.webp' },
];

export default function StudioPage() {
  const router = useRouter();

  // Phase 1: Uploads
  const [screenshots, setScreenshots] = useState<ScreenshotItem[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState<string>(PRESET_STYLES[0].id);

  // Phase 2: Generation state
  const [generating, setGenerating] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Phase 3: Download state
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

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

  const handleGenerate = async () => {
    if (screenshots.length === 0) return;
    setGenerating(true);
    setHasGenerated(true); // Transition immediately to view mode with loaders
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

      // Load the selected reference image and convert to base64
      const selectedStyle = PRESET_STYLES.find(s => s.id === selectedStyleId);
      if (!selectedStyle) throw new Error("Style not found");
      
      const refResponse = await fetch(selectedStyle.image);
      const refBlob = await refResponse.blob();
      const refDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(refBlob);
      });

      const refParts = refDataUrl.split(',');
      const refMimeMatch = refParts[0].match(/:(.*?);/);
      const refPayload = {
        base64: refParts[1],
        mediaType: refMimeMatch ? refMimeMatch[1] : 'image/webp'
      };

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          images: imagesPayload,
          referenceImage: refPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate');
      }

      // Start polling for batch completion
      const pollInterval = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/batches/${data.batchId}`);
          const pollData = await pollRes.json();

          if (!pollRes.ok) {
            throw new Error(pollData.error || 'Failed to check status');
          }

          if (pollData.status === 'completed') {
            clearInterval(pollInterval);
            setScreenshots((prev) =>
              prev.map((s, i) => ({
                ...s,
                id: pollData.screenshots[i]?.id || s.id,
                storage_path: pollData.screenshots[i]?.storage_path,
              }))
            );
            setSelectedIndex(0);
            setGenerating(false);
            router.refresh();
          } else if (pollData.status === 'failed') {
            clearInterval(pollInterval);
            setError(pollData.errorMessage || 'Generation failed');
            setGenerating(false);
            setHasGenerated(false);
          }
        } catch (err: any) {
          clearInterval(pollInterval);
          setError(err.message);
          setGenerating(false);
          setHasGenerated(false);
        }
      }, 2000);

    } catch (err: any) {
      setError(err.message);
      setGenerating(false);
      setHasGenerated(false);
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  const handleDownloadSingle = async () => {
    setDownloading(true);
    try {
      const current = screenshots[selectedIndex];
      if (!current.storage_path) return;
      await downloadImage(current.storage_path, `mockup-${current.position + 1}.png`);
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
      
      for (const s of screenshots) {
        if (s.storage_path) {
          const res = await fetch(s.storage_path);
          const blob = await res.blob();
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

  const phase = hasGenerated ? 'view' : 'upload';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>
      
      {/* --- HEADER --- */}
      {phase === 'upload' ? (
        <AppNav credits={150} userEmail="user@example.com" />
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setHasGenerated(false)}
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
              Back to Studio
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleDownloadSingle}
              className="btn btn-secondary btn-sm"
              disabled={downloading || generating}
            >
              Download This
            </button>
            <button
              onClick={handleDownloadAll}
              className="btn btn-primary btn-sm"
              disabled={downloading || generating}
            >
              Download All
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
                  Generate AI Mockups
                </h1>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Upload your UI screenshots, select a reference style, and AI will generate a complete, pixel-perfect composition.
                </p>
              </div>

              {/* Upload Section */}
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>1. Upload UI Screenshots</h2>
                <UploadZone onFilesSelected={handleFilesSelected} disabled={generating} />
                
                {screenshots.length > 0 && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                    {screenshots.map((s, i) => (
                      <div key={i} style={{ width: '80px', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                        <img src={s.dataUrl!} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Style Selection Section */}
              <div className="animate-fade-in delay-75">
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>2. Choose a Reference Style</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                  {PRESET_STYLES.map(style => (
                    <div 
                      key={style.id}
                      onClick={() => setSelectedStyleId(style.id)}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: selectedStyleId === style.id ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                        background: selectedStyleId === style.id ? 'var(--accent-tint)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <div style={{ width: '100%', aspectRatio: '9/16', borderRadius: '8px', overflow: 'hidden', background: '#f4f4f5' }}>
                        <img src={style.image} alt={style.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '13px', textAlign: 'center', color: 'var(--text-primary)' }}>{style.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {screenshots.length > 0 && (
                <div className="animate-slide-in-right" style={{ paddingBottom: '64px' }}>
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {generating ? 'Starting...' : `Generate ${screenshots.length} Final Image${screenshots.length !== 1 ? 's' : ''}`}
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
                      aspectRatio: '9/16',
                      borderRadius: '10px',
                      border: isActive ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {s.storage_path ? (
                      <img
                        src={s.storage_path}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ position: 'relative', width: '100%', height: '100%', background: '#f4f4f5' }}>
                        {s.dataUrl && (
                           <img src={s.dataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* COLUMN 2: CENTER PREVIEW */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px',
                background: 'var(--bg-base)',
                overflowY: 'auto',
              }}
            >
              {/* Image Preview Area */}
              {screenshots[selectedIndex]?.storage_path ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '400px' }}>
                  <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', aspectRatio: '9/16', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                    <img 
                      src={screenshots[selectedIndex].storage_path!} 
                      alt="Generated Mockup" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                      Generated by OpenAI GPT-Image-2
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '24px' }}>
                  <svg className="animate-spin" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                    <line x1="18" y1="12" x2="22" y2="12"></line>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                  </svg>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600 }}>
                    Generating True AI Mockups...
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Passing reference style and screenshots to GPT-Image-2 Vision. Hang tight!
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
