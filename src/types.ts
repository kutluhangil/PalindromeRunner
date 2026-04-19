export type InputType = 'tap' | 'hold_start' | 'hold_end';

export enum GamePhase {
  IDLE = 'idle',
  COUNTDOWN = 'countdown',
  FIRST_HALF = 'first_half',
  REWIND = 'rewind',
  SECOND_HALF = 'second_half',
  RESULT = 'result',
}

export type MatchQuality = 'perfect' | 'good' | 'ok' | 'miss';

export interface InputEvent {
  id: string;
  timestamp: number;
  type: InputType;
  matchQuality?: MatchQuality;
  deltaMs?: number;
}

export interface ObstacleData {
  id: string;
  spawnTime: number;
  lane: 0 | 1 | 2;
  type: 'low' | 'high' | 'block';
}

export interface LevelData {
  seed: number;
  halfDurationMs: number;
  obstacles: ObstacleData[];
}

export interface RoundState {
  phase: GamePhase;
  level: LevelData;
  firstHalfInputs: InputEvent[];
  secondHalfInputs: InputEvent[];
  score: number;
  combo: number;
  lives: number;
  elapsedMs: number;
  hintEnabled: boolean;
}
