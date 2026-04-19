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

  /** Geriye dönük uyumluluk: timestamp olarak anın clock değerini kullanır */
  record(type: InputType, timestamp: number): void {
    this.recordWithTimestamp(type, timestamp);
  }

  /**
   * Timestamp'i açıkça belirterek input kaydeder.
   * Hold aksiyonlarında basışın başladığı anı geçirmek daha doğru palindrome eşleşmesi sağlar.
   */
  recordWithTimestamp(type: InputType, timestamp: number): void {
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
