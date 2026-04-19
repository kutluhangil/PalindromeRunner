import type { MatchQuality } from '../types';

type SfxKind = MatchQuality | 'tap' | 'rewind';

interface ToneConfig {
  freq: number;
  durationMs: number;
  type: OscillatorType;
  gain: number;
}

const TONES: Record<SfxKind, ToneConfig> = {
  tap: { freq: 520, durationMs: 80, type: 'sine', gain: 0.12 },
  perfect: { freq: 880, durationMs: 160, type: 'triangle', gain: 0.18 },
  good: { freq: 660, durationMs: 140, type: 'triangle', gain: 0.14 },
  ok: { freq: 440, durationMs: 120, type: 'sine', gain: 0.12 },
  miss: { freq: 140, durationMs: 180, type: 'sawtooth', gain: 0.16 },
  rewind: { freq: 260, durationMs: 320, type: 'square', gain: 0.1 },
};

export class Sfx {
  private ctx: AudioContext | null = null;
  private muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (this.ctx) return this.ctx;
    const AC =
      typeof window !== 'undefined'
        ? ((window as unknown as { AudioContext?: typeof AudioContext })
            .AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext)
        : undefined;
    if (!AC) return null;
    try {
      this.ctx = new AC();
    } catch {
      this.ctx = null;
    }
    return this.ctx;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  play(kind: SfxKind): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    // Road Runner "meep meep" — tap ve hold_start girişinde çift bip
    if (kind === 'tap') {
      this.playMeepMeep(ctx);
      return;
    }

    const cfg = TONES[kind];
    const now = ctx.currentTime;
    const end = now + cfg.durationMs / 1000;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = cfg.type;
    osc.frequency.setValueAtTime(cfg.freq, now);
    if (kind === 'rewind') {
      osc.frequency.exponentialRampToValueAtTime(cfg.freq * 0.5, end);
    } else if (kind === 'miss') {
      osc.frequency.exponentialRampToValueAtTime(cfg.freq * 0.6, end);
    }
    gain.gain.setValueAtTime(cfg.gain, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(end);
  }

  /**
   * Road Runner "Meep Meep!" — iki hızlı, inen sinüs dalgası.
   * İlk bip: 960 → 700 Hz, İkinci bip: 150ms sonra başlar.
   */
  private playMeepMeep(ctx: AudioContext): void {
    const now = ctx.currentTime;
    for (let i = 0; i < 2; i++) {
      const start = now + i * 0.17; // 170ms arayla iki bip
      const dur = 0.10;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(960, start);
      osc.frequency.exponentialRampToValueAtTime(680, start + dur);
      gain.gain.setValueAtTime(0.20, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.01);
    }
  }
}
