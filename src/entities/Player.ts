import {
  GRAVITY_PX_PER_MS2,
  GROUND_Y,
  JUMP_VY_PX_PER_MS,
  PLAYER_H,
  PLAYER_X,
} from '../utils/constants';
import type { InputType } from '../types';

/** Uzun basışta zıplama katsayısı (hold_start → %70 daha yüksek) */
const HOLD_JUMP_MULTIPLIER = 1.7;

export class Player {
  x: number = PLAYER_X;
  y: number = GROUND_Y - PLAYER_H;
  vy: number = 0;
  onGround: boolean = true;
  lane: 0 | 1 | 2 = 1;

  /**
   * tap   → normal zıplama (low engelleri aşar)
   * hold_start → güçlü zıplama (block ve high engelleri aşar)
   */
  jump(type: InputType = 'tap'): void {
    if (!this.onGround) return;
    const velocity =
      type === 'hold_start'
        ? JUMP_VY_PX_PER_MS * HOLD_JUMP_MULTIPLIER
        : JUMP_VY_PX_PER_MS;
    this.vy = velocity;
    this.onGround = false;
  }

  update(dt: number): void {
    if (this.onGround) return;
    this.vy += GRAVITY_PX_PER_MS2 * dt;
    this.y += this.vy * dt;
    const groundTop = GROUND_Y - PLAYER_H;
    if (this.y >= groundTop) {
      this.y = groundTop;
      this.vy = 0;
      this.onGround = true;
    }
  }

  reset(): void {
    this.x = PLAYER_X;
    this.y = GROUND_Y - PLAYER_H;
    this.vy = 0;
    this.onGround = true;
    this.lane = 1;
  }
}
