import type { RoundState } from '../types';
import { GamePhase } from '../types';

export interface HUDElements {
  score: HTMLElement;
  combo: HTMLElement;
  phase: HTMLElement;
  lives?: HTMLElement | null; // optional — test ortamında olmayabilir
  timebarFill: HTMLElement;
}

export function phaseLabel(phase: GamePhase): string {
  switch (phase) {
    case GamePhase.IDLE:        return 'Hazır...';
    case GamePhase.COUNTDOWN:   return 'Hazır...';
    case GamePhase.FIRST_HALF:  return '🏃 İlk Yarı';
    case GamePhase.REWIND:      return '⏪ Geri Sar';
    case GamePhase.SECOND_HALF: return '💨 İkinci Yarı';
    case GamePhase.RESULT:      return '🏁 Sonuç';
    default:                    return '';
  }
}

export class HUD {
  constructor(private elements: HUDElements) {}

  update(state: RoundState): void {
    this.elements.score.textContent = `Skor: ${state.score}`;
    this.elements.combo.textContent = `Combo: ${state.combo}`;
    this.elements.phase.textContent = phaseLabel(state.phase);
    if (this.elements.lives != null) {
      this.elements.lives.textContent = '❤️'.repeat(Math.max(0, state.lives));
    }
    this.elements.timebarFill.style.width = `${this.computeTimebar(state) * 100}%`;
  }

  private computeTimebar(state: RoundState): number {
    if (
      state.phase === GamePhase.FIRST_HALF ||
      state.phase === GamePhase.SECOND_HALF
    ) {
      const total = state.level.halfDurationMs;
      return Math.max(0, Math.min(1, 1 - state.elapsedMs / total));
    }
    if (state.phase === GamePhase.COUNTDOWN) {
      return Math.max(0, Math.min(1, 1 - state.elapsedMs / 3000));
    }
    return 0;
  }
}

export function createHUD(doc: Document = document): HUD {
  const score = doc.getElementById('score');
  const combo = doc.getElementById('combo');
  const phase = doc.getElementById('phase');
  const lives = doc.getElementById('lives'); // null olabilir — test ortamında
  const timebarFill = doc.getElementById('timebar-fill');

  if (!score || !combo || !phase || !timebarFill) {
    throw new Error('Zorunlu HUD elementleri bulunamadı: #score, #combo, #phase, #timebar-fill');
  }

  return new HUD({ score, combo, phase, lives, timebarFill });
}
