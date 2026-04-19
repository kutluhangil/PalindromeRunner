import { describe, it, expect } from 'vitest';
import { ScoreSystem } from '../ScoreSystem';

describe('ScoreSystem — başlangıç', () => {
  it('başlangıç snapshot: score 0, combo 0, lives 3', () => {
    const s = new ScoreSystem();
    expect(s.getSnapshot()).toEqual({ score: 0, combo: 0, lives: 3 });
  });
});

describe('ScoreSystem — tek match puanları', () => {
  it('perfect +100, combo 1', () => {
    const s = new ScoreSystem();
    s.applyMatch('perfect');
    expect(s.getSnapshot()).toEqual({ score: 100, combo: 1, lives: 3 });
  });
  it('good +50, combo 0', () => {
    const s = new ScoreSystem();
    s.applyMatch('good');
    expect(s.getSnapshot()).toEqual({ score: 50, combo: 0, lives: 3 });
  });
  it('ok +20, combo 0', () => {
    const s = new ScoreSystem();
    s.applyMatch('ok');
    expect(s.getSnapshot()).toEqual({ score: 20, combo: 0, lives: 3 });
  });
  it('miss -30, combo 0, lives 2', () => {
    const s = new ScoreSystem();
    s.applyMatch('miss');
    expect(s.getSnapshot()).toEqual({ score: -30, combo: 0, lives: 2 });
  });
});

describe('ScoreSystem — combo çarpanı eşikleri', () => {
  it('2 perfect: combo 2, çarpan ×1, score 200', () => {
    const s = new ScoreSystem();
    s.applyMatch('perfect');
    s.applyMatch('perfect');
    expect(s.getSnapshot()).toEqual({ score: 200, combo: 2, lives: 3 });
  });
  it('3 perfect: 3üncüde ×2 çarpan, score 100+100+200=400', () => {
    const s = new ScoreSystem();
    s.applyMatch('perfect');
    s.applyMatch('perfect');
    s.applyMatch('perfect');
    expect(s.getSnapshot()).toEqual({ score: 400, combo: 3, lives: 3 });
  });
  it('6 perfect: 6ncıda ×3, score 100+100+200+200+200+300=1100', () => {
    const s = new ScoreSystem();
    for (let i = 0; i < 6; i += 1) s.applyMatch('perfect');
    expect(s.getSnapshot().combo).toBe(6);
    expect(s.getSnapshot().score).toBe(1100);
  });
  it('10 perfect: 10uncuda ×4, score 2600', () => {
    const s = new ScoreSystem();
    for (let i = 0; i < 10; i += 1) s.applyMatch('perfect');
    // combo 1..10 → ×1,×1,×2,×2,×2,×3,×3,×3,×3,×4
    // 100*(1+1+2+2+2+3+3+3+3+4) = 100*24 = 2400
    expect(s.getSnapshot().combo).toBe(10);
    expect(s.getSnapshot().score).toBe(2400);
  });
});

describe('ScoreSystem — good/ok combo resetler ama combo çarpanı önce uygulanır', () => {
  it('2 perfect sonra good: good combo=2 ×1 ile 50 ekler, sonra combo reset', () => {
    const s = new ScoreSystem();
    s.applyMatch('perfect');
    s.applyMatch('perfect');
    s.applyMatch('good');
    expect(s.getSnapshot()).toEqual({ score: 250, combo: 0, lives: 3 });
  });
  it('3 perfect sonra good: combo 3 iken ×2 ile good 100 ekler, sonra combo reset', () => {
    const s = new ScoreSystem();
    s.applyMatch('perfect');
    s.applyMatch('perfect');
    s.applyMatch('perfect');
    s.applyMatch('good');
    expect(s.getSnapshot()).toEqual({ score: 500, combo: 0, lives: 3 });
  });
  it('3 perfect sonra ok: ok 40 ekler (20×2), combo reset', () => {
    const s = new ScoreSystem();
    s.applyMatch('perfect');
    s.applyMatch('perfect');
    s.applyMatch('perfect');
    s.applyMatch('ok');
    expect(s.getSnapshot()).toEqual({ score: 440, combo: 0, lives: 3 });
  });
});

describe('ScoreSystem — miss combo resetler, ham -30', () => {
  it('5 perfect sonra miss: -30 ham (çarpan yok), combo 0, lives 2', () => {
    const s = new ScoreSystem();
    for (let i = 0; i < 5; i += 1) s.applyMatch('perfect');
    // 5 perfect: ×1,×1,×2,×2,×2 = 8 birim × 100 = 800
    const beforeScore = s.getSnapshot().score;
    expect(beforeScore).toBe(800);
    s.applyMatch('miss');
    expect(s.getSnapshot()).toEqual({ score: 770, combo: 0, lives: 2 });
  });
  it('birden fazla miss hayatı azaltır', () => {
    const s = new ScoreSystem();
    s.applyMatch('miss');
    s.applyMatch('miss');
    s.applyMatch('miss');
    expect(s.getSnapshot().lives).toBe(0);
  });
});

describe('ScoreSystem — obstacle bonus', () => {
  it('+10, combo değişmez', () => {
    const s = new ScoreSystem();
    s.applyMatch('perfect');
    s.addObstacleBonus();
    expect(s.getSnapshot()).toEqual({ score: 110, combo: 1, lives: 3 });
  });
  it('lives etkilenmez', () => {
    const s = new ScoreSystem();
    s.addObstacleBonus();
    s.addObstacleBonus();
    expect(s.getSnapshot()).toEqual({ score: 20, combo: 0, lives: 3 });
  });
});

describe('ScoreSystem — unmatched penalty', () => {
  it('-50 × count', () => {
    const s = new ScoreSystem();
    s.applyUnmatchedPenalty(3);
    expect(s.getSnapshot().score).toBe(-150);
  });
  it('count 0 ise değişmez', () => {
    const s = new ScoreSystem();
    s.applyUnmatchedPenalty(0);
    expect(s.getSnapshot().score).toBe(0);
  });
  it('combo ve lives etkilenmez', () => {
    const s = new ScoreSystem();
    s.applyMatch('perfect');
    s.applyUnmatchedPenalty(2);
    expect(s.getSnapshot()).toEqual({ score: 0, combo: 1, lives: 3 });
  });
});

describe('ScoreSystem — reset', () => {
  it('score/combo/lives başlangıç değerine döner', () => {
    const s = new ScoreSystem();
    s.applyMatch('perfect');
    s.applyMatch('miss');
    s.addObstacleBonus();
    s.reset();
    expect(s.getSnapshot()).toEqual({ score: 0, combo: 0, lives: 3 });
  });
});
