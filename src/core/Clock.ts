// Pause-aware clock. performance.now() bu proje içinde yalnızca burada kullanılır.
export class Clock {
  private startedAtMs: number | null = null;
  private accumulatedMs = 0;
  private running = false;

  start(): void {
    this.accumulatedMs = 0;
    this.startedAtMs = performance.now();
    this.running = true;
  }

  pause(): void {
    if (!this.running || this.startedAtMs === null) return;
    this.accumulatedMs += performance.now() - this.startedAtMs;
    this.startedAtMs = null;
    this.running = false;
  }

  resume(): void {
    if (this.running) return;
    this.startedAtMs = performance.now();
    this.running = true;
  }

  reset(): void {
    this.accumulatedMs = 0;
    this.startedAtMs = null;
    this.running = false;
  }

  elapsed(): number {
    if (this.running && this.startedAtMs !== null) {
      return this.accumulatedMs + (performance.now() - this.startedAtMs);
    }
    return this.accumulatedMs;
  }
}
