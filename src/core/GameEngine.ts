import { Clock } from './Clock';
import { StateMachine } from './StateMachine';
import { InputRecorder } from '../gameplay/InputRecorder';
import { ScoreSystem } from '../gameplay/ScoreSystem';
import {
  PalindromeValidator,
  type Tolerance,
} from '../gameplay/PalindromeValidator';
import { generateLevel } from '../gameplay/LevelGenerator';
import { GamePhase } from '../types';
import type { InputEvent, InputType, RoundState } from '../types';
import { Player } from '../entities/Player';
import { Obstacle } from '../entities/Obstacle';
import { Background } from '../entities/Background';
import { SCROLL_SPEED_PX_PER_MS } from '../utils/constants';
import { FlashEffect } from './FlashEffect';

const DEFAULT_HALF_DURATION_MS = 15_000;
const COUNTDOWN_MS = 3000;
const REWIND_MS = 800;
const DEFAULT_SEED = 1;
const DEFAULT_DT_MS = 16;

export interface GameEngineOptions {
  tolerance?: Tolerance;
  minGapMs?: number;
  maxGapMs?: number;
  hintEnabled?: boolean;
}

export interface StartOptions {
  tolerance?: Tolerance;
  minGapMs?: number;
  maxGapMs?: number;
  hintEnabled?: boolean;
  onMatch?: (quality: import('../types').MatchQuality) => void;
}

export class GameEngine {
  private clock = new Clock();
  private recorder = new InputRecorder();
  private scoreSystem = new ScoreSystem();
  private stateMachine = new StateMachine();
  private validator: PalindromeValidator | null = null;
  private state: RoundState;
  private lastSeed = DEFAULT_SEED;
  private lastHalfDurationMs = DEFAULT_HALF_DURATION_MS;
  private activeTolerance?: Tolerance;
  private activeMinGapMs?: number;
  private activeMaxGapMs?: number;
  private activeHintEnabled = true;
  private onMatch?: (quality: import('../types').MatchQuality) => void;

  private player = new Player();
  private obstacles: Obstacle[] = [];
  private background = new Background();
  private spawnIndex = 0;
  private flashEffect = new FlashEffect();

  constructor(options: GameEngineOptions = {}) {
    this.activeTolerance = options.tolerance;
    this.activeMinGapMs = options.minGapMs;
    this.activeMaxGapMs = options.maxGapMs;
    this.activeHintEnabled = options.hintEnabled ?? true;
    this.state = this.buildInitialState(
      DEFAULT_SEED,
      DEFAULT_HALF_DURATION_MS
    );
  }

  start(
    seed: number,
    halfDurationMs: number = DEFAULT_HALF_DURATION_MS,
    options: StartOptions = {}
  ): void {
    this.lastSeed = seed;
    this.lastHalfDurationMs = halfDurationMs;
    if (options.tolerance !== undefined) this.activeTolerance = options.tolerance;
    if (options.minGapMs !== undefined) this.activeMinGapMs = options.minGapMs;
    if (options.maxGapMs !== undefined) this.activeMaxGapMs = options.maxGapMs;
    if (options.hintEnabled !== undefined) this.activeHintEnabled = options.hintEnabled;
    if (options.onMatch !== undefined) this.onMatch = options.onMatch;
    this.validator = null;
    this.recorder.stop();
    this.scoreSystem.reset();
    this.clock.reset();
    this.stateMachine = new StateMachine();
    this.state = this.buildInitialState(seed, halfDurationMs);
    this.player.reset();
    this.obstacles = [];
    this.background.reset();
    this.spawnIndex = 0;
    this.flashEffect.reset();
    this.stateMachine.transition(GamePhase.COUNTDOWN);
    this.state.phase = GamePhase.COUNTDOWN;
    this.clock.start();
    this.syncScoreSnapshot();
  }

  restart(): void {
    this.start(this.lastSeed, this.lastHalfDurationMs);
  }

  /**
   * Kullanıcı input geldiğinde çağrılır.
   * type: 'tap' → normal zıplama, 'hold_start' → güçlü zıplama
   * pressStartMs: performance.now() ile ölçülen basış başlangıcı (palindrome timestamp'i için).
   */
  onInput(type: InputType, pressStartMs: number = performance.now()): void {
    const phase = this.state.phase;

    if (phase === GamePhase.FIRST_HALF) {
      // Timestamp: basışın başladığı andaki clock değeri
      const releaseElapsed = this.clock.elapsed();
      const holdDuration =
        type === 'hold_start' ? performance.now() - pressStartMs : 0;
      const timestamp = Math.max(0, releaseElapsed - holdDuration);
      this.recorder.recordWithTimestamp(type, timestamp);
      this.player.jump(type);
      return;
    }

    if (phase === GamePhase.SECOND_HALF) {
      const releaseElapsed = this.clock.elapsed();
      const holdDuration =
        type === 'hold_start' ? performance.now() - pressStartMs : 0;
      const timestamp = Math.max(0, releaseElapsed - holdDuration);
      this.recorder.recordWithTimestamp(type, timestamp);
      this.player.jump(type);
      const events = this.recorder.getEvents();
      const last = events[events.length - 1];
      if (!this.validator || !last) return;
      const result = this.validator.validate(last);
      this.scoreSystem.applyMatch(result.quality);
      const enriched: InputEvent = {
        id: last.id,
        timestamp: last.timestamp,
        type: last.type,
        matchQuality: result.quality,
        deltaMs: result.deltaMs,
      };
      this.state.secondHalfInputs.push(enriched);
      if (this.onMatch) this.onMatch(result.quality);
      this.syncScoreSnapshot();
    }
  }

