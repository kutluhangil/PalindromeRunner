import { describe, it, expect } from 'vitest';
import { InputRecorder } from '../InputRecorder';

describe('InputRecorder', () => {
  it('start olmadan record çağrılırsa event eklenmez', () => {
    const r = new InputRecorder();
    r.record('tap', 100);
    expect(r.getEvents().length).toBe(0);
  });

  it('start sonrası record ekler', () => {
    const r = new InputRecorder();
    r.start();
    r.record('tap', 100);
    r.record('tap', 250);
    expect(r.getEvents().length).toBe(2);
    expect(r.getEvents()[0].timestamp).toBe(100);
    expect(r.getEvents()[1].timestamp).toBe(250);
  });

  it('her event benzersiz id alır', () => {
    const r = new InputRecorder();
    r.start();
    r.record('tap', 100);
    r.record('tap', 200);
    const ids = r.getEvents().map((e) => e.id);
    expect(new Set(ids).size).toBe(2);
    expect(typeof ids[0]).toBe('string');
    expect(ids[0].length).toBeGreaterThan(0);
  });

  it('event type doğru aktarılır', () => {
    const r = new InputRecorder();
    r.start();
    r.record('tap', 100);
    r.record('hold_start', 200);
    r.record('hold_end', 300);
    const events = r.getEvents();
    expect(events[0].type).toBe('tap');
    expect(events[1].type).toBe('hold_start');
    expect(events[2].type).toBe('hold_end');
  });

  it('stop kayıt modunu kapatır, sonraki record girmez', () => {
    const r = new InputRecorder();
    r.start();
    r.record('tap', 100);
    const snapshot = r.stop();
    r.record('tap', 200);
    expect(snapshot.length).toBe(1);
    expect(r.getEvents().length).toBe(1);
  });

  it('stop kaydedilmiş olayların kopyasını döner', () => {
    const r = new InputRecorder();
    r.start();
    r.record('tap', 100);
    const snapshot = r.stop();
    expect(snapshot).not.toBe(r.getEvents());
    snapshot.push({ id: 'x', timestamp: 999, type: 'tap' });
    expect(r.getEvents().length).toBe(1);
  });

  it('start iki kez çağrılırsa events temizlenir', () => {
    const r = new InputRecorder();
    r.start();
    r.record('tap', 100);
    r.start();
    expect(r.getEvents().length).toBe(0);
    r.record('tap', 200);
    expect(r.getEvents().length).toBe(1);
  });

  it('stop iki kez çağrılırsa ikincisi boş dizi döner', () => {
    const r = new InputRecorder();
    r.start();
    r.record('tap', 100);
    const first = r.stop();
    const second = r.stop();
    expect(first.length).toBe(1);
    expect(second.length).toBe(0);
  });
});
