import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameEngine } from '../GameEngine';
import { GamePhase } from '../../types';

const COUNTDOWN = 3000;
const REWIND = 800;
const HALF = 1000;

function advance(ms: number): void {
  vi.advanceTimersByTime(ms);
}

describe('GameEngine — akış', () => {
  let engine: GameEngine;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['performance'] });
    engine = new GameEngine();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('start sonrası COUNTDOWN fazında', () => {
    engine.start(42, HALF);
    expect(engine.getState().phase).toBe(GamePhase.COUNTDOWN);
  });

  it('full round palindrome: perfect tap, score > 0, lives 3, combo >= 1', () => {
    engine.start(42, HALF);

    // COUNTDOWN → FIRST_HALF
    advance(COUNTDOWN);
    engine.update();
    expect(engine.getState().phase).toBe(GamePhase.FIRST_HALF);

    // İlk yarıda t=500'de tap
    advance(500);
    engine.onTap();

    // İlk yarı sonu → REWIND
    advance(500);
    engine.update();
    expect(engine.getState().phase).toBe(GamePhase.REWIND);
    expect(engine.getState().firstHalfInputs.length).toBe(1);
    expect(engine.getState().firstHalfInputs[0].timestamp).toBeCloseTo(500, 0);

    // REWIND → SECOND_HALF
    advance(REWIND);
    engine.update();
    expect(engine.getState().phase).toBe(GamePhase.SECOND_HALF);

    // İkinci yarıda t=500'de tap (mirror=500 → perfect)
    advance(500);
    engine.onTap();

    // İkinci yarı sonu → RESULT
    advance(500);
    engine.update();
    expect(engine.getState().phase).toBe(GamePhase.RESULT);

    const st = engine.getState();
    expect(st.score).toBeGreaterThan(0);
    expect(st.lives).toBe(3);
    expect(st.combo).toBeGreaterThanOrEqual(1);
    expect(st.secondHalfInputs.length).toBe(1);
    expect(st.secondHalfInputs[0].matchQuality).toBe('perfect');
  });

  it('yanlış zamanda tap → miss, lives azalır', () => {
    engine.start(42, HALF);
    advance(COUNTDOWN);
    engine.update();
    // first half: tap at 500
    advance(500);
    engine.onTap();
    advance(500);
    engine.update(); // REWIND
    advance(REWIND);
    engine.update(); // SECOND_HALF
    // Mirror of 500 is 500. tap at 100 → delta=400, miss
    advance(100);
    engine.onTap();
    const st = engine.getState();
    expect(st.secondHalfInputs[0].matchQuality).toBe('miss');
    expect(st.lives).toBe(2);
  });

  it('IDLE/COUNTDOWN/REWIND/RESULT fazlarında onTap no-op', () => {
    engine.start(42, HALF);
    // COUNTDOWN'da
    engine.onTap();
    advance(COUNTDOWN);
    engine.update();
    // FIRST_HALF'de bir tap bırak
    advance(500);
    engine.onTap();
    advance(500);
    engine.update(); // REWIND
    // REWIND'de tap
    advance(200);
    engine.onTap();
    // Second half'e geçince recorder hâlâ sadece FIRST_HALF tap'larını kaydetmeli (ki onlar zaten state'e aktarıldı)
    // First half inputs 1 tap olmalı
    expect(engine.getState().firstHalfInputs.length).toBe(1);
    advance(REWIND);
    engine.update(); // SECOND_HALF
    expect(engine.getState().phase).toBe(GamePhase.SECOND_HALF);
    // Result'a geçmeden dokunmadan tap atmayalım. RESULT'a geç.
    advance(HALF);
    engine.update();
    expect(engine.getState().phase).toBe(GamePhase.RESULT);
    const scoreBefore = engine.getState().score;
    engine.onTap(); // RESULT'da no-op
    expect(engine.getState().score).toBe(scoreBefore);
  });

  it('restart aynı seed ile aynı level üretir, state sıfırlanır', () => {
    engine.start(42, HALF);
    const level1 = engine.getState().level;
    advance(COUNTDOWN);
    engine.update();
    advance(500);
    engine.onTap();
    advance(500);
    engine.update(); // REWIND
    advance(REWIND);
    engine.update(); // SECOND_HALF
    advance(500);
    engine.onTap();
    advance(500);
    engine.update(); // RESULT

    const scoreBeforeRestart = engine.getState().score;
    expect(scoreBeforeRestart).toBeGreaterThan(0);

    engine.restart();
    const st = engine.getState();
    expect(st.phase).toBe(GamePhase.COUNTDOWN);
    expect(st.score).toBe(0);
    expect(st.combo).toBe(0);
    expect(st.lives).toBe(3);
    expect(st.firstHalfInputs.length).toBe(0);
    expect(st.secondHalfInputs.length).toBe(0);
    expect(st.level).toEqual(level1);
  });

  it('unmatched mirror penalty: ikinci yarıda hiç tıklanmazsa penalty uygulanır', () => {
    engine.start(42, HALF);
    advance(COUNTDOWN);
    engine.update();
    advance(500);
    engine.onTap();
    advance(500);
    engine.update();
    advance(REWIND);
    engine.update();
    // SECOND_HALF, hiç tap yok
    advance(HALF);
    engine.update();
    expect(engine.getState().phase).toBe(GamePhase.RESULT);
    // 1 mirror unmatched → -50
    expect(engine.getState().score).toBe(-50);
  });

  it('GameEngine tipi saf TypeScript, DOM referansı içermez', () => {
    const engineTwo = new GameEngine();
    expect(engineTwo.getState().phase).toBe(GamePhase.IDLE);
  });
});
