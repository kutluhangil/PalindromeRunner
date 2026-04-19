import type { InputType } from '../types';

/** Kısa basmak → tap, bu eşik veya üzeri tutmak → hold_start */
const HOLD_THRESHOLD_MS = 150;

export interface InputManagerOptions {
  target: HTMLElement;
  /** type: kullanıcının aksiyonu; hold için pressStartMs döner */
  onInput: (type: InputType, pressStartMs: number) => void;
}

export class InputManager {
  private pointerDownHandler: (e: PointerEvent) => void;
  private pointerUpHandler: (e: PointerEvent) => void;
  private keyDownHandler: (e: KeyboardEvent) => void;
  private keyUpHandler: (e: KeyboardEvent) => void;
  private attached = false;

  /** performance.now() değeri — pointer bası başlangıcı */
  private ptrStartMs: number | null = null;
  /** performance.now() değeri — klavye bası başlangıcı */
  private keyStartMs: number | null = null;

  constructor(private options: InputManagerOptions) {
    this.pointerDownHandler = (e: PointerEvent) => {
      e.preventDefault();
      if (this.ptrStartMs === null) {
        this.ptrStartMs = performance.now();
      }
    };

    this.pointerUpHandler = (e: PointerEvent) => {
      e.preventDefault();
      if (this.ptrStartMs === null) return;
      const start = this.ptrStartMs;
      const duration = performance.now() - start;
      this.ptrStartMs = null;
      const type: InputType = duration >= HOLD_THRESHOLD_MS ? 'hold_start' : 'tap';
      this.options.onInput(type, start);
    };

    this.keyDownHandler = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.code !== 'Enter') return;
      e.preventDefault();
      // autorepeat'i yok say
      if (e.repeat) return;
      if (this.keyStartMs === null) {
        this.keyStartMs = performance.now();
      }
    };

    this.keyUpHandler = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.code !== 'Enter') return;
      e.preventDefault();
      if (this.keyStartMs === null) return;
      const start = this.keyStartMs;
      const duration = performance.now() - start;
      this.keyStartMs = null;
      const type: InputType = duration >= HOLD_THRESHOLD_MS ? 'hold_start' : 'tap';
      this.options.onInput(type, start);
    };
  }

  attach(): void {
    if (this.attached) return;
    this.options.target.addEventListener('pointerdown', this.pointerDownHandler);
    this.options.target.addEventListener('pointerup', this.pointerUpHandler);
    window.addEventListener('keydown', this.keyDownHandler);
    window.addEventListener('keyup', this.keyUpHandler);
    this.attached = true;
  }

  detach(): void {
    if (!this.attached) return;
    this.options.target.removeEventListener('pointerdown', this.pointerDownHandler);
    this.options.target.removeEventListener('pointerup', this.pointerUpHandler);
    window.removeEventListener('keydown', this.keyDownHandler);
    window.removeEventListener('keyup', this.keyUpHandler);
    this.attached = false;
  }
}
