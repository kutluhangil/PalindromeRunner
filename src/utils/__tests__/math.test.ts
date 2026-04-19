import { describe, expect, it } from 'vitest';
import { clamp, lerp, mirrorTime } from '../math';

describe('clamp', () => {
  it('aralık içinde değeri aynı döner', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it('min altı min döner', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });
  it('max üstü max döner', () => {
    expect(clamp(99, 0, 10)).toBe(10);
  });
  it('sınır değerleri aynen döner', () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe('lerp', () => {
  it('t=0 a döner', () => {
    expect(lerp(10, 20, 0)).toBe(10);
  });
  it('t=1 b döner', () => {
    expect(lerp(10, 20, 1)).toBe(20);
  });
  it('t=0.5 orta döner', () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
  });
  it('negatif değerlerle çalışır', () => {
    expect(lerp(-10, 10, 0.5)).toBe(0);
  });
});

describe('mirrorTime', () => {
  it('T-t döner', () => {
    expect(mirrorTime(2000, 15000)).toBe(13000);
  });
  it('t=0 için T döner', () => {
    expect(mirrorTime(0, 15000)).toBe(15000);
  });
  it('t=T için 0 döner', () => {
    expect(mirrorTime(15000, 15000)).toBe(0);
  });
  it('merkezde simetrik', () => {
    const T = 15000;
    expect(mirrorTime(7500, T)).toBe(7500);
  });
});
