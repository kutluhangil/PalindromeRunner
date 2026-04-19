import { GamePhase, type RoundState } from '../types';

const PHASE_LABELS: Record<GamePhase, string> = {
  [GamePhase.IDLE]: 'Hazır...',
  [GamePhase.COUNTDOWN]: 'Hazır...',
  [GamePhase.FIRST_HALF]: 'İlk Yarı',
  [GamePhase.REWIND]: 'Geri Sar',
  [GamePhase.SECOND_HALF]: 'İkinci Yarı',
  [GamePhase.RESULT]: 'Sonuç',
};

export function phaseLabel(phase: GamePhase): string {
  return PHASE_LABELS[phase];
}

export interface HUDElements {
  score: HTMLElement;
  combo: HTMLElement;
  phase: HTMLElement;
  timebarFill: HTMLElement;
}

export class HUD {
  constructor(private elements: HUDElements) {}

  update(state: RoundState): void {
    this.elements.score.textContent = `Skor: ${state.score}`;
    this.elements.combo.textContent = `Combo: ${state.combo}`;
    this.elements.phase.textContent = phaseLabel(state.phase);
    this.elements.timebarFill.style.width = `${this.computeTimebar(state) * 100}%`;
  }

  private computeTimebar(state: RoundState): number {
    const total = state.level.halfDurationMs;
    if (total <= 0) return 0;
    if (
      state.phase === GamePhase.FIRST_HALF ||
      state.phase === GamePhase.SECOND_HALF
    ) {
      const p = state.elapsedMs / total;
      return Math.max(0, Math.min(1, p));
    }
    return 0;
  }
}

export function createHUD(doc: Document = document): HUD {
  const score = doc.getElementById('score');
  const combo = doc.getElementById('combo');
  const phase = doc.getElementById('phase');
  const timebarFill = doc.getElementById('timebar-fill');
  if (!score || !combo || !phase || !timebarFill) {
    throw new Error('HUD elementleri bulunamadı');
  }
  return new HUD({ score, combo, phase, timebarFill });
}
