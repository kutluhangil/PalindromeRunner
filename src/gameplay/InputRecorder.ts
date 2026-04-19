import type { InputEvent, InputType } from '../types';

export class InputRecorder {
  private events: InputEvent[] = [];
  private recording = false;

  start(): void {
    this.events = [];
    this.recording = true;
  }

  stop(): InputEvent[] {
    if (!this.recording) return [];
    this.recording = false;
    return this.events.slice();
  }

  record(type: InputType, timestamp: number): void {
    if (!this.recording) return;
    this.events.push({
      id: crypto.randomUUID(),
      timestamp,
      type,
    });
  }

  getEvents(): ReadonlyArray<InputEvent> {
    return this.events;
  }
}
