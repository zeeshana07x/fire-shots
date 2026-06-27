/**
 * Offscreen canvas renderer — mirrors the logic in CanvasPreview.tsx
 * but runs entirely in a detached HTMLCanvasElement so it can be used
 * for "Download All" without mounting a React component.
 */
import { ColorPalette, IconKeyword, ScreenshotItem } from './types';

const CANVAS_W = 1080;
const CANVAS_H = 1920;

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [100, 100, 200];
}

function drawIcon(
  ctx: CanvasRenderingContext2D,
  icon: IconKeyword,
  cx: number,
  cy: number,
  size: number,
) {
  ctx.save();
  ctx.strokeStyle = '#FFFFFF';
  ctx.fillStyle = '#FFFFFF';
  ctx.lineWidth = size * 0.12;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const s = size * 0.38;

  switch (icon) {
    case 'spark': {
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
        ctx.roundRect(
          cx + dx! * (gs / 2 + gap / 2) - gs / 2,
          cy + dy! * (gs / 2 + gap / 2) - gs / 2,
          gs,
          gs,
          3,
        );
        ctx.fill();
      });
      break;
    }
  }
  ctx.restore();
}

export default async function renderToBlob(
  screenshot: ScreenshotItem,
  palette: ColorPalette,
): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
  grad.addColorStop(0, palette.bg || '#5B47E0');
  grad.addColorStop(1, palette.bg2 || '#3730A3');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Decorative card 1
  ctx.save();
  ctx.translate(CANVAS_W * 0.78, CANVAS_H * 0.14);
  ctx.rotate((15 * Math.PI) / 180);
  const [r1, g1, b1] = hexToRgb(palette.card1 || '#FFFFFF');
  ctx.fillStyle = `rgba(${r1},${g1},${b1},0.18)`;
  ctx.beginPath();
  ctx.roundRect(-140, -80, 280, 160, 20);
  ctx.fill();
  ctx.restore();

  // Decorative card 2
  ctx.save();
  ctx.translate(CANVAS_W * 0.18, CANVAS_H * 0.82);
  ctx.rotate((-12 * Math.PI) / 180);
  const [r2, g2, b2] = hexToRgb(palette.card2 || '#FFFFFF');
  ctx.fillStyle = `rgba(${r2},${g2},${b2},0.14)`;
  ctx.beginPath();
  ctx.roundRect(-110, -60, 220, 120, 16);
  ctx.fill();
  ctx.restore();

  // Text
  const textColor = palette.text || '#FFFFFF';
  const textPadding = 90;
  let textY = 160;

  ctx.font = `500 30px 'DM Sans', sans-serif`;
  ctx.fillStyle = textColor;
  ctx.globalAlpha = 0.72;
  ctx.fillText((screenshot.eyebrow || '').toUpperCase(), textPadding, textY);
  ctx.globalAlpha = 1;

  const headline = screenshot.headline || '';
  ctx.font = `800 96px 'Bricolage Grotesque', sans-serif`;
  ctx.fillStyle = textColor;
  const words = headline.split(' ');
  const maxLineWidth = CANVAS_W - textPadding * 2;
  let line = '';
  let headlineY = textY + 70;
  for (const word of words) {
    const test = line + (line ? ' ' : '') + word;
    if (ctx.measureText(test).width > maxLineWidth && line) {
      ctx.fillText(line, textPadding, headlineY);
      line = word;
      headlineY += 108;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, textPadding, headlineY);

  ctx.font = `400 34px 'DM Sans', sans-serif`;
  ctx.fillStyle = textColor;
  ctx.globalAlpha = 0.82;
  let supLine = '';
  let supLineY = headlineY + 70;
  for (const word of (screenshot.supporting || '').split(' ')) {
    const test = supLine + (supLine ? ' ' : '') + word;
    if (ctx.measureText(test).width > maxLineWidth && supLine) {
      ctx.fillText(supLine, textPadding, supLineY);
      supLine = word;
      supLineY += 48;
    } else {
      supLine = test;
    }
  }
  ctx.fillText(supLine, textPadding, supLineY);
  ctx.globalAlpha = 1;

  // Phone frame
  const phoneW = 480;
  const phoneH = 880;
  const phoneX = (CANVAS_W - phoneW) / 2;
  const phoneY = supLineY + 90;
  const bezel = 14;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 80;
  ctx.shadowOffsetY = 30;
  ctx.fillStyle = '#1A1816';
  ctx.beginPath();
  ctx.roundRect(phoneX, phoneY, phoneW, phoneH, 48);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#0A0A0A';
  ctx.beginPath();
  ctx.roundRect(phoneX + bezel, phoneY + bezel, phoneW - bezel * 2, phoneH - bezel * 2, 36);
  ctx.fill();

  const screenX = phoneX + bezel + 2;
  const screenY = phoneY + bezel + 2;
  const screenW = phoneW - (bezel + 2) * 2;
  const screenH = phoneH - (bezel + 2) * 2;

  ctx.fillStyle = '#1A1816';
  ctx.beginPath();
  ctx.roundRect(phoneX + phoneW / 2 - 50, phoneY + bezel - 2, 100, 28, 14);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(screenX, screenY, screenW, screenH, 34);
  ctx.clip();

  if (screenshot.dataUrl) {
    const img = new Image();
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = screenshot.dataUrl!;
    });
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
    const ph = ctx.createLinearGradient(screenX, screenY, screenX, screenY + screenH);
    ph.addColorStop(0, '#2D2D2D');
    ph.addColorStop(1, '#1A1A1A');
    ctx.fillStyle = ph;
    ctx.fillRect(screenX, screenY, screenW, screenH);
  }
  ctx.restore();

  // Icon badge
  const badgeR = 56;
  const badgeX = phoneX + phoneW - 30;
  const badgeY = phoneY + phoneH - 20;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = palette.accent || '#5B47E0';
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawIcon(ctx, screenshot.icon || 'spark', badgeX, badgeY, badgeR);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}
