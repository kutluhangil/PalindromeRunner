import { describe, it, expect } from 'vitest';
import { PalindromeValidator } from '../PalindromeValidator';
import type { InputEvent } from '../../types';

const T = 15000;

function tap(id: string, timestamp: number): InputEvent {
  return { id, timestamp, type: 'tap' };
}

// firstHalf: a@2000, b@7000, c@12000 → aynalar: c@3000, b@8000, a@13000
const FIRST_HALF: InputEvent[] = [tap('a', 2000), tap('b', 7000), tap('c', 12000)];

describe('PalindromeValidator — temel eşleşme sınıflandırması', () => {
  it('perfect: t=3000 (delta 0)', () => {
    const v = new PalindromeValidator(FIRST_HALF, T);
    const r = v.validate(tap('x', 3000));
    expect(r.quality).toBe('perfect');
    expect(r.deltaMs).toBe(0);
    expect(r.matchedOriginalId).toBe('c');
  });

  it('perfect: t=3050 (delta 50, sınır içi)', () => {
    const v = new PalindromeValidator(FIRST_HALF, T);
    const r = v.validate(tap('x', 3050));
    expect(r.quality).toBe('perfect');
    expect(r.deltaMs).toBe(50);
  });

  it('good: t=3100 (delta 100)', () => {
    const v = new PalindromeValidator(FIRST_HALF, T);
    const r = v.validate(tap('x', 3100));
    expect(r.quality).toBe('good');
    expect(r.deltaMs).toBe(100);
  });

  it('ok: t=3180 (delta 180)', () => {
    const v = new PalindromeValidator(FIRST_HALF, T);
    const r = v.validate(tap('x', 3180));
    expect(r.quality).toBe('ok');
    expect(r.deltaMs).toBe(180);
  });

  it('miss: t=3500 (delta 500, tolerance dışı)', () => {
    const v = new PalindromeValidator(FIRST_HALF, T);
    const r = v.validate(tap('x', 3500));
    expect(r.quality).toBe('miss');
    expect(r.deltaMs).toBe(500);
    expect(r.matchedOriginalId).toBeUndefined();
  });
});

describe('PalindromeValidator — tolerance sınırı tam eşitlikleri', () => {
  it('delta=60 hâlâ perfect', () => {
    const v = new PalindromeValidator(FIRST_HALF, T);
    const r = v.validate(tap('x', 3060));
    expect(r.quality).toBe('perfect');
  });
  it('delta=120 hâlâ good', () => {
    const v = new PalindromeValidator(FIRST_HALF, T);
    const r = v.validate(tap('x', 3120));
    expect(r.quality).toBe('good');
  });
  it('delta=200 hâlâ ok', () => {
    const v = new PalindromeValidator(FIRST_HALF, T);
    const r = v.validate(tap('x', 3200));
    expect(r.quality).toBe('ok');
  });
  it('delta=201 miss', () => {
    const v = new PalindromeValidator(FIRST_HALF, T);
    const r = v.validate(tap('x', 3201));
    expect(r.quality).toBe('miss');
  });
});

describe('PalindromeValidator — aynı ayna iki kez eşleşmez', () => {
  it('önce perfect, sonra aynı t → bir sonraki ayna ile ölçülür → miss', () => {
    const v = new PalindromeValidator(FIRST_HALF, T);
    const first = v.validate(tap('x1', 3000));
    expect(first.quality).toBe('perfect');
    expect(first.matchedOriginalId).toBe('c');
    const second = v.validate(tap('x2', 3000));
    // kalan aynalar 8000, 13000; en yakın 8000, delta=5000 → miss
    expect(second.quality).toBe('miss');
    expect(second.deltaMs).toBe(5000);
  });
});

describe('PalindromeValidator — tip uyuşmazlığı miss döner', () => {
  it('tap ayna, hold_start input → miss', () => {
    const v = new PalindromeValidator(FIRST_HALF, T);
    const r = v.validate({ id: 'x', timestamp: 3000, type: 'hold_start' });
    expect(r.quality).toBe('miss');
    expect(r.matchedOriginalId).toBeUndefined();
  });
  it('karışık firstHalf: sadece aynı tip eşleşir', () => {
    const mixed: InputEvent[] = [
      { id: 'a', timestamp: 2000, type: 'tap' },
      { id: 'b', timestamp: 7000, type: 'hold_start' },
    ];
    const v = new PalindromeValidator(mixed, T);
    // a mirror=13000 (tap), b mirror=8000 (hold_start)
    const r1 = v.validate({ id: 'x', timestamp: 8000, type: 'tap' });
    // closest tap mirror is 13000, delta=5000 → miss (not b!)
    expect(r1.quality).toBe('miss');
    const r2 = v.validate({ id: 'y', timestamp: 8000, type: 'hold_start' });
    expect(r2.quality).toBe('perfect');
    expect(r2.matchedOriginalId).toBe('b');
  });
});

describe('PalindromeValidator — boş firstHalf', () => {
  it('her validate miss döner', () => {
    const v = new PalindromeValidator([], T);
    const r = v.validate(tap('x', 3000));
    expect(r.quality).toBe('miss');
    expect(r.matchedOriginalId).toBeUndefined();
  });
});

describe('PalindromeValidator — getUnmatchedMirrors', () => {
  it('hiç validate yapılmadıysa firstHalf uzunluğu döner', () => {
    const v = new PalindromeValidator(FIRST_HALF, T);
    expect(v.getUnmatchedMirrors()).toBe(3);
  });
  it('hepsi perfect eşleşince 0 döner', () => {
    const v = new PalindromeValidator(FIRST_HALF, T);
    v.validate(tap('x1', 3000));
    v.validate(tap('x2', 8000));
    v.validate(tap('x3', 13000));
    expect(v.getUnmatchedMirrors()).toBe(0);
  });
  it('miss eşleşmeyi tüketmez', () => {
    const v = new PalindromeValidator(FIRST_HALF, T);
    v.validate(tap('x', 500)); // miss
    expect(v.getUnmatchedMirrors()).toBe(3);
  });
});

describe('PalindromeValidator — reset', () => {
  it('reset used kümesini temizler', () => {
    const v = new PalindromeValidator(FIRST_HALF, T);
    v.validate(tap('x1', 3000));
    expect(v.getUnmatchedMirrors()).toBe(2);
    v.reset();
    expect(v.getUnmatchedMirrors()).toBe(3);
    const r = v.validate(tap('x2', 3000));
    expect(r.quality).toBe('perfect');
    expect(r.matchedOriginalId).toBe('c');
  });
});

describe('PalindromeValidator — merkez edge case', () => {
  it('T=15000, mirror=7500; ikinci tıklama miss', () => {
    const center: InputEvent[] = [tap('m', 7500)];
    const v = new PalindromeValidator(center, T);
    const r1 = v.validate(tap('x1', 7500));
    expect(r1.quality).toBe('perfect');
    expect(r1.matchedOriginalId).toBe('m');
    const r2 = v.validate(tap('x2', 7500));
    expect(r2.quality).toBe('miss');
  });
});

describe('PalindromeValidator — özelleştirilmiş tolerance', () => {
  it('constructor ile override edilebilir', () => {
    const v = new PalindromeValidator(FIRST_HALF, T, {
      perfect: 10,
      good: 20,
      ok: 30,
    });
    expect(v.validate(tap('x1', 3005)).quality).toBe('perfect');
    expect(v.validate(tap('x2', 8015)).quality).toBe('good');
    expect(v.validate(tap('x3', 13025)).quality).toBe('ok');
  });
});
