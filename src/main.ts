import { GameEngine } from './core/GameEngine';
import { InputManager } from './core/InputManager';
import { Renderer } from './rendering/Renderer';
import { createHUD } from './ui/HUD';
import { computeStats, createResultScreen } from './ui/ResultScreen';
import { Sfx } from './ui/Sfx';
import { GamePhase } from './types';
import { getDifficulty, parseUrlParams } from './utils/difficulty';

const HIGH_SCORE_KEY = 'palindrome-runner:high-score';
const MUTE_KEY = 'palindrome-runner:muted';

function loadHighScore(): number {
  try {
    const raw = localStorage.getItem(HIGH_SCORE_KEY);
    if (!raw) return 0;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function saveHighScore(score: number): void {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    // ignore
  }
}

function loadMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

function saveMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    // ignore
  }
}

const canvas = document.getElementById('game') as HTMLCanvasElement | null;
if (!canvas) throw new Error('canvas#game bulunamadı');
const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('2d context alınamadı');
const muteButton = document.getElementById('mute-button') as HTMLButtonElement | null;

const { seed, level } = parseUrlParams(window.location.search, {
  seed: 1,
  level: 2,
});
const difficulty = getDifficulty(level);

const engine = new GameEngine();
const renderer = new Renderer(ctx);
const hud = createHUD();
const sfx = new Sfx();
sfx.setMuted(loadMuted());

function renderMuteIcon(): void {
  if (!muteButton) return;
  muteButton.textContent = sfx.isMuted() ? '🔇' : '🔊';
}
renderMuteIcon();

if (muteButton) {
  muteButton.addEventListener('click', () => {
    sfx.setMuted(!sfx.isMuted());
    saveMuted(sfx.isMuted());
    renderMuteIcon();
  });
}

const resultScreen = createResultScreen(() => {
  resultScreen.hide();
  startRound();
});

const input = new InputManager({
  target: canvas,
  onTap: () => {
    sfx.play('tap');
    engine.onTap();
  },
});
input.attach();

let highScore = loadHighScore();
let lastPhase: GamePhase = GamePhase.IDLE;

function startRound(): void {
  engine.start(seed, difficulty.halfDurationMs, {
    tolerance: difficulty.tolerance,
    minGapMs: difficulty.minGapMs,
    maxGapMs: difficulty.maxGapMs,
    hintEnabled: difficulty.hintEnabled,
    onMatch: (quality) => sfx.play(quality),
  });
  lastPhase = GamePhase.IDLE;
}

startRound();

let lastMs = performance.now();
function loop(nowMs: number): void {
  const dt = Math.min(64, nowMs - lastMs);
  lastMs = nowMs;
  engine.update(dt);

  const state = engine.getState();
  renderer.render(
    state,
    engine.getPlayer(),
    engine.getObstacles(),
    engine.getBackground(),
    engine.getFlashEffect(),
    engine.getExpectedMirrors()
  );
  hud.update(state);

  if (state.phase !== lastPhase) {
    if (state.phase === GamePhase.REWIND) sfx.play('rewind');
    if (state.phase === GamePhase.RESULT) {
      if (state.score > highScore) {
        highScore = state.score;
        saveHighScore(highScore);
      }
      resultScreen.show(computeStats(state, highScore));
    }
    lastPhase = state.phase;
  }

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

console.log('booted', { seed, level: difficulty.level, label: difficulty.label });
