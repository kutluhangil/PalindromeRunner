import {
  GRAVITY_PX_PER_MS2,
  GROUND_Y,
  JUMP_VY_PX_PER_MS,
  PLAYER_H,
  PLAYER_X,
} from '../utils/constants';

export class Player {
  x: number = PLAYER_X;
  y: number = GROUND_Y - PLAYER_H;
  vy: number = 0;
  onGround: boolean = true;
  lane: 0 | 1 | 2 = 1;

  jump(): void {
    if (!this.onGround) return;
    this.vy = JUMP_VY_PX_PER_MS;
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
