export interface InputManagerOptions {
  target: HTMLElement;
  onTap: () => void;
}

export class InputManager {
  private pointerHandler: (e: PointerEvent) => void;
  private keyHandler: (e: KeyboardEvent) => void;
  private attached = false;

  constructor(private options: InputManagerOptions) {
    this.pointerHandler = (e: PointerEvent) => {
      e.preventDefault();
      this.options.onTap();
    };
    this.keyHandler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        this.options.onTap();
      }
    };
  }

  attach(): void {
    if (this.attached) return;
    this.options.target.addEventListener('pointerdown', this.pointerHandler);
    window.addEventListener('keydown', this.keyHandler);
    this.attached = true;
  }

  detach(): void {
    if (!this.attached) return;
    this.options.target.removeEventListener('pointerdown', this.pointerHandler);
    window.removeEventListener('keydown', this.keyHandler);
    this.attached = false;
  }
}
