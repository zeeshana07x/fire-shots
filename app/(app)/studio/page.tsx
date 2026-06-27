'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import JSZip from 'jszip';
import { ScreenshotItem, ScreenshotContent } from '@/lib/types';
import AppNav from '@/components/layout/AppNav';
import UploadZone from '@/components/studio/UploadZone';

const PRESET_STYLES = [
  { id: '3d-fox', name: '3D Character (Running Fox)', prompt: 'A highly rendered 3D scene with a cute cartoon character running on a track, beautiful sunny lighting, vibrant colors' },
  { id: '2d-raccoon', name: '2D Mascot (Raccoon)', prompt: 'A flat 2D illustrated style forest with a cute raccoon mascot, soft pastel colors' },
  { id: '3d-cafe', name: '3D Claymation Cafe', prompt: 'A 3D claymation style isometric cozy cafe interior with miniature people working on laptops' },
  { id: 'flat-remote', name: 'Flat Vector Hand', prompt: 'Flat vector art of a hand holding the phone, abstract shapes in the background' }
];

export default function StudioPage() {
  const router = useRouter();

  // Phase 1: Uploads
  const [screenshots, setScreenshots] = useState<ScreenshotItem[]>([]);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referenceDataUrl, setReferenceDataUrl] = useState<string | null>(null);
  const [selectedStyleId, setSelectedStyleId] = useState<string>('3d-fox');
  const [customPrompt, setCustomPrompt] = useState<string>('');

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

  const handleReferenceSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReferenceFile(file);
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
    setReferenceDataUrl(dataUrl);
    setSelectedStyleId('custom');
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

      let refPayload = undefined;
      if (referenceDataUrl) {
        const parts = referenceDataUrl.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        refPayload = {
          base64: parts[1],
          mediaType: mimeMatch ? mimeMatch[1] : 'image/png'
        };
      }

      const stylePrompt = selectedStyleId === 'custom' 
        ? customPrompt 
        : PRESET_STYLES.find(s => s.id === selectedStyleId)?.prompt;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          images: imagesPayload,
          referenceImage: refPayload,
          stylePrompt
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate');
      }

      setScreenshots((prev) =>
        prev.map((s, i) => ({
          ...s,
          id: data.screenshots[i]?.id || s.id,
          storage_path: data.screenshots[i]?.storage_path,
        }))
      );
      setHasGenerated(true);
      setSelectedIndex(0);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadSingle = async () => {
    setDownloading(true);
    try {
      const current = screenshots[selectedIndex];
      if (!current.storage_path) return;
      
      const res = await fetch(current.storage_path);
      const blob = await res.blob();
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
              disabled={downloading}
            >
              Download This
            </button>
            <button
              onClick={handleDownloadAll}
              className="btn btn-primary btn-sm"
              disabled={downloading}
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
                  Generate DALL-E Mockups
                </h1>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Upload your UI screenshots, select a style, and AI will generate the full 3D composition.
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {PRESET_STYLES.map(style => (
                    <div 
                      key={style.id}
                      onClick={() => { setSelectedStyleId(style.id); setReferenceDataUrl(null); }}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: selectedStyleId === style.id ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                        background: selectedStyleId === style.id ? 'var(--accent-tint)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px', color: 'var(--text-primary)' }}>{style.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{style.prompt}</div>
                    </div>
                  ))}
                  
                  <div 
                    onClick={() => setSelectedStyleId('custom')}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: selectedStyleId === 'custom' ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                      background: selectedStyleId === 'custom' ? 'var(--accent-tint)' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Upload Custom Style</div>
                    {selectedStyleId === 'custom' && (
                      <>
                        <input type="file" accept="image/*" onChange={handleReferenceSelected} style={{ fontSize: '12px' }} />
                        {referenceDataUrl && (
                          <img src={referenceDataUrl} alt="Reference" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
                        )}
                        <textarea 
                          placeholder="Describe the style (e.g. 3D cute fox)" 
                          value={customPrompt}
                          onChange={e => setCustomPrompt(e.target.value)}
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '12px', minHeight: '60px' }}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {screenshots.length > 0 && (
                <div className="animate-slide-in-right">
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {generating ? 'Generating with OpenAI...' : `Generate ${screenshots.length} Final Image${screenshots.length !== 1 ? 's' : ''}`}
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
                      <div style={{ width: '100%', height: '100%', background: '#e2e2ea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>Loading...</div>
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
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px',
                background: 'var(--bg-base)',
                overflowY: 'auto',
              }}
            >
              {screenshots[selectedIndex]?.storage_path && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '400px' }}>
                  <img 
                    src={screenshots[selectedIndex].storage_path!} 
                    alt="Final Mockup" 
                    style={{ width: '100%', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} 
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                      Generated by OpenAI DALL-E 3
                    </span>
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
