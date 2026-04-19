import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../RNG';

// Kotlin port referansıdır: mulberry32(42)'nin ilk 10 çıktısı.
// Android portunda Mulberry32(42).next() aynı diziyi üretmelidir.
const REFERENCE_SEED_42: readonly number[] = [
  0.6011037519201636, 0.44829055899754167, 0.8524657934904099,
  0.6697340414393693, 0.17481389874592423, 0.5265925421845168,
  0.2732279943302274, 0.6247446539346129, 0.8654746483080089,
  0.4723170551005751,
];

describe('mulberry32', () => {
  it('seed=42 için ilk 10 çıktı referans dizisiyle bit-bit aynıdır', () => {
    const rng = mulberry32(42);
    for (let i = 0; i < REFERENCE_SEED_42.length; i += 1) {
      expect(rng()).toBe(REFERENCE_SEED_42[i]);
    }
  });

  it('çıktılar [0, 1) aralığındadır', () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 50; i += 1) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('farklı seed farklı dizi üretir', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const seqA = [a(), a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b(), b()];
    expect(seqA).not.toEqual(seqB);
  });

  it('aynı seed iki örnekte aynı diziyi verir', () => {
    const a = mulberry32(123);
    const b = mulberry32(123);
    for (let i = 0; i < 20; i += 1) {
      expect(a()).toBe(b());
    }
  });
});
