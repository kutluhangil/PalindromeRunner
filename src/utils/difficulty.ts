import type { Tolerance } from '../gameplay/PalindromeValidator';

export interface DifficultyConfig {
  level: number;
  label: string;
  halfDurationMs: number;
  tolerance: Tolerance;
  minGapMs: number;
  maxGapMs: number;
  hintEnabled: boolean;
}

export const DIFFICULTIES: readonly DifficultyConfig[] = [
  {
    level: 1,
    label: 'Çok Kolay',
    halfDurationMs: 12_000,
    tolerance: { perfect: 90, good: 160, ok: 260 },
    minGapMs: 1100,
    maxGapMs: 2600,
    hintEnabled: true,
  },
  {
    level: 2,
    label: 'Kolay',
    halfDurationMs: 15_000,
    tolerance: { perfect: 70, good: 140, ok: 220 },
    minGapMs: 900,
    maxGapMs: 2300,
    hintEnabled: true,
  },
  {
    level: 3,
    label: 'Orta',
    halfDurationMs: 18_000,
    tolerance: { perfect: 60, good: 120, ok: 200 },
    minGapMs: 800,
    maxGapMs: 2000,
    hintEnabled: true,
  },
  {
    level: 4,
    label: 'Zor',
    halfDurationMs: 22_000,
    tolerance: { perfect: 50, good: 100, ok: 170 },
    minGapMs: 700,
    maxGapMs: 1700,
    hintEnabled: false,
  },
  {
    level: 5,
    label: 'Uzman',
    halfDurationMs: 26_000,
    tolerance: { perfect: 40, good: 80, ok: 140 },
    minGapMs: 600,
    maxGapMs: 1400,
    hintEnabled: false,
  },
] as const;

export function getDifficulty(level: number): DifficultyConfig {
  const clamped = Math.max(1, Math.min(DIFFICULTIES.length, Math.floor(level)));
  return DIFFICULTIES[clamped - 1];
}

export interface UrlParams {
  seed: number;
  level: number;
}

export function parseUrlParams(search: string, defaults: UrlParams): UrlParams {
  const params = new URLSearchParams(search);
  const seedRaw = params.get('seed');
  const levelRaw = params.get('level');
  const seedParsed = seedRaw !== null ? Number.parseInt(seedRaw, 10) : NaN;
  const levelParsed = levelRaw !== null ? Number.parseInt(levelRaw, 10) : NaN;
  return {
    seed: Number.isFinite(seedParsed) ? seedParsed : defaults.seed,
    level: Number.isFinite(levelParsed) ? levelParsed : defaults.level,
  };
}
