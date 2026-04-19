export class Background {
  offset: number = 0;

  update(dt: number, scrollSpeedPxPerMs: number): void {
    this.offset += scrollSpeedPxPerMs * dt;
  }

  reset(): void {
    this.offset = 0;
  }
}
