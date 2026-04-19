import type { RoundState } from '../types';
import { GamePhase } from '../types';

export interface ResultStats {
  score: number;
  highScore: number;
  perfect: number;
  good: number;
  ok: number;
  miss: number;
  combo: number;
  lives: number;
}

export function computeStats(state: RoundState, highScore: number): ResultStats {
  const inputs = state.secondHalfInputs;
  const counts = { perfect: 0, good: 0, ok: 0, miss: 0 };
  for (const e of inputs) {
    if (!e.matchQuality) continue; // tanımsız kalite → sayma
    const q = e.matchQuality;
    if (q in counts) counts[q as keyof typeof counts]++;
  }
  for (const e of state.firstHalfInputs) {
    const mirrored = state.secondHalfInputs.some(
      (s) => s.matchQuality !== undefined && s.matchQuality !== 'miss'
    );
    void mirrored; // checked via validator
  }
  return { ...counts, score: state.score, highScore, combo: state.combo, lives: state.lives };
}

export class ResultScreen {
  private card: HTMLElement | null = null;

  constructor(
    private options: { root: HTMLElement; onRestart: () => void }
  ) {}

  show(stats: ResultStats): void {
    const { root, onRestart } = this.options;

    const isNewHigh = stats.score > 0 && stats.score >= stats.highScore;
    const isBad = stats.miss >= 3 || stats.score <= 0;
    const headline = isBad
      ? 'BUNDAN İYİSİ YARDIR! 💣'
      : isNewHigh
      ? '🌟 YENİ REKOR! 🌟'
      : "THAT'S ALL FOLKS! 🐦";

    root.innerHTML = `
      <div class="result-card">
        <div class="result-thats-all">${headline}</div>
        <div class="result-stats">
          <span class="stat-label">✨ Perfect</span>
          <span class="stat-value">${stats.perfect}</span>
          <span class="stat-label">👍 Good</span>
          <span class="stat-value">${stats.good}</span>
          <span class="stat-label">🙂 Ok</span>
          <span class="stat-value">${stats.ok}</span>
          <span class="stat-label">❌ Miss</span>
          <span class="stat-value">${stats.miss}</span>
          <span class="stat-label">⭐ Skor</span>
          <span class="stat-value">${stats.score.toLocaleString('tr-TR')}</span>
          <span class="stat-label">💥 Max Combo</span>
          <span class="stat-value">x${stats.combo}</span>
        </div>
        ${stats.score >= stats.highScore && stats.score > 0
          ? `<div class="result-high">🏆 YENİ EN YÜKSEK: ${stats.highScore.toLocaleString('tr-TR')}</div>`
          : `<div class="result-high">En yüksek: ${stats.highScore.toLocaleString('tr-TR')}</div>`}
        <button type="button" class="result-restart">🐦 MEEP MEEP! Tekrar Oyna</button>
      </div>
    `;

    this.card = root.querySelector('.result-card');
    const btn = root.querySelector<HTMLButtonElement>('.result-restart');
    if (btn) {
      btn.addEventListener('click', onRestart, { once: true });
      btn.addEventListener('pointerdown', (e) => e.stopPropagation(), { once: true });
    }

    root.classList.add('visible');
  }

  hide(): void {
    this.options.root.classList.remove('visible');
    this.options.root.innerHTML = '';
    this.card = null;
  }
}

export function createResultScreen(onRestart: () => void): ResultScreen {
  const root = document.getElementById('result-screen');
  if (!root) throw new Error('#result-screen bulunamadı');
  return new ResultScreen({ root, onRestart });
}
