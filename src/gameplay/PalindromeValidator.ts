import type { InputEvent, InputType, MatchQuality } from '../types';
import { mirrorTime } from '../utils/math';

export interface Tolerance {
  perfect: number;
  good: number;
  ok: number;
}

export interface ValidationResult {
  quality: MatchQuality;
  deltaMs: number;
  matchedOriginalId?: string;
}

interface ExpectedMirror {
  originalId: string;
  mirrorTime: number;
  type: InputType;
}

export const DEFAULT_TOLERANCE: Tolerance = {
  perfect: 60,
  good: 120,
  ok: 200,
};

export class PalindromeValidator {
  private readonly expectedMirrors: ExpectedMirror[];
  private readonly tolerance: Tolerance;
  private readonly used: Set<string> = new Set();

  constructor(
    firstHalfInputs: InputEvent[],
    halfDurationMs: number,
    tolerance: Tolerance = DEFAULT_TOLERANCE
  ) {
    this.tolerance = tolerance;
    this.expectedMirrors = firstHalfInputs
      .map((ev) => ({
        originalId: ev.id,
        mirrorTime: mirrorTime(ev.timestamp, halfDurationMs),
        type: ev.type,
      }))
      .sort((a, b) => a.mirrorTime - b.mirrorTime);
  }

  validate(input: InputEvent): ValidationResult {
    let best: ExpectedMirror | null = null;
    let bestDelta = Number.POSITIVE_INFINITY;

    for (const m of this.expectedMirrors) {
      if (this.used.has(m.originalId)) continue;
      if (m.type !== input.type) continue;
      const d = Math.abs(m.mirrorTime - input.timestamp);
      if (d < bestDelta) {
        best = m;
        bestDelta = d;
      }
    }

    if (best === null || bestDelta > this.tolerance.ok) {
      return { quality: 'miss', deltaMs: bestDelta };
    }

    let quality: MatchQuality;
    if (bestDelta <= this.tolerance.perfect) quality = 'perfect';
    else if (bestDelta <= this.tolerance.good) quality = 'good';
    else quality = 'ok';

    this.used.add(best.originalId);
    return {
      quality,
      deltaMs: bestDelta,
      matchedOriginalId: best.originalId,
    };
  }

  getUnmatchedMirrors(): number {
    return this.expectedMirrors.length - this.used.size;
  }

  getExpectedMirrors(): ReadonlyArray<{
    id: string;
    mirrorTime: number;
    type: InputType;
    used: boolean;
  }> {
    return this.expectedMirrors.map((m) => ({
      id: m.originalId,
      mirrorTime: m.mirrorTime,
      type: m.type,
      used: this.used.has(m.originalId),
    }));
  }

  reset(): void {
    this.used.clear();
  }
}
