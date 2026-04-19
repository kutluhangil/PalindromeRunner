import type { LevelData, ObstacleData } from '../types';
import { mulberry32 } from '../utils/RNG';

const FIRST_OBSTACLE_MS = 1500;
const DEFAULT_MIN_GAP_MS = 800;
const DEFAULT_MAX_GAP_MS = 2300;
const END_PAD_MS = 800;

export interface LevelGenerationOptions {
  minGapMs?: number;
  maxGapMs?: number;
}

export function generateLevel(
  seed: number,
  halfDurationMs: number,
  options: LevelGenerationOptions = {}
): LevelData {
  const minGap = options.minGapMs ?? DEFAULT_MIN_GAP_MS;
  const maxGap = options.maxGapMs ?? DEFAULT_MAX_GAP_MS;
  const rng = mulberry32(seed);
  const obstacles: ObstacleData[] = [];
  const maxSpawn = halfDurationMs - END_PAD_MS;

  let t = FIRST_OBSTACLE_MS;
  let i = 0;
  while (t <= maxSpawn) {
    const laneRand = rng();
    const typeRand = rng();
    const lane = Math.floor(laneRand * 3) as 0 | 1 | 2;
    let type: ObstacleData['type'];
    if (typeRand < 0.6) type = 'low';
    else if (typeRand < 0.85) type = 'high';
    else type = 'block';

    obstacles.push({
      id: `obs_${i}`,
      spawnTime: t,
      lane,
      type,
    });

    const gap = minGap + rng() * (maxGap - minGap);
    t += gap;
    i += 1;
  }

  return {
    seed,
    halfDurationMs,
    obstacles,
  };
}
