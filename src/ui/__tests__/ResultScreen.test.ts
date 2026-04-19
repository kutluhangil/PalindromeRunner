import { describe, it, expect } from 'vitest';
import { computeStats } from '../ResultScreen';
import { GamePhase, type InputEvent, type RoundState } from '../../types';

function makeState(events: InputEvent[]): RoundState {
  return {
    phase: GamePhase.RESULT,
    level: { seed: 1, halfDurationMs: 15_000, obstacles: [] },
    firstHalfInputs: [],
    secondHalfInputs: events,
    score: 250,
    combo: 4,
    lives: 2,
    elapsedMs: 15_000,
    hintEnabled: true,
  };
}

describe('computeStats', () => {
  it('kaliteye göre sayaç döner', () => {
    const events: InputEvent[] = [
      { id: '1', timestamp: 100, type: 'tap', matchQuality: 'perfect' },
      { id: '2', timestamp: 200, type: 'tap', matchQuality: 'perfect' },
      { id: '3', timestamp: 300, type: 'tap', matchQuality: 'good' },
      { id: '4', timestamp: 400, type: 'tap', matchQuality: 'ok' },
      { id: '5', timestamp: 500, type: 'tap', matchQuality: 'miss' },
    ];
    const stats = computeStats(makeState(events), 1000);
    expect(stats.perfect).toBe(2);
    expect(stats.good).toBe(1);
    expect(stats.ok).toBe(1);
    expect(stats.miss).toBe(1);
    expect(stats.score).toBe(250);
    expect(stats.combo).toBe(4);
    expect(stats.lives).toBe(2);
    expect(stats.highScore).toBe(1000);
  });

  it('matchQuality olmayan eventler sayılmaz', () => {
    const stats = computeStats(
      makeState([{ id: '1', timestamp: 100, type: 'tap' }]),
      0
    );
    expect(stats.perfect + stats.good + stats.ok + stats.miss).toBe(0);
  });
});
