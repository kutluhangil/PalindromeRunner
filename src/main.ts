import { GameEngine } from './core/GameEngine';
import { InputManager } from './core/InputManager';
import { Renderer } from './rendering/Renderer';
import { createHUD } from './ui/HUD';
import { computeStats, createResultScreen } from './ui/ResultScreen';
import { Sfx } from './ui/Sfx';
import { GamePhase } from './types';
import { getDifficulty, parseUrlParams } from './utils/difficulty';

const HIGH_SCORE_KEY = 'palindrome-runner:high-score';
const MUTE_KEY      = 'palindrome-runner:muted';

function loadHighScore(): number {
  try { const n = Number.parseInt(localStorage.getItem(HIGH_SCORE_KEY) ?? '0', 10); return Number.isFinite(n) ? n : 0; } catch { return 0; }
}
function saveHighScore(s: number): void {
  try { localStorage.setItem(HIGH_SCORE_KEY, String(s)); } catch { /* ignore */ }
}
function loadMuted(): boolean {
  try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; }
}
function saveMuted(m: boolean): void {
  try { localStorage.setItem(MUTE_KEY, m ? '1' : '0'); } catch { /* ignore */ }
}

// ─── DOM ──────────────────────────────────────────────────────────────────────

const canvas = document.getElementById('game') as HTMLCanvasElement | null;
if (!canvas) throw new Error('canvas#game bulunamadı');
const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('2D context alınamadı');
const muteButton = document.getElementById('mute-button') as HTMLButtonElement | null;

// ─── Responsive fullscreen scaling ────────────────────────────────────────────

const DESIGN_W = 800;
const DESIGN_H = 450;

function scaleStage(): void {
  const stage = document.getElementById('stage');
  if (!stage) return;
  const scaleX = window.innerWidth  / DESIGN_W;
  const scaleY = window.innerHeight / DESIGN_H;
  // "contain" — tüm canvas görünür, letterbox çöl rengiyle dolar
  const scale = Math.min(scaleX, scaleY);
  stage.style.transform = `scale(${scale})`;
}

scaleStage();
window.addEventListener('resize', scaleStage);
screen.orientation?.addEventListener?.('change', scaleStage);

// ─── Game setup ───────────────────────────────────────────────────────────────

const { seed, level } = parseUrlParams(window.location.search, { seed: 1, level: 2 });
const difficulty = getDifficulty(level);

const engine   = new GameEngine();
const renderer = new Renderer(ctx);
const hud      = createHUD();
const sfx      = new Sfx();
sfx.setMuted(loadMuted());

function renderMuteIcon(): void {
  if (muteButton) muteButton.textContent = sfx.isMuted() ? '🔇' : '🔊';
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

const inputMgr = new InputManager({
  target: canvas,
  onInput: (type, pressStartMs) => {
    sfx.play('tap'); // her zıplamada meep meep
    engine.onInput(type, pressStartMs);
  },
});
inputMgr.attach();

let highScore = loadHighScore();
let lastPhase: GamePhase = GamePhase.IDLE;

function startRound(): void {
  engine.start(seed, difficulty.halfDurationMs, {
    tolerance:    difficulty.tolerance,
    minGapMs:     difficulty.minGapMs,
    maxGapMs:     difficulty.maxGapMs,
    hintEnabled:  difficulty.hintEnabled,
    onMatch: (quality) => sfx.play(quality),
  });
  lastPhase = GamePhase.IDLE;
}

startRound();

// ─── Game loop ────────────────────────────────────────────────────────────────

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
