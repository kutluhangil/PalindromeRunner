import type { FlashEffect } from '../core/FlashEffect';
import { FLASH_DURATION_MS } from '../core/FlashEffect';
import { CANVAS_H, CANVAS_W } from '../utils/constants';

export function renderFlash(ctx: CanvasRenderingContext2D, flash: FlashEffect): void {
  if (!flash.isActive()) return;
  const progress = flash.getProgress();
  const alpha = Math.sin(progress * Math.PI);
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.3})`;
  for (let y = 0; y < CANVAS_H; y += 4) {
    ctx.fillRect(0, y, CANVAS_W, 1);
  }
  void FLASH_DURATION_MS;
}
