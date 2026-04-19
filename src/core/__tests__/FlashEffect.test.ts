import { describe, it, expect } from 'vitest';
import { FLASH_DURATION_MS, FlashEffect } from '../FlashEffect';

describe('FlashEffect', () => {
  it('trigger öncesi isDone false', () => {
    const f = new FlashEffect();
    expect(f.isDone()).toBe(false);
    expect(f.isActive()).toBe(false);
  });

  it('trigger sonrası active true, progress 0', () => {
    const f = new FlashEffect();
    f.trigger();
    expect(f.isActive()).toBe(true);
    expect(f.isDone()).toBe(false);
    expect(f.getProgress()).toBe(0);
  });

  it('yarı süre sonra progress 0.5', () => {
    const f = new FlashEffect();
    f.trigger();
    f.update(FLASH_DURATION_MS / 2);
    expect(f.getProgress()).toBeCloseTo(0.5, 3);
    expect(f.isActive()).toBe(true);
  });

  it('süre dolunca isDone true, active false', () => {
    const f = new FlashEffect();
    f.trigger();
    f.update(FLASH_DURATION_MS);
    expect(f.isDone()).toBe(true);
    expect(f.isActive()).toBe(false);
  });

  it('reset triggered ve elapsed sıfırlar', () => {
    const f = new FlashEffect();
    f.trigger();
    f.update(FLASH_DURATION_MS);
    f.reset();
    expect(f.isDone()).toBe(false);
    expect(f.isActive()).toBe(false);
    expect(f.getProgress()).toBe(0);
  });
});
