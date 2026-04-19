import { GamePhase } from '../types';

export type TransitionHandler = (from: GamePhase, to: GamePhase) => void;

// FIRST_HALF/REWIND → RESULT: game-over (hayat 0) için erken çıkış.
const VALID_TRANSITIONS: ReadonlyMap<GamePhase, readonly GamePhase[]> = new Map([
  [GamePhase.IDLE, [GamePhase.COUNTDOWN]],
  [GamePhase.COUNTDOWN, [GamePhase.FIRST_HALF]],
  [GamePhase.FIRST_HALF, [GamePhase.REWIND, GamePhase.RESULT]],
  [GamePhase.REWIND, [GamePhase.SECOND_HALF, GamePhase.RESULT]],
  [GamePhase.SECOND_HALF, [GamePhase.RESULT]],
  [GamePhase.RESULT, [GamePhase.COUNTDOWN]],
]);

export class StateMachine {
  private state: GamePhase = GamePhase.IDLE;
  private handlers: TransitionHandler[] = [];

  current(): GamePhase {
    return this.state;
  }

  transition(to: GamePhase): boolean {
    const allowed = VALID_TRANSITIONS.get(this.state);
    if (!allowed || !allowed.includes(to)) {
      console.warn(
        `StateMachine: invalid transition ${this.state} -> ${to}`
      );
      return false;
    }
    const from = this.state;
    this.state = to;
    for (const h of this.handlers) h(from, to);
    return true;
  }

  onTransition(cb: TransitionHandler): void {
    this.handlers.push(cb);
  }
}
