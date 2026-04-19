import { describe, expect, it } from 'vitest';
import { generateLevel } from '../LevelGenerator';

describe('generateLevel', () => {
  it('aynı seed aynı obstacle dizisini üretir (determinism)', () => {
    const a = generateLevel(42, 15000);
    const b = generateLevel(42, 15000);
    expect(a).toEqual(b);
  });

  it('farklı seedler farklı level üretir', () => {
    const a = generateLevel(1, 15000);
    const b = generateLevel(2, 15000);
    expect(a.obstacles).not.toEqual(b.obstacles);
  });

  it('tüm obstacle spawnTime değerleri [1500, halfDurationMs-800] aralığındadır', () => {
    const halfDurationMs = 15000;
    const level = generateLevel(42, halfDurationMs);
    for (const obs of level.obstacles) {
      expect(obs.spawnTime).toBeGreaterThanOrEqual(1500);
      expect(obs.spawnTime).toBeLessThanOrEqual(halfDurationMs - 800);
    }
  });

  it('obstacle listesi spawnTime göre artan sıralıdır', () => {
    const level = generateLevel(42, 15000);
    for (let i = 1; i < level.obstacles.length; i += 1) {
      expect(level.obstacles[i].spawnTime).toBeGreaterThan(
        level.obstacles[i - 1].spawnTime
      );
    }
  });

  it('en az 3 obstacle içerir', () => {
    for (const seed of [1, 2, 42, 100, 9999]) {
      const level = generateLevel(seed, 15000);
      expect(level.obstacles.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('tüm obstacle lane değerleri 0,1,2 arasındadır', () => {
    const level = generateLevel(42, 15000);
    for (const obs of level.obstacles) {
      expect([0, 1, 2]).toContain(obs.lane);
    }
  });

  it('tüm obstacle type değerleri beklenen kümededir', () => {
    const level = generateLevel(42, 15000);
    for (const obs of level.obstacles) {
      expect(['low', 'high', 'block']).toContain(obs.type);
    }
  });

  it('obstacle idleri obs_0, obs_1, ... sırasıyladır', () => {
    const level = generateLevel(42, 15000);
    level.obstacles.forEach((obs, i) => {
      expect(obs.id).toBe(`obs_${i}`);
    });
  });

  it('seed ve halfDurationMs level data üzerinde korunur', () => {
    const level = generateLevel(7, 20000);
    expect(level.seed).toBe(7);
    expect(level.halfDurationMs).toBe(20000);
  });
});
