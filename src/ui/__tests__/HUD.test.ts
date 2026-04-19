// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { HUD, phaseLabel } from '../HUD';
import { GamePhase, type RoundState } from '../../types';

function makeElements() {
  const score = document.createElement('div');
  const combo = document.createElement('div');
  const phase = document.createElement('div');
  const timebarFill = document.createElement('div');
  return { score, combo, phase, timebarFill };
}

function makeState(partial: Partial<RoundState> = {}): RoundState {
  return {
    phase: GamePhase.FIRST_HALF,
    level: {
      seed: 1,
      halfDurationMs: 15_000,
      obstacles: [],
    },
    firstHalfInputs: [],
    secondHalfInputs: [],
    score: 0,
    combo: 0,
    lives: 3,
    elapsedMs: 0,
    hintEnabled: true,
    ...partial,
  };
}

describe('HUD', () => {
  let elements: ReturnType<typeof makeElements>;
  let hud: HUD;

  beforeEach(() => {
    elements = makeElements();
    hud = new HUD(elements);
  });

  it('skor ve combo yazılır', () => {
    hud.update(makeState({ score: 150, combo: 3 }));
    expect(elements.score.textContent).toBe('Skor: 150');
    expect(elements.combo.textContent).toBe('Combo: 3');
  });

  it('faz etiketi Türkçe', () => {
    hud.update(makeState({ phase: GamePhase.FIRST_HALF }));
    expect(elements.phase.textContent).toBe('İlk Yarı');
    hud.update(makeState({ phase: GamePhase.SECOND_HALF }));
    expect(elements.phase.textContent).toBe('İkinci Yarı');
    hud.update(makeState({ phase: GamePhase.REWIND }));
    expect(elements.phase.textContent).toBe('Geri Sar');
    hud.update(makeState({ phase: GamePhase.RESULT }));
    expect(elements.phase.textContent).toBe('Sonuç');
  });

  it('timebar yarıda %50', () => {
    hud.update(
      makeState({
        phase: GamePhase.FIRST_HALF,
        elapsedMs: 7500,
      })
    );
    expect(elements.timebarFill.style.width).toBe('50%');
  });

  it('rewind/idle/sonuç fazlarında timebar 0', () => {
    hud.update(makeState({ phase: GamePhase.REWIND, elapsedMs: 400 }));
    expect(elements.timebarFill.style.width).toBe('0%');
    hud.update(makeState({ phase: GamePhase.IDLE }));
    expect(elements.timebarFill.style.width).toBe('0%');
  });

  it('timebar 0-1 aralığında sıkıştırılır', () => {
    hud.update(
      makeState({ phase: GamePhase.FIRST_HALF, elapsedMs: 99_999 })
    );
    expect(elements.timebarFill.style.width).toBe('100%');
  });

  it('phaseLabel idle ve countdown Hazır', () => {
    expect(phaseLabel(GamePhase.IDLE)).toBe('Hazır...');
    expect(phaseLabel(GamePhase.COUNTDOWN)).toBe('Hazır...');
  });
});
