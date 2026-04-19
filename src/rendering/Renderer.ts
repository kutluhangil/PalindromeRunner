import type { Player } from '../entities/Player';
import type { Obstacle } from '../entities/Obstacle';
import type { Background } from '../entities/Background';
import type { InputType, RoundState } from '../types';
import { GamePhase } from '../types';
import { CANVAS_H, CANVAS_W, GROUND_Y } from '../utils/constants';
import type { FlashEffect } from '../core/FlashEffect';
import { renderFlash } from './FlashEffect';
import { renderGhostIndicator } from './GhostIndicator';

const COUNTDOWN_TOTAL_MS = 3000;
const GROUND_H = CANVAS_H - GROUND_Y; // 60px

export interface MirrorHint {
  id: string;
  mirrorTime: number;
  type: InputType;
  used: boolean;
}

function laneForType(type: InputType): 0 | 1 | 2 {
  return type === 'hold_start' ? 2 : 0;
}

/** Rounded rectangle path helper */
function rrect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Tint a hex color by +/- amount per channel */
function tint(hex: string, d: number): string {
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(1, 3), 16) + d));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(3, 5), 16) + d));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(5, 7), 16) + d));
  return `rgb(${r},${g},${b})`;
}

// ─── Static scene data ─────────────────────────────────────────────────────

type BuildingStyle = 'normal' | 'tall' | 'wide' | 'acme';
interface BuildingDef { x: number; w: number; h: number; style: BuildingStyle }
const BUILDINGS: BuildingDef[] = [
  { x: 0,   w: 62,  h: 158, style: 'normal' },
  { x: 72,  w: 44,  h: 118, style: 'tall'   },
  { x: 126, w: 88,  h: 188, style: 'wide'   },
  { x: 224, w: 38,  h: 102, style: 'normal' },
  { x: 272, w: 74,  h: 162, style: 'acme'   },
  { x: 356, w: 52,  h: 142, style: 'tall'   },
  { x: 418, w: 98,  h: 182, style: 'wide'   },
  { x: 526, w: 44,  h: 112, style: 'normal' },
  { x: 580, w: 72,  h: 158, style: 'tall'   },
  { x: 662, w: 58,  h: 132, style: 'normal' },
  { x: 730, w: 48,  h: 98,  style: 'wide'   },
];
const CITY_TILE_W = 780;

interface CloudDef { cx: number; cy: number; r: number }
const CLOUDS: CloudDef[] = [
  { cx: 90,  cy: 55, r: 22 },
  { cx: 310, cy: 38, r: 30 },
  { cx: 520, cy: 70, r: 18 },
  { cx: 700, cy: 44, r: 26 },
  { cx: 960, cy: 58, r: 20 },
];

interface MesaDef { x: number; w: number; h: number; color: string }
const MESAS: MesaDef[] = [
  { x: 0,   w: 210, h: 172, color: '#C62828' },
  { x: 260, w: 168, h: 152, color: '#BF360C' },
  { x: 470, w: 228, h: 162, color: '#C62828' },
  { x: 720, w: 176, h: 144, color: '#AD1457' },
];
const MESA_TILE_W = 900;

interface DecoDef { type: 'cactus' | 'rock'; x: number; s: number }
const DECOS: DecoDef[] = [
  { type: 'cactus', x: 80,  s: 0.85 },
  { type: 'rock',   x: 240, s: 0.70 },
  { type: 'cactus', x: 420, s: 0.65 },
  { type: 'cactus', x: 600, s: 1.00 },
  { type: 'rock',   x: 760, s: 0.80 },
  { type: 'cactus', x: 880, s: 0.75 },
];
const DECO_TILE_W = 950;

