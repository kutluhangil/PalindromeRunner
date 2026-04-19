import { describe, it, expect } from 'vitest';
import { Obstacle } from '../Obstacle';
import { Player } from '../Player';
import {
  CANVAS_W,
  OBSTACLE_SPAWN_OFFSET_PX,
  SCROLL_SPEED_PX_PER_MS,
} from '../../utils/constants';
import type { ObstacleData } from '../../types';

function data(type: ObstacleData['type'] = 'low'): ObstacleData {
  return { id: 'obs_1', spawnTime: 1500, lane: 1, type };
}

describe('Obstacle', () => {
  it('ilk konum CANVAS_W + spawn offset', () => {
    const o = new Obstacle(data('low'));
    expect(o.x).toBe(CANVAS_W + OBSTACLE_SPAWN_OFFSET_PX);
    expect(o.alive).toBe(true);
  });

  it('update ile x sola doğru azalır', () => {
    const o = new Obstacle(data('low'));
    const x0 = o.x;
    o.update(100, SCROLL_SPEED_PX_PER_MS);
    expect(o.x).toBeLessThan(x0);
    expect(o.x).toBeCloseTo(x0 - 100 * SCROLL_SPEED_PX_PER_MS, 5);
  });

  it('sol kenarı geçince alive false', () => {
    const o = new Obstacle(data('low'));
    // yeterli zaman geçsin
    for (let i = 0; i < 10000; i += 1) {
      o.update(16, SCROLL_SPEED_PX_PER_MS);
      if (!o.alive) break;
    }
    expect(o.alive).toBe(false);
  });

  it('AABB: player ile çakışan obstacle collides true', () => {
    const o = new Obstacle(data('block'));
    const p = new Player();
    // obstacle'ı player x'ine getir
    o.x = p.x;
    expect(o.collidesWith(p)).toBe(true);
  });

  it('AABB: uzak obstacle collides false', () => {
    const o = new Obstacle(data('block'));
    const p = new Player();
    o.x = p.x + 500;
    expect(o.collidesWith(p)).toBe(false);
  });

  it('high obstacle yerdeki player ile çarpışmaz (AABB)', () => {
    const o = new Obstacle(data('high'));
    const p = new Player();
    o.x = p.x;
    // high obstacle yukarıda; player yerde → AABB overlap yok
    expect(o.collidesWith(p)).toBe(false);
  });

  it('collided true iken collidesWith false', () => {
    const o = new Obstacle(data('block'));
    const p = new Player();
    o.x = p.x;
    expect(o.collidesWith(p)).toBe(true);
    o.collided = true;
    expect(o.collidesWith(p)).toBe(false);
  });
});
