import { describe, it, expect } from 'vitest';
import { PalindromeValidator } from '../PalindromeValidator';
import type { InputEvent } from '../../types';

const T = 15000;
const FIRST_HALF: InputEvent[] = [
  { id: 'a', timestamp: 2000, type: 'tap' },
  { id: 'b', timestamp: 7000, type: 'tap' },
  { id: 'c', timestamp: 12000, type: 'tap' },
];

describe('PalindromeValidator.getExpectedMirrors', () => {
  it('tüm aynaları used=false olarak döner', () => {
    const v = new PalindromeValidator(FIRST_HALF, T);
    const mirrors = v.getExpectedMirrors();
    expect(mirrors.length).toBe(3);
    expect(mirrors.every((m) => !m.used)).toBe(true);
  });

  it('sıralı: mirrorTime artan', () => {
    const v = new PalindromeValidator(FIRST_HALF, T);
    const mirrors = v.getExpectedMirrors();
    const times = mirrors.map((m) => m.mirrorTime);
    expect(times).toEqual([3000, 8000, 13000]);
  });

  it('validate sonrası eşleşen ayna used=true', () => {
    const v = new PalindromeValidator(FIRST_HALF, T);
    v.validate({ id: 'x', timestamp: 3000, type: 'tap' });
    const mirrors = v.getExpectedMirrors();
    const c = mirrors.find((m) => m.id === 'c');
    expect(c?.used).toBe(true);
    const b = mirrors.find((m) => m.id === 'b');
    expect(b?.used).toBe(false);
  });
});
