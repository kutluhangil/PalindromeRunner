// Saf state; rendering rendering/FlashEffect.ts içinde.
export const FLASH_DURATION_MS = 800;

export class FlashEffect {
  private elapsedMs = 0;
  private triggered = false;

  trigger(): void {
    this.elapsedMs = 0;
    this.triggered = true;
  }

  update(dtMs: number): void {
    if (!this.triggered) return;
    this.elapsedMs += dtMs;
    if (this.elapsedMs > FLASH_DURATION_MS) {
      this.elapsedMs = FLASH_DURATION_MS;
    }
  }

  isDone(): boolean {
    return this.triggered && this.elapsedMs >= FLASH_DURATION_MS;
  }

  isActive(): boolean {
    return this.triggered && !this.isDone();
  }

  getProgress(): number {
    return this.elapsedMs / FLASH_DURATION_MS;
  }

  reset(): void {
    this.elapsedMs = 0;
    this.triggered = false;
  }
}
