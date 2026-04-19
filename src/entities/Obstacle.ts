import type { ObstacleData } from '../types';
import {
  CANVAS_W,
  GROUND_Y,
  OBSTACLE_BLOCK_H,
  OBSTACLE_HIGH_H,
  OBSTACLE_HIGH_Y_OFFSET,
  OBSTACLE_LOW_H,
  OBSTACLE_SPAWN_OFFSET_PX,
  OBSTACLE_W,
  PLAYER_H,
  PLAYER_W,
} from '../utils/constants';
import type { Player } from './Player';

export interface Bounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

export class Obstacle {
  x: number;
  alive: boolean;
  collided: boolean;

  constructor(public readonly data: ObstacleData) {
    this.x = CANVAS_W + OBSTACLE_SPAWN_OFFSET_PX;
    this.alive = true;
    this.collided = false;
  }

  update(dt: number, scrollSpeedPxPerMs: number): void {
    if (!this.alive) return;
    this.x -= scrollSpeedPxPerMs * dt;
    if (this.x + OBSTACLE_W < 0) {
      this.alive = false;
    }
  }

  bounds(): Bounds {
    const h = this.height();
    const y = this.topY();
    return { x: this.x, y, w: OBSTACLE_W, h };
  }

  height(): number {
    switch (this.data.type) {
      case 'low':
        return OBSTACLE_LOW_H;
      case 'high':
        return OBSTACLE_HIGH_H;
      case 'block':
        return OBSTACLE_BLOCK_H;
    }
  }

  topY(): number {
    switch (this.data.type) {
      case 'low':
        return GROUND_Y - OBSTACLE_LOW_H;
      case 'high':
        return GROUND_Y - OBSTACLE_HIGH_Y_OFFSET - OBSTACLE_HIGH_H;
      case 'block':
        return GROUND_Y - OBSTACLE_BLOCK_H;
    }
  }

  collidesWith(player: Player): boolean {
    if (!this.alive || this.collided) return false;
    const ob = this.bounds();
    const pb: Bounds = {
      x: player.x,
      y: player.y,
      w: PLAYER_W,
      h: PLAYER_H,
    };
    return (
      pb.x < ob.x + ob.w &&
      pb.x + pb.w > ob.x &&
      pb.y < ob.y + ob.h &&
      pb.y + pb.h > ob.y
    );
  }
}
