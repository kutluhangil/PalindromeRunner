import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Clock } from '../Clock';

describe('Clock', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['performance'] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('start sonrası elapsed zaman geçtikçe artar', () => {
    const c = new Clock();
    c.start();
    vi.advanceTimersByTime(500);
    expect(c.elapsed()).toBe(500);
    vi.advanceTimersByTime(250);
    expect(c.elapsed()).toBe(750);
  });

  it('pause sonrası elapsed sabit kalır', () => {
    const c = new Clock();
    c.start();
    vi.advanceTimersByTime(400);
    c.pause();
    expect(c.elapsed()).toBe(400);
    vi.advanceTimersByTime(1000);
    expect(c.elapsed()).toBe(400);
  });

  it('resume sonrası elapsed artmaya devam eder', () => {
    const c = new Clock();
    c.start();
    vi.advanceTimersByTime(400);
    c.pause();
    vi.advanceTimersByTime(1000);
    c.resume();
    vi.advanceTimersByTime(100);
    expect(c.elapsed()).toBe(500);
  });

  it('reset sonrası elapsed 0', () => {
    const c = new Clock();
    c.start();
    vi.advanceTimersByTime(500);
    c.reset();
    expect(c.elapsed()).toBe(0);
  });

  it('reset sonra yeniden start temiz başlar', () => {
    const c = new Clock();
    c.start();
    vi.advanceTimersByTime(500);
    c.reset();
    c.start();
    vi.advanceTimersByTime(200);
    expect(c.elapsed()).toBe(200);
  });

  it('start çağrılmadan elapsed 0', () => {
    const c = new Clock();
    expect(c.elapsed()).toBe(0);
  });

  it('pause running değilken no-op', () => {
    const c = new Clock();
    c.pause();
    expect(c.elapsed()).toBe(0);
    c.start();
    vi.advanceTimersByTime(100);
    c.pause();
    c.pause();
    expect(c.elapsed()).toBe(100);
  });

  it('resume running iken no-op', () => {
    const c = new Clock();
    c.start();
    vi.advanceTimersByTime(200);
    c.resume();
    vi.advanceTimersByTime(100);
    expect(c.elapsed()).toBe(300);
  });
});
