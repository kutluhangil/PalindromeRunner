import { describe, it, expect } from 'vitest';
import {
  DIFFICULTIES,
  getDifficulty,
  parseUrlParams,
} from '../difficulty';

describe('DIFFICULTIES', () => {
  it('5 seviye tanımlı', () => {
    expect(DIFFICULTIES.length).toBe(5);
    expect(DIFFICULTIES.map((d) => d.level)).toEqual([1, 2, 3, 4, 5]);
  });

  it('seviye arttıkça tolerans azalır', () => {
    for (let i = 1; i < DIFFICULTIES.length; i += 1) {
      expect(DIFFICULTIES[i].tolerance.perfect).toBeLessThan(
        DIFFICULTIES[i - 1].tolerance.perfect
      );
      expect(DIFFICULTIES[i].tolerance.good).toBeLessThan(
        DIFFICULTIES[i - 1].tolerance.good
      );
      expect(DIFFICULTIES[i].tolerance.ok).toBeLessThan(
        DIFFICULTIES[i - 1].tolerance.ok
      );
    }
  });

  it('seviye arttıkça yarım süresi artar', () => {
    for (let i = 1; i < DIFFICULTIES.length; i += 1) {
      expect(DIFFICULTIES[i].halfDurationMs).toBeGreaterThan(
        DIFFICULTIES[i - 1].halfDurationMs
      );
    }
  });

  it('hintEnabled sadece ilk 3 seviyede true', () => {
    expect(DIFFICULTIES[0].hintEnabled).toBe(true);
    expect(DIFFICULTIES[1].hintEnabled).toBe(true);
    expect(DIFFICULTIES[2].hintEnabled).toBe(true);
    expect(DIFFICULTIES[3].hintEnabled).toBe(false);
    expect(DIFFICULTIES[4].hintEnabled).toBe(false);
  });
});

describe('getDifficulty', () => {
  it('geçerli seviyeyi döner', () => {
    expect(getDifficulty(3).level).toBe(3);
  });

  it('0 veya negatif için 1. seviye', () => {
    expect(getDifficulty(0).level).toBe(1);
    expect(getDifficulty(-5).level).toBe(1);
  });

  it('aşırı için 5. seviye', () => {
    expect(getDifficulty(99).level).toBe(5);
  });

  it('ondalık aşağı yuvarlanır', () => {
    expect(getDifficulty(2.9).level).toBe(2);
  });
});

describe('parseUrlParams', () => {
  const defaults = { seed: 1, level: 2 };

  it('seed ve level çözer', () => {
    expect(parseUrlParams('?seed=42&level=4', defaults)).toEqual({
      seed: 42,
      level: 4,
    });
  });

  it('eksik değerler default kullanır', () => {
    expect(parseUrlParams('?seed=10', defaults)).toEqual({
      seed: 10,
      level: 2,
    });
    expect(parseUrlParams('', defaults)).toEqual(defaults);
  });

  it('geçersiz sayılar default kullanır', () => {
    expect(parseUrlParams('?seed=abc&level=xyz', defaults)).toEqual(defaults);
  });
});