// ─── Renderer ─────────────────────────────────────────────────────────────

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
    const { ctx } = this;
    const off = background.offset;

    // --- Background layers (far → near) ---
    this.drawSky();
    this.drawCityscape(off * 0.03);
    this.drawClouds(off * 0.10);
    this.drawMesas(off * 0.22);

    // --- Ground ---
    this.drawGround();
    this.drawGroundDecos(off * 0.65);

    // --- Game objects ---
    this.drawObstacles(obstacles);
    this.drawRoadRunner(player);

    // --- Hint indicators ---
    if (mirrors && state.phase === GamePhase.SECOND_HALF && state.hintEnabled) {
      for (const m of mirrors) {
        if (m.used) continue;
        renderGhostIndicator(ctx, m.mirrorTime, state.elapsedMs, laneForType(m.type), true);
      }
    }

    // --- Effects ---
    if (flash && state.phase === GamePhase.REWIND) {
      renderFlash(ctx, flash);
    }

    if (state.phase === GamePhase.COUNTDOWN) {
      this.drawCountdown(state.elapsedMs);
    }
  }

  // ── Sky ──────────────────────────────────────────────────────────────────

  private drawSky(): void {
    const { ctx } = this;
    const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    grad.addColorStop(0.00, '#1565C0');
    grad.addColorStop(0.45, '#42A5F5');
    grad.addColorStop(1.00, '#BBDEFB');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, GROUND_Y);
  }

  // ── City silhouette ───────────────────────────────────────────────────────

  private drawCityscape(scroll: number): void {
    const off = scroll % CITY_TILE_W;
    this.drawCityTile(-off);
    this.drawCityTile(CITY_TILE_W - off);
  }

  private drawCityTile(startX: number): void {
    const { ctx } = this;
    const baseY = GROUND_Y;

    const styleColors: Record<BuildingStyle, string> = {
      normal: '#90A4AE',
      tall:   '#B0BEC5',
      wide:   '#A5D6A7',
      acme:   '#F5F5F5',
    };

    ctx.save();
    ctx.globalAlpha = 0.30;

    for (const b of BUILDINGS) {
      const x = startX + b.x;
      if (x + b.w < -5 || x > CANVAS_W + 5) continue;
      const y = baseY - b.h;

      ctx.fillStyle = styleColors[b.style];
      ctx.fillRect(x, y, b.w, b.h);

      // Roof style
      if (b.style === 'tall') {
        ctx.fillStyle = '#78909C';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + b.w / 2, y - 22);
        ctx.lineTo(x + b.w, y);
        ctx.fill();
      } else if (b.style === 'wide') {
        ctx.fillStyle = '#78909C';
        for (let px = x + 3; px < x + b.w - 6; px += 10) {
          ctx.fillRect(px, y - 7, 6, 7);
        }
      } else if (b.style === 'acme') {
        ctx.fillStyle = '#EF5350';
        ctx.fillRect(x, y - 10, b.w, 10);
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = '#FFF176';
        ctx.font = '7px Impact, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ACME', x + b.w / 2, y + 16);
        ctx.textAlign = 'left';
        ctx.globalAlpha = 0.30;
      }

      // Windows
      ctx.fillStyle = 'rgba(255,236,150,0.65)';
      const wCols = Math.max(1, Math.floor(b.w / 15));
      const wRows = Math.max(2, Math.floor(b.h / 22));
      for (let row = 0; row < wRows; row++) {
        for (let col = 0; col < wCols; col++) {
          if ((row + col) % 3 === 0) continue; // some windows dark
          ctx.fillRect(x + col * 15 + 4, y + row * 22 + 7, 7, 10);
        }
      }
    }

    ctx.restore();
  }

  // ── Clouds ────────────────────────────────────────────────────────────────

  private drawClouds(scroll: number): void {
    const PERIOD = CANVAS_W + 200;
    for (const c of CLOUDS) {
      const x = ((c.cx - scroll % PERIOD) + PERIOD) % PERIOD;
      this.drawCloud(x, c.cy, c.r);
    }
  }

  private drawCloud(cx: number, cy: number, r: number): void {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.shadowColor = 'rgba(0,0,0,0.07)';
    ctx.shadowBlur = 7;
    const bubbles: [number, number, number][] = [
      [0, 0, r],
      [-r * 0.75, r * 0.25, r * 0.72],
      [r * 0.75,  r * 0.18, r * 0.78],
      [-r * 0.35, -r * 0.42, r * 0.62],
      [r * 0.45,  -r * 0.32, r * 0.58],
      [r * 0.10,  -r * 0.52, r * 0.50],
    ];
    for (const [dx, dy, cr] of bubbles) {
      ctx.beginPath();
      ctx.arc(cx + dx, cy + dy, cr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ── Desert mesas ──────────────────────────────────────────────────────────

  private drawMesas(scroll: number): void {
    const off = scroll % MESA_TILE_W;
    for (const m of MESAS) {
      const x1 = ((m.x - off) + MESA_TILE_W * 2) % MESA_TILE_W - 50;
      const x2 = x1 + MESA_TILE_W;
      this.drawOneMesa(x1, GROUND_Y - m.h, m.w, m.h, m.color);
      this.drawOneMesa(x2, GROUND_Y - m.h, m.w, m.h, m.color);
    }
  }

  private drawOneMesa(x: number, y: number, w: number, h: number, color: string): void {
    if (x + w < -10 || x > CANVAS_W + 10) return;
    const { ctx } = this;
    const topW = w * 0.52;
    const slant = (w - topW) / 2;

    // Main trapezoidal body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + slant, y);
    ctx.lineTo(x + slant + topW, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();

    // Flat top highlight
    ctx.fillStyle = tint(color, 40);
    ctx.fillRect(x + slant, y, topW, 5);

    // Right shadow
    ctx.fillStyle = tint(color, -35);
    ctx.beginPath();
    ctx.moveTo(x + slant + topW, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w * 0.62, y + h);
    ctx.lineTo(x + slant + topW * 0.66, y);
    ctx.closePath();
    ctx.fill();

    // Horizontal geological strata
    ctx.strokeStyle = tint(color, -22);
    ctx.lineWidth = 1.5;
    for (let i = 1; i < 5; i++) {
      const p = i / 5;
      const sy = y + h * p;
      const sx1 = x + slant * p;
      const sx2 = x + w - slant * p;
      ctx.beginPath();
      ctx.moveTo(sx1, sy);
      ctx.lineTo(sx2, sy);
      ctx.stroke();
    }
  }

  // ── Sandy ground floor ────────────────────────────────────────────────────

  private drawGround(): void {
    const { ctx } = this;

    // Sandy gradient
    const grad = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_H);
    grad.addColorStop(0, '#F9A825');
    grad.addColorStop(1, '#E65100');
    ctx.fillStyle = grad;
    ctx.fillRect(0, GROUND_Y, CANVAS_W, GROUND_H);

    // Strong ground edge line
    ctx.strokeStyle = '#4E342E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_W, GROUND_Y);
    ctx.stroke();

    // Dashed Road Runner road markings
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([22, 14]);
    const roadY = GROUND_Y + GROUND_H * 0.55;
    ctx.beginPath();
    ctx.moveTo(0, roadY);
    ctx.lineTo(CANVAS_W, roadY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ── Ground decorations (cacti, rocks) ─────────────────────────────────────

  private drawGroundDecos(scroll: number): void {
    const off = scroll % DECO_TILE_W;
    for (const d of DECOS) {
      const x1 = ((d.x - off) + DECO_TILE_W * 2) % DECO_TILE_W;
      const x2 = x1 + DECO_TILE_W;
      if (x1 > -80 && x1 < CANVAS_W + 80) this.drawDeco(d.type, x1, d.s);
      if (x2 > -80 && x2 < CANVAS_W + 80) this.drawDeco(d.type, x2, d.s);
    }
  }

  private drawDeco(type: 'cactus' | 'rock', x: number, scale: number): void {
    if (type === 'cactus') this.drawCactus(x, scale);
    else this.drawRock(x, scale);
  }

  private drawCactus(x: number, scale: number): void {
    const { ctx } = this;
    const h = 44 * scale;
    const w = 9  * scale;

    ctx.fillStyle = '#2E7D32';
    // Trunk
    ctx.fillRect(x - w / 2, GROUND_Y - h, w, h);
    // Left arm
    const laY = GROUND_Y - h * 0.62;
    ctx.fillRect(x - w * 2.2, laY, w * 1.8, w);
    ctx.fillRect(x - w * 2.2, laY - h * 0.22, w, h * 0.25);
    // Right arm
    const raY = GROUND_Y - h * 0.48;
    ctx.fillRect(x + w / 2, raY, w * 1.8, w);
    ctx.fillRect(x + w * 2.1, raY - h * 0.18, w, h * 0.2);
    // Highlight stripe
    ctx.fillStyle = '#388E3C';
    ctx.fillRect(x - w / 2 + 2, GROUND_Y - h + 2, Math.max(2, w * 0.3), h - 4);
  }

  private drawRock(x: number, scale: number): void {
    const { ctx } = this;
    const rx = 14 * scale;
    const ry = 9  * scale;
    const cy = GROUND_Y - ry * 0.6;

    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    ctx.beginPath();
    ctx.ellipse(x + 3, cy + 3, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#8D6E63';
    ctx.beginPath();
    ctx.ellipse(x, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#BCAAA4';
    ctx.beginPath();
    ctx.ellipse(x - rx * 0.25, cy - ry * 0.3, rx * 0.55, ry * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Obstacles — Looney Tunes style ────────────────────────────────────────

  private drawObstacles(obstacles: Obstacle[]): void {
    for (const o of obstacles) {
      if (!o.alive) continue;
      const b = o.bounds();
      switch (o.data.type) {
        case 'low':   this.drawAcmeBox(b, o.collided); break;
        case 'high':  this.drawTNT(b, o.collided);     break;
        case 'block': this.drawBoulder(b, o.collided); break;
      }
    }
  }

  /** 🔴 low → ACME kasa */
  private drawAcmeBox(
    b: { x: number; y: number; w: number; h: number },
    hit: boolean
  ): void {
    const { ctx } = this;
    const { x, y, w, h } = b;

    ctx.fillStyle = hit ? '#4E342E' : '#6D4C41';
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = hit ? '#3E2723' : '#5D4037';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.35); ctx.lineTo(x + w, y + h * 0.35);
    ctx.moveTo(x, y + h * 0.70); ctx.lineTo(x + w, y + h * 0.70);
    ctx.moveTo(x + 2, y + 2); ctx.lineTo(x + w - 2, y + h - 2);
    ctx.moveTo(x + w - 2, y + 2); ctx.lineTo(x + 2, y + h - 2);
    ctx.stroke();

    ctx.fillStyle = hit ? '#B71C1C' : '#FF3D00';
    ctx.font = 'bold 7px Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ACME', x + w / 2, y + h / 2 + 3);
    ctx.textAlign = 'left';

    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x, y, w, 3);
  }

  /** 🟡 high → TNT dinamiti (havada) */
  private drawTNT(
    b: { x: number; y: number; w: number; h: number },
    hit: boolean
  ): void {
    const { ctx } = this;
    const { x, y, w, h } = b;

    ctx.fillStyle = hit ? '#7B0000' : '#C62828';
    rrect(ctx, x, y + 4, w, h - 4, 4);
    ctx.fill();

    ctx.fillStyle = hit ? '#8B0000' : '#D32F2F';
    ctx.fillRect(x + 3, y + 4, w - 6, 7);

    ctx.fillStyle = '#FFD600';
    ctx.font = 'bold 8px Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TNT', x + w / 2, y + h * 0.65);
    ctx.textAlign = 'left';

    if (!hit) {
      const fx = x + w / 2;
      const fy = y + 4;
      ctx.strokeStyle = '#795548';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.quadraticCurveTo(fx + 10, fy - 10, fx + 7, fy - 18);
      ctx.stroke();
      ctx.setLineDash([]);

      const phase = (Date.now() / 70) % (Math.PI * 2);
      const sa = 0.6 + 0.4 * Math.sin(phase);
      ctx.fillStyle = `rgba(255,140,0,${sa})`;
      ctx.beginPath();
      ctx.arc(fx + 7, fy - 18, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,230,0,${sa})`;
      ctx.beginPath();
      ctx.arc(fx + 7, fy - 18, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /** 🟣 block → Devasa kaya */
  private drawBoulder(
    b: { x: number; y: number; w: number; h: number },
    hit: boolean
  ): void {
    const { ctx } = this;
    const { x, y, w, h } = b;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const rx = w / 2;
    const ry = h / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(cx + 5, cy + 4, rx - 2, ry * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = hit ? '#424242' : '#757575';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    const shade = ctx.createRadialGradient(
      cx - rx * 0.35, cy - ry * 0.35, 2,
      cx, cy, Math.max(rx, ry)
    );
    shade.addColorStop(0, 'rgba(210,210,210,0.35)');
    shade.addColorStop(1, 'rgba(0,0,0,0.48)');
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = hit ? '#212121' : '#424242';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy - ry * 0.45);
    ctx.lineTo(cx + 3, cy + 2);
    ctx.lineTo(cx - 2, cy + ry * 0.40);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.beginPath();
    ctx.ellipse(cx - rx * 0.3, cy - ry * 0.32, rx * 0.28, ry * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Road Runner Character ─────────────────────────────────────────────────

  private drawRoadRunner(player: Player): void {
    const { ctx } = this;
    const bx = player.x;
    const by = player.y;

    const now = Date.now();
    const t = now / 85;
    const running = player.onGround;
    const swing = running ? Math.sin(t) * 7 : 0;

    // Reference anchor: character body center
    const cx = bx + 11;
    const cy = by + 30;

    ctx.save();

    // === TAIL ===
    ctx.fillStyle = '#0A2F7A';
    ctx.beginPath();
    ctx.moveTo(cx - 7,  cy - 4);
    ctx.lineTo(cx - 26, cy - 11);
    ctx.lineTo(cx - 21, cy - 1);
    ctx.lineTo(cx - 27, cy + 7);
    ctx.lineTo(cx - 8,  cy + 3);
    ctx.closePath();
    ctx.fill();

    // Tail tip feather
    ctx.fillStyle = '#06205A';
    ctx.beginPath();
    ctx.moveTo(cx - 26, cy - 11);
    ctx.lineTo(cx - 31, cy - 14);
    ctx.lineTo(cx - 22, cy - 3);
    ctx.closePath();
    ctx.fill();

    // === LEGS (orange) ===
    ctx.strokeStyle = '#E65100';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    if (running) {
      // Front leg + foot
      ctx.beginPath();
      ctx.moveTo(cx + 3, cy + 8);
      ctx.lineTo(cx + 3 + swing, cy + 20);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 3 + swing, cy + 20);
      ctx.lineTo(cx + swing + 12, cy + 20);
      ctx.stroke();
      // Back leg + foot (opposite swing)
      ctx.beginPath();
      ctx.moveTo(cx - 3, cy + 8);
      ctx.lineTo(cx - 3 - swing, cy + 20);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 3 - swing, cy + 20);
      ctx.lineTo(cx - swing + 6, cy + 20);
      ctx.stroke();
    } else {
      // Jumping — legs tucked
      ctx.beginPath();
      ctx.moveTo(cx + 3, cy + 6);
      ctx.lineTo(cx + 8, cy + 14);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 3, cy + 6);
      ctx.lineTo(cx - 8, cy + 14);
      ctx.stroke();
    }

    // === BODY (dark blue) ===
    ctx.fillStyle = '#1976D2';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 3, 15, 11, -0.18, 0, Math.PI * 2);
    ctx.fill();

    // Belly shading
    ctx.fillStyle = '#1565C0';
    ctx.beginPath();
    ctx.ellipse(cx - 2, cy + 3, 10, 7, -0.18, 0, Math.PI * 2);
    ctx.fill();

    // Wing hint
    ctx.fillStyle = '#1E88E5';
    ctx.beginPath();
    ctx.ellipse(cx - 9, cy - 1, 5, 3, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // === NECK ===
    ctx.fillStyle = '#42A5F5';
    ctx.beginPath();
    ctx.ellipse(cx + 10, cy - 14, 7, 9, 0.22, 0, Math.PI * 2);
    ctx.fill();

    // === HEAD ===
    ctx.fillStyle = '#2196F3';
    ctx.beginPath();
    ctx.arc(cx + 18, cy - 22, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#42A5F5';
    ctx.beginPath();
    ctx.arc(cx + 15, cy - 25, 4, 0, Math.PI * 2);
    ctx.fill();

    // === CREST (mohawk feathers) ===
    const crestDefs = [
      { dx: 10, dy: -28, rx: 2.5, ry: 7.5, angle: -0.35 },
      { dx: 14, dy: -32, rx: 2.5, ry: 9.0, angle: -0.12 },
      { dx: 18, dy: -28, rx: 2.5, ry: 7.0, angle:  0.12 },
    ];
    ctx.fillStyle = '#0D47A1';
    for (const c of crestDefs) {
      ctx.beginPath();
      ctx.ellipse(cx + c.dx, cy + c.dy, c.rx, c.ry, c.angle, 0, Math.PI * 2);
      ctx.fill();
    }

    // === EYE ===
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(cx + 22, cy - 23, 5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#FFD600';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx + 22, cy - 23, 5, 4.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.arc(cx + 23, cy - 23, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx + 21, cy - 25, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // === BEAK (long, orange — Road Runner signature) ===
    ctx.fillStyle = '#FF6F00';
    ctx.beginPath();
    ctx.moveTo(cx + 26, cy - 26);
    ctx.lineTo(cx + 42, cy - 22); // beak tip
    ctx.lineTo(cx + 26, cy - 20);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#E65100'; // lower beak
    ctx.beginPath();
    ctx.moveTo(cx + 26, cy - 21);
    ctx.lineTo(cx + 42, cy - 22);
    ctx.lineTo(cx + 26, cy - 19);
    ctx.closePath();
    ctx.fill();

    // === DUST PUFFS (when running) ===
    if (running && Math.sin(t * 2) > 0.4) {
      this.drawDustPuff(cx - 6, cy + 21, 0.4 + 0.6 * Math.sin(t * 2));
    }

    ctx.restore();
  }

  private drawDustPuff(x: number, y: number, intensity: number): void {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = '#F9A825';
    const puffs: [number, number, number][] = [[-8, 0, 5], [0, -3, 7], [8, 1, 4]];
    for (const [dx, dy, r] of puffs) {
      ctx.globalAlpha = 0.32 * intensity;
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, r * intensity, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ── Countdown overlay (Looney Tunes badge style) ───────────────────────────

  private drawCountdown(elapsedMs: number): void {
    const { ctx } = this;
    const remaining = Math.ceil((COUNTDOWN_TOTAL_MS - elapsedMs) / 1000);
    const n = Math.max(1, Math.min(3, remaining));
    const frac = ((COUNTDOWN_TOTAL_MS - elapsedMs) % 1000) / 1000;
    const scale = 0.80 + frac * 0.34;
    const alpha = 0.55 + frac * 0.45;

    const cx = CANVAS_W / 2;
    const cy = CANVAS_H / 2;

    ctx.save();

    // Circular dark badge
    ctx.globalAlpha = 0.52;
    ctx.fillStyle = '#1A237E';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 4, 74, 70, 0, 0, Math.PI * 2);
    ctx.fill();

    // Yellow ring border (Looney Tunes signature)
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = '#FFD600';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 4, 71, 67, 0, 0, Math.PI * 2);
    ctx.stroke();

    // "HAZIRLAN!" label above badge
    ctx.globalAlpha = 0.90;
    ctx.font = '700 15px "Fredoka One", "Arial Black", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFD600';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.fillText('HAZIRLAN!', cx, cy - 82);

    // Countdown digit (cartoon outlined number)
    ctx.globalAlpha = alpha;
    const fs = Math.round(92 * scale);
    ctx.font = `700 ${fs}px "Fredoka One", "Arial Black", Impact, sans-serif`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#000';
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';
    ctx.strokeText(String(n), cx, cy - 2);
    ctx.fillStyle = n === 1 ? '#EF5350' : n === 2 ? '#FF9800' : '#4CAF50';
    ctx.fillText(String(n), cx, cy - 2);

    // Control hint below
    ctx.globalAlpha = 0.68;
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px "Fredoka One", Arial, sans-serif';
    ctx.fillText('Kısa bas → normal zıp  •  Uzun bas → yüksek zıp', cx, cy + 74);

    ctx.restore();
  }
}
