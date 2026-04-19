import type { Player } from '../entities/Player';
import type { Obstacle } from '../entities/Obstacle';
import type { Background } from '../entities/Background';
import type { InputType, RoundState } from '../types';
import { GamePhase } from '../types';
import {
  CANVAS_H,
  CANVAS_W,
  GROUND_Y,
  OBSTACLE_W,
  PLAYER_H,
  PLAYER_W,
} from '../utils/constants';
import type { FlashEffect } from '../core/FlashEffect';
import { renderFlash } from './FlashEffect';
import { renderGhostIndicator } from './GhostIndicator';

const COUNTDOWN_TOTAL_MS = 3000;

export interface MirrorHint {
  id: string;
  mirrorTime: number;
  type: InputType;
  used: boolean;
}

/** tap → alçak gösterge (normal zıplama), hold_start → yüksek gösterge (güçlü zıplama) */
function laneForType(type: InputType): 0 | 1 | 2 {
  return type === 'hold_start' ? 2 : 0;
}

export class Renderer {
  constructor(private ctx: CanvasRenderingContext2D) {}

  render(
    state: RoundState,
    player: Player,
    obstacles: Obstacle[],
    background: Background,
    flash?: FlashEffect,
    mirrors?: ReadonlyArray<MirrorHint>
  ): void {
    this.clear();
    this.drawBackground(background);
    this.drawGround();
    this.drawObstacles(obstacles);
    this.drawPlayer(player);

    if (
      mirrors &&
      state.phase === GamePhase.SECOND_HALF &&
      state.hintEnabled
    ) {
      for (const m of mirrors) {
        if (m.used) continue;
        renderGhostIndicator(
          this.ctx,
          m.mirrorTime,
          state.elapsedMs,
          laneForType(m.type),
          true
        );
      }
    }

    if (flash && state.phase === GamePhase.REWIND) {
      renderFlash(this.ctx, flash);
    }

    if (state.phase === GamePhase.COUNTDOWN) {
      this.drawCountdown(state.elapsedMs);
    }
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  }

  private drawBackground(background: Background): void {
    // Gradyan gökyüzü
    const grad = this.ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grad.addColorStop(0, '#0b0b22');
    grad.addColorStop(1, '#1b1140');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Kaydırılan yatay ızgara çizgileri (derinlik hissi)
    const vOffset = background.offset % 40;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    this.ctx.lineWidth = 1;
    for (let y = 60 - vOffset; y < GROUND_Y; y += 40) {
      if (y < 30) continue;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(CANVAS_W, y);
      this.ctx.stroke();
    }

    // Sola kayan dikey şerit çizgiler (hareket hissi)
    const hOffset = background.offset % 80;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    for (let x = CANVAS_W - hOffset; x >= -80; x -= 80) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, GROUND_Y);
      this.ctx.stroke();
    }
  }

  private drawGround(): void {
    this.ctx.fillStyle = '#222';
    this.ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
    this.ctx.strokeStyle = '#3fd974';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, GROUND_Y);
    this.ctx.lineTo(CANVAS_W, GROUND_Y);
    this.ctx.stroke();
  }

  private drawObstacles(obstacles: Obstacle[]): void {
    for (const o of obstacles) {
      if (!o.alive) continue;
      const b = o.bounds();
      switch (o.data.type) {
        case 'low':
          this.ctx.fillStyle = o.collided ? '#552222' : '#cc4444';
          break;
        case 'high':
          this.ctx.fillStyle = o.collided ? '#554422' : '#ddaa44';
          break;
        case 'block':
          this.ctx.fillStyle = o.collided ? '#442255' : '#8844cc';
          break;
      }
      this.ctx.fillRect(b.x, b.y, b.w, b.h);
      // İnce highlight
      this.ctx.fillStyle = 'rgba(255,255,255,0.12)';
      this.ctx.fillRect(b.x, b.y, b.w, 3);
      void OBSTACLE_W;
    }
  }

  private drawPlayer(player: Player): void {
    const r = 6;
    const x = player.x;
    const y = player.y;
    const w = PLAYER_W;
    const h = PLAYER_H;
    this.ctx.fillStyle = '#3fdfff';
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + w - r, y);
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    this.ctx.lineTo(x + w, y + h - r);
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.ctx.lineTo(x + r, y + h);
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.fillStyle = '#0a2a33';
    this.ctx.fillRect(x + 8, y + 14, 4, 4);
    this.ctx.fillRect(x + w - 12, y + 14, 4, 4);
  }

  /**
   * Countdown fazında büyük sayısal geri sayım gösterimi.
   * Her saniye değişir, geçiş anında büyüyüp solar.
   */
  private drawCountdown(elapsedMs: number): void {
    const remaining = Math.ceil(
      (COUNTDOWN_TOTAL_MS - elapsedMs) / 1000
    );
    const n = Math.max(1, Math.min(3, remaining));

    // 0→1 arası: saniye içindeki ilerleme (her saniyenin başında 1.0, sonunda 0.0)
    const fraction = ((COUNTDOWN_TOTAL_MS - elapsedMs) % 1000) / 1000;
    // Sayı her değiştiğinde büyük başlayıp küçülür
    const scale = 0.8 + fraction * 0.4;
    const alpha = 0.5 + fraction * 0.5;

    const cx = CANVAS_W / 2;
    const cy = CANVAS_H / 2;

    // "HAZIRLAN!" metni
    this.ctx.save();
    this.ctx.globalAlpha = 0.75;
    this.ctx.font = 'bold 18px system-ui, sans-serif';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('HAZIRLAN!', cx, cy - 90);
    this.ctx.restore();

    // Sayı
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    const fontSize = Math.round(110 * scale);
    this.ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
    this.ctx.fillStyle = '#3fdfff';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.shadowBlur = 36;
    this.ctx.shadowColor = '#3fdfff';
    this.ctx.fillText(String(n), cx, cy);
    this.ctx.restore();

    // Alt ipucu metni
    this.ctx.save();
    this.ctx.globalAlpha = 0.55;
    this.ctx.font = '13px system-ui, sans-serif';
    this.ctx.fillStyle = '#aaa';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      'Kısa bas → normal zıplama  |  Uzun bas → yüksek zıplama',
      cx,
      cy + 80
    );
    this.ctx.restore();
  }
}
