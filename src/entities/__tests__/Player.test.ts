import { describe, it, expect } from 'vitest';
import { Player } from '../Player';
import { GROUND_Y, PLAYER_H } from '../../utils/constants';

const GROUND_TOP = GROUND_Y - PLAYER_H;

describe('Player', () => {
  it('başlangıç onGround true, y=ground_top', () => {
    const p = new Player();
    expect(p.onGround).toBe(true);
    expect(p.y).toBe(GROUND_TOP);
    expect(p.vy).toBe(0);
  });

  it('jump sonrası vy negatif, onGround false', () => {
    const p = new Player();
    p.jump();
    expect(p.vy).toBeLessThan(0);
    expect(p.onGround).toBe(false);
  });

  it('zemindeyken update no-op', () => {
    const p = new Player();
    const y0 = p.y;
    p.update(100);
    expect(p.y).toBe(y0);
    expect(p.vy).toBe(0);
  });

  it('havadayken gravity vy artar, y düşer yukarı hareketten sonra', () => {
    const p = new Player();
    p.jump();
    const initialVy = p.vy;
    p.update(16);
    expect(p.vy).toBeGreaterThan(initialVy);
    expect(p.y).toBeLessThan(GROUND_TOP);
  });

  it('yere değince onGround true, vy=0, y=ground_top', () => {
    const p = new Player();
    p.jump();
    // yeterince uzun update ile tekrar yere iner
    for (let i = 0; i < 100; i += 1) {
      p.update(16);
    }
    expect(p.onGround).toBe(true);
    expect(p.vy).toBe(0);
    expect(p.y).toBe(GROUND_TOP);
  });

  it('havadayken tekrar jump no-op', () => {
    const p = new Player();
    p.jump();
    p.update(16);
    const vyMid = p.vy;
    p.jump();
    expect(p.vy).toBe(vyMid);
  });

  it('reset tüm durumu başlangıca döndürür', () => {
    const p = new Player();
    p.jump();
    p.update(16);
    p.reset();
    expect(p.onGround).toBe(true);
    expect(p.vy).toBe(0);
    expect(p.y).toBe(GROUND_TOP);
  });
});
