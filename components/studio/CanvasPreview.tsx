'use client';

import { useEffect, useRef, useCallback } from 'react';
import { ColorPalette, IconKeyword, ScreenshotItem } from '@/lib/types';

interface CanvasPreviewProps {
  screenshot: ScreenshotItem;
  palette: ColorPalette;
  className?: string;
}

// Draw icon shapes on canvas
function drawIcon(ctx: CanvasRenderingContext2D, icon: IconKeyword, cx: number, cy: number, size: number) {
  ctx.save();
  ctx.strokeStyle = '#FFFFFF';
  ctx.fillStyle = '#FFFFFF';
  ctx.lineWidth = size * 0.12;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const s = size * 0.38;

  switch (icon) {
    case 'spark': {
      // 4-pointed star
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4 - Math.PI / 2;
        const r = i % 2 === 0 ? s : s * 0.4;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'bolt': {
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.2, cy - s);
      ctx.lineTo(cx - s * 0.3, cy + s * 0.1);
      ctx.lineTo(cx + s * 0.05, cy + s * 0.1);
      ctx.lineTo(cx - s * 0.2, cy + s);
      ctx.lineTo(cx + s * 0.3, cy - s * 0.1);
      ctx.lineTo(cx - s * 0.05, cy - s * 0.1);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'star': {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? s : s * 0.4;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'check': {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.55, cy);
      ctx.lineTo(cx - s * 0.15, cy + s * 0.45);
      ctx.lineTo(cx + s * 0.55, cy - s * 0.45);
      ctx.stroke();
      break;
    }
    case 'heart': {
      ctx.beginPath();
      ctx.moveTo(cx, cy + s * 0.6);
      ctx.bezierCurveTo(cx - s * 1.1, cy - s * 0.1, cx - s * 1.1, cy - s * 0.9, cx, cy - s * 0.3);
      ctx.bezierCurveTo(cx + s * 1.1, cy - s * 0.9, cx + s * 1.1, cy - s * 0.1, cx, cy + s * 0.6);
      ctx.fill();
      break;
    }
    case 'shield': {
      ctx.beginPath();
      ctx.moveTo(cx, cy - s);
      ctx.lineTo(cx + s * 0.8, cy - s * 0.5);
      ctx.lineTo(cx + s * 0.8, cy + s * 0.2);
      ctx.quadraticCurveTo(cx + s * 0.8, cy + s, cx, cy + s);
      ctx.quadraticCurveTo(cx - s * 0.8, cy + s, cx - s * 0.8, cy + s * 0.2);
      ctx.lineTo(cx - s * 0.8, cy - s * 0.5);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'stack': {
      const h = s * 0.28;
      [-s * 0.5, 0, s * 0.5].forEach((dy, i) => {
        ctx.beginPath();
        ctx.roundRect(cx - s * 0.7, cy + dy - h / 2, s * 1.4, h, 3);
        ctx.globalAlpha = 1 - i * 0.2;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      break;
    }
    case 'grid': {
      const gs = s * 0.38;
      const gap = s * 0.16;
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.roundRect(cx + dx * (gs / 2 + gap / 2) - gs / 2, cy + dy * (gs / 2 + gap / 2) - gs / 2, gs, gs, 3);
        ctx.fill();
      });
      break;
    }
  }
  ctx.restore();
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [100, 100, 200];
}

const CANVAS_W = 1080;
const CANVAS_H = 1920;

export default function CanvasPreview({ screenshot, palette, className }: CanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // 1. Background - Flat color, no gradients
    ctx.fillStyle = palette.bg || '#f4f4f8';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Subtle pattern or flat accent shapes instead of glowing gradients
    // We'll add a clean flat accent shape
    ctx.fillStyle = palette.bg2 || '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(CANVAS_W, 0);
    ctx.lineTo(CANVAS_W, CANVAS_H * 0.4);
    ctx.lineTo(0, CANVAS_H * 0.3);
    ctx.fill();

    // 2. Icon Badge (Top center, flat design, no shadow)
    const badgeR = 56;
    const badgeX = CANVAS_W / 2;
    const badgeY = 180;

    // Outer border for depth
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, badgeR + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e2e2ea';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner badge
    ctx.fillStyle = palette.accent || '#10b981';
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
    ctx.fill();

    drawIcon(ctx, screenshot.icon || 'spark', badgeX, badgeY, badgeR);

    // 3. Text section
    const textColor = palette.text || '#0d0d12';
    const textPadding = 80;
    const maxLineWidth = CANVAS_W - textPadding * 2;
    
    let currentY = badgeY + 120;
    
    // Eyebrow
    const eyebrow = (screenshot.eyebrow || '').toUpperCase();
    if (eyebrow) {
      ctx.font = `700 24px 'Space Grotesk', sans-serif`;
      ctx.fillStyle = palette.accent || '#10b981';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '2px';
      ctx.fillText(eyebrow, CANVAS_W / 2, currentY);
      currentY += 60;
      ctx.letterSpacing = '0px';
    } else {
      currentY += 20;
    }

    // Headline
    const headline = screenshot.headline || 'Headline';
    ctx.font = `700 88px 'Space Grotesk', sans-serif`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '-2px';

    const words = headline.split(' ');
    let line = '';
    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxLineWidth && line) {
        ctx.fillText(line, CANVAS_W / 2, currentY);
        line = word;
        currentY += 100;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, CANVAS_W / 2, currentY);
    ctx.letterSpacing = '0px';
    currentY += 80;

    // Supporting text
    const supporting = screenshot.supporting || '';
    if (supporting) {
      ctx.font = `400 34px 'Inter', sans-serif`;
      ctx.fillStyle = '#52525f'; // specific muted color from constraints
      ctx.textAlign = 'center';
      
      let supLine = '';
      for (const word of supporting.split(' ')) {
        const testLine = supLine + (supLine ? ' ' : '') + word;
        if (ctx.measureText(testLine).width > maxLineWidth && supLine) {
          ctx.fillText(supLine, CANVAS_W / 2, currentY);
          supLine = word;
          currentY += 52;
        } else {
          supLine = testLine;
        }
      }
      ctx.fillText(supLine, CANVAS_W / 2, currentY);
      currentY += 100;
    } else {
      currentY += 60;
    }

    // 4. Modern Flat Phone Frame
    const phoneW = 820;
    const phoneH = 1680;
    const phoneX = (CANVAS_W - phoneW) / 2;
    const phoneY = currentY;

    // Flat phone body (no shadows, just borders)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(phoneX, phoneY, phoneW, phoneH, 48);
    ctx.fill();

    // Outer border for depth
    ctx.strokeStyle = '#e2e2ea';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Screen Bezel Inner
    const bezel = 20;
    ctx.fillStyle = '#0d0d12'; // Near black
    ctx.beginPath();
    ctx.roundRect(phoneX + bezel, phoneY + bezel, phoneW - bezel * 2, phoneH - bezel * 2, 32);
    ctx.fill();

    // Screen area
    const screenX = phoneX + bezel + 4;
    const screenY = phoneY + bezel + 4;
    const screenW = phoneW - (bezel + 4) * 2;
    const screenH = phoneH - (bezel + 4) * 2;

    // Screenshot inside screen
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(screenX, screenY, screenW, screenH, 28);
    ctx.clip();

    if (screenshot.dataUrl) {
      const img = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = screenshot.dataUrl!;
      });
      // cover
      const imgAspect = img.width / img.height;
      const screenAspect = screenW / screenH;
      let drawW = screenW, drawH = screenH, drawX = screenX, drawY = screenY;
      if (imgAspect > screenAspect) {
        drawH = screenH;
        drawW = screenH * imgAspect;
        drawX = screenX - (drawW - screenW) / 2;
      } else {
        drawW = screenW;
        drawH = screenW / imgAspect;
        drawY = screenY - (drawH - screenH) / 2;
      }
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(screenX, screenY, screenW, screenH);
    }
    
    // Flat top bar indicator
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    ctx.fillRect(screenX, screenY, screenW, 40);

    ctx.restore();

    // Flat notch
    ctx.fillStyle = '#0d0d12';
    ctx.beginPath();
    ctx.roundRect(CANVAS_W / 2 - 80, phoneY + bezel, 160, 44, 22);
    ctx.fill();
    
    // Flat camera pill inside notch
    ctx.fillStyle = '#1e1e24';
    ctx.beginPath();
    ctx.roundRect(CANVAS_W / 2 + 30, phoneY + bezel + 12, 20, 20, 10);
    ctx.fill();

  }, [screenshot, palette]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Expose canvas for download
  if (canvasRef.current) {
    Object.assign(canvasRef.current, {
      exportCanvas: () => canvasRef.current,
    });
  }

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className={className}
      style={{
        width: '100%',
        height: 'auto',
        borderRadius: 'var(--radius-lg)',
        display: 'block',
      }}
      data-canvas-id={screenshot.id}
    />
  );
}

export { CANVAS_W, CANVAS_H };
