import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StateMachine } from '../StateMachine';
import { GamePhase } from '../../types';

describe('StateMachine', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('başlangıç durumu IDLE', () => {
    const sm = new StateMachine();
    expect(sm.current()).toBe(GamePhase.IDLE);
  });

  it('tüm geçerli geçişler zinciri çalışır', () => {
    const sm = new StateMachine();
    expect(sm.transition(GamePhase.COUNTDOWN)).toBe(true);
    expect(sm.current()).toBe(GamePhase.COUNTDOWN);
    expect(sm.transition(GamePhase.FIRST_HALF)).toBe(true);
    expect(sm.current()).toBe(GamePhase.FIRST_HALF);
    expect(sm.transition(GamePhase.REWIND)).toBe(true);
    expect(sm.current()).toBe(GamePhase.REWIND);
    expect(sm.transition(GamePhase.SECOND_HALF)).toBe(true);
    expect(sm.current()).toBe(GamePhase.SECOND_HALF);
    expect(sm.transition(GamePhase.RESULT)).toBe(true);
    expect(sm.current()).toBe(GamePhase.RESULT);
    expect(sm.transition(GamePhase.COUNTDOWN)).toBe(true);
    expect(sm.current()).toBe(GamePhase.COUNTDOWN);
  });

  it('geçersiz geçiş false döner, state değişmez, console.warn çağrılır', () => {
    const sm = new StateMachine();
    expect(sm.transition(GamePhase.FIRST_HALF)).toBe(false);
    expect(sm.current()).toBe(GamePhase.IDLE);
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('IDLE → RESULT gibi atlayan geçiş engellenir', () => {
    const sm = new StateMachine();
    expect(sm.transition(GamePhase.RESULT)).toBe(false);
    expect(sm.current()).toBe(GamePhase.IDLE);
  });

  it('RESULT sonrası sadece COUNTDOWN geçerli', () => {
    const sm = new StateMachine();
    sm.transition(GamePhase.COUNTDOWN);
    sm.transition(GamePhase.FIRST_HALF);
    sm.transition(GamePhase.REWIND);
    sm.transition(GamePhase.SECOND_HALF);
    sm.transition(GamePhase.RESULT);
    expect(sm.transition(GamePhase.FIRST_HALF)).toBe(false);
    expect(sm.transition(GamePhase.IDLE)).toBe(false);
    expect(sm.current()).toBe(GamePhase.RESULT);
    expect(sm.transition(GamePhase.COUNTDOWN)).toBe(true);
  });

  it('onTransition callback geçerli geçişte from/to ile çağrılır', () => {
    const sm = new StateMachine();
    const spy = vi.fn();
    sm.onTransition(spy);
    sm.transition(GamePhase.COUNTDOWN);
    expect(spy).toHaveBeenCalledWith(GamePhase.IDLE, GamePhase.COUNTDOWN);
  });

  it('onTransition callback geçersiz geçişte çağrılmaz', () => {
    const sm = new StateMachine();
    const spy = vi.fn();
    sm.onTransition(spy);
    sm.transition(GamePhase.FIRST_HALF); // invalid
    expect(spy).not.toHaveBeenCalled();
  });

  it('birden fazla handler desteklenir', () => {
    const sm = new StateMachine();
    const a = vi.fn();
    const b = vi.fn();
    sm.onTransition(a);
    sm.onTransition(b);
    sm.transition(GamePhase.COUNTDOWN);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });
});
