import { GROUND_Y, PLAYER_X, PLAYER_W } from '../utils/constants';

/**
 * Ghost indicator'ın görüneceği zaman penceresi.
 * mirrorTime'a bu kadar ms kala belirmeye başlar.
 */
const WINDOW_BEFORE_MS = 400;
const WINDOW_AFTER_MS = 100;
const MIN_RADIUS = 8;
const MAX_RADIUS = 36;

/**
 * lane parametresi input tipine göre belirlenir:
 *   lane 0 → tap (normal zıplama bölgesi)  → GROUND_Y'ye yakın yükseklik
 *   lane 2 → hold_start (yüksek zıplama) → daha yüksek bir y
 *
 * Yükseklik haritası:
 *   lane 0 → GROUND_Y - 70  (normalin zirve noktası civarı)
 *   lane 2 → GROUND_Y - 160 (hold'un zirve noktası civarı)
 */
const LANE_Y: Record<0 | 1 | 2, number> = {
  0: GROUND_Y - 70,
  1: GROUND_Y - 115,  // (ara değer — şimdilik kullanılmıyor)
  2: GROUND_Y - 160,
};

export function renderGhostIndicator(
  ctx: CanvasRenderingContext2D,
  expectedMirrorMs: number,
  elapsedMs: number,
  lane: 0 | 1 | 2,
  enabled: boolean
): void {
  if (!enabled) return;
  const delta = expectedMirrorMs - elapsedMs;
  if (delta > WINDOW_BEFORE_MS || delta < -WINDOW_AFTER_MS) return;

  const approach = 1 - Math.min(1, Math.abs(delta) / WINDOW_BEFORE_MS);
  const radius = MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * approach;
  const opacity = 0.15 + 0.65 * approach;

  const x = PLAYER_X + PLAYER_W / 2;
  const y = LANE_Y[lane];

  ctx.save();
  ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.25})`;
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