  /** Geriye dönük uyumluluk için kısa alias */
  onTap(): void {
    this.onInput('tap', performance.now());
  }

  update(dtMs: number = DEFAULT_DT_MS): void {
    const elapsed = this.clock.elapsed();
    this.state.elapsedMs = elapsed;
    const phase = this.state.phase;

    this.background.update(dtMs, SCROLL_SPEED_PX_PER_MS);
    this.player.update(dtMs);
    this.flashEffect.update(dtMs);

    if (phase === GamePhase.FIRST_HALF || phase === GamePhase.SECOND_HALF) {
      this.spawnDueObstacles(elapsed);
      this.updateObstacles(dtMs);
      this.checkCollisions();
    }

    if (phase === GamePhase.COUNTDOWN) {
      if (elapsed >= COUNTDOWN_MS) this.enterFirstHalf();
    } else if (phase === GamePhase.FIRST_HALF) {
      if (this.state.lives <= 0) this.enterResult();
      else if (elapsed >= this.state.level.halfDurationMs) this.enterRewind();
    } else if (phase === GamePhase.REWIND) {
      if (elapsed >= REWIND_MS) this.enterSecondHalf();
    } else if (phase === GamePhase.SECOND_HALF) {
      if (this.state.lives <= 0) this.enterResult();
      else if (elapsed >= this.state.level.halfDurationMs) this.enterResult();
    }

    this.syncScoreSnapshot();
  }

  getState(): Readonly<RoundState> {
    return this.state;
  }

  getPlayer(): Player {
    return this.player;
  }

  getObstacles(): Obstacle[] {
    return this.obstacles;
  }

  getBackground(): Background {
    return this.background;
  }

  getFlashEffect(): FlashEffect {
    return this.flashEffect;
  }

  getExpectedMirrors(): ReadonlyArray<{
    id: string;
    mirrorTime: number;
    type: InputType;
    used: boolean;
  }> {
    if (!this.validator) return [];
    return this.validator.getExpectedMirrors().map((m) => ({
      id: m.id,
      mirrorTime: m.mirrorTime,
      type: m.type,
      used: m.used,
    }));
  }

  private spawnDueObstacles(elapsed: number): void {
    const level = this.state.level;
    while (this.spawnIndex < level.obstacles.length) {
      const data = level.obstacles[this.spawnIndex];
      if (data.spawnTime > elapsed) break;
      this.obstacles.push(new Obstacle(data));
      this.spawnIndex += 1;
    }
  }

  private updateObstacles(dtMs: number): void {
    for (const o of this.obstacles) {
      const wasAlive = o.alive;
      o.update(dtMs, SCROLL_SPEED_PX_PER_MS);
      // Engeli atlatıldıysa (çarpmadan geçtiyse) bonus puan
      if (wasAlive && !o.alive && !o.collided) {
        this.scoreSystem.addObstacleBonus();
      }
    }
    this.obstacles = this.obstacles.filter((o) => o.alive);
  }

  private checkCollisions(): void {
    for (const o of this.obstacles) {
      if (!o.collided && o.collidesWith(this.player)) {
        o.collided = true;
        this.scoreSystem.applyMatch('miss');
      }
    }
  }

  private enterFirstHalf(): void {
    this.stateMachine.transition(GamePhase.FIRST_HALF);
    this.state.phase = GamePhase.FIRST_HALF;
    this.clock.reset();
    this.clock.start();
    this.recorder.start();
    this.obstacles = [];
    this.spawnIndex = 0;
    this.state.elapsedMs = 0;
  }

  private enterRewind(): void {
    this.stateMachine.transition(GamePhase.REWIND);
    this.state.phase = GamePhase.REWIND;
    this.state.firstHalfInputs = this.recorder.stop();
    this.clock.reset();
    this.clock.start();
    this.obstacles = [];
    this.flashEffect.trigger();
    this.state.elapsedMs = 0;
  }

  private enterSecondHalf(): void {
    this.stateMachine.transition(GamePhase.SECOND_HALF);
    this.state.phase = GamePhase.SECOND_HALF;
    this.validator = new PalindromeValidator(
      this.state.firstHalfInputs,
      this.state.level.halfDurationMs,
      this.activeTolerance
    );
    this.clock.reset();
    this.clock.start();
    this.recorder.start();
    this.obstacles = [];
    this.spawnIndex = 0;
    this.state.elapsedMs = 0;
  }

  private enterResult(): void {
    this.stateMachine.transition(GamePhase.RESULT);
    this.state.phase = GamePhase.RESULT;
    this.recorder.stop();
    if (this.validator) {
      const unmatched = this.validator.getUnmatchedMirrors();
      if (unmatched > 0) {
        this.scoreSystem.applyUnmatchedPenalty(unmatched);
      }
    }
    this.clock.pause();
  }

  private buildInitialState(seed: number, halfDurationMs: number): RoundState {
    return {
      phase: GamePhase.IDLE,
      level: generateLevel(seed, halfDurationMs, {
        minGapMs: this.activeMinGapMs,
        maxGapMs: this.activeMaxGapMs,
      }),
      firstHalfInputs: [],
      secondHalfInputs: [],
      score: 0,
      combo: 0,
      lives: 3,
      elapsedMs: 0,
      hintEnabled: this.activeHintEnabled,
    };
  }

  private syncScoreSnapshot(): void {
    const snap = this.scoreSystem.getSnapshot();
    this.state.score = snap.score;
    this.state.combo = snap.combo;
    this.state.lives = snap.lives;
  }
}
