import type { RoundState } from '../types';

export interface ResultScreenStats {
  score: number;
  combo: number;
  lives: number;
  perfect: number;
  good: number;
  ok: number;
  miss: number;
  highScore: number;
}

export function computeStats(state: RoundState, highScore: number): ResultScreenStats {
  let perfect = 0;
  let good = 0;
  let ok = 0;
  let miss = 0;
  for (const ev of state.secondHalfInputs) {
    if (ev.matchQuality === 'perfect') perfect += 1;
    else if (ev.matchQuality === 'good') good += 1;
    else if (ev.matchQuality === 'ok') ok += 1;
    else if (ev.matchQuality === 'miss') miss += 1;
  }
  return {
    score: state.score,
    combo: state.combo,
    lives: state.lives,
    perfect,
    good,
    ok,
    miss,
    highScore,
  };
}

export interface ResultScreenOptions {
  root: HTMLElement;
  onRestart: () => void;
}

export class ResultScreen {
  private visible = false;
  private restartButton: HTMLButtonElement;
  private statsContainer: HTMLElement;

  constructor(private options: ResultScreenOptions) {
    this.options.root.classList.add('result-screen');
    this.options.root.style.display = 'none';
    this.options.root.innerHTML = `
      <div class="result-card">
        <h2>Sonuç</h2>
        <div class="result-stats"></div>
        <button type="button" class="result-restart">Tekrar Oyna</button>
      </div>
    `;
    const btn = this.options.root.querySelector<HTMLButtonElement>('.result-restart');
    const stats = this.options.root.querySelector<HTMLElement>('.result-stats');
    if (!btn || !stats) throw new Error('ResultScreen DOM hazırlanamadı');
    this.restartButton = btn;
    this.statsContainer = stats;
    this.restartButton.addEventListener('click', () => this.options.onRestart());
  }

  show(stats: ResultScreenStats): void {
    this.statsContainer.innerHTML = `
      <div>Skor: <strong>${stats.score}</strong></div>
      <div>Rekor: <strong>${stats.highScore}</strong></div>
      <div>Combo: <strong>${stats.combo}</strong></div>
      <div>Perfect: <strong>${stats.perfect}</strong></div>
      <div>Good: <strong>${stats.good}</strong></div>
      <div>Ok: <strong>${stats.ok}</strong></div>
      <div>Miss: <strong>${stats.miss}</strong></div>
    `;
    this.options.root.style.display = 'flex';
    this.visible = true;
  }

  hide(): void {
    this.options.root.style.display = 'none';
    this.visible = false;
  }

  isVisible(): boolean {
    return this.visible;
  }
}

export function createResultScreen(
  onRestart: () => void,
  doc: Document = document
): ResultScreen {
  const root = doc.getElementById('result-screen');
  if (!root) throw new Error('result-screen element bulunamadı');
  return new ResultScreen({ root, onRestart });
}
