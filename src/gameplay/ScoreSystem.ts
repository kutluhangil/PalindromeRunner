import type { MatchQuality } from '../types';

export interface ScoreSnapshot {
  score: number;
  combo: number;
  lives: number;
}

const INITIAL_LIVES = 3;

export class ScoreSystem {
  private score = 0;
  private combo = 0;
  private lives = INITIAL_LIVES;

  applyMatch(quality: MatchQuality): void {
    if (quality === 'miss') {
      this.score -= 30;
      this.combo = 0;
      this.lives -= 1;
      return;
    }

    let base: number;
    if (quality === 'perfect') base = 100;
    else if (quality === 'good') base = 50;
    else base = 20; // ok

    if (quality === 'perfect') {
      this.combo += 1;
    }

    this.score += base * this.multiplier();

    if (quality !== 'perfect') {
      this.combo = 0;
    }
  }

  addObstacleBonus(): void {
    this.score += 10;
  }

  applyUnmatchedPenalty(count: number): void {
    this.score -= 50 * count;
  }

  reset(): void {
    this.score = 0;
    this.combo = 0;
    this.lives = INITIAL_LIVES;
  }

  getSnapshot(): ScoreSnapshot {
    return {
      score: this.score,
      combo: this.combo,
      lives: this.lives,
    };
  }

  private multiplier(): number {
    if (this.combo >= 10) return 4;
    if (this.combo >= 6) return 3;
    if (this.combo >= 3) return 2;
    return 1;
  }
}
