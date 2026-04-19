<div align="center">

```
██████╗  █████╗ ██╗     ██╗███╗   ██╗██████╗ ██████╗  ██████╗ ███╗   ███╗███████╗
██╔══██╗██╔══██╗██║     ██║████╗  ██║██╔══██╗██╔══██╗██╔═══██╗████╗ ████║██╔════╝
██████╔╝███████║██║     ██║██╔██╗ ██║██║  ██║██████╔╝██║   ██║██╔████╔██║█████╗
██╔═══╝ ██╔══██║██║     ██║██║╚██╗██║██║  ██║██╔══██╗██║   ██║██║╚██╔╝██║██╔══╝
██║     ██║  ██║███████╗██║██║ ╚████║██████╔╝██║  ██║╚██████╔╝██║ ╚═╝ ██║███████╗
╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝

██████╗ ██╗   ██╗███╗   ██╗███╗   ██╗███████╗██████╗
██╔══██╗██║   ██║████╗  ██║████╗  ██║██╔════╝██╔══██╗
██████╔╝██║   ██║██╔██╗ ██║██╔██╗ ██║█████╗  ██████╔╝
██╔══██╗██║   ██║██║╚██╗██║██║╚██╗██║██╔══╝  ██╔══██╗
██║  ██║╚██████╔╝██║ ╚████║██║ ╚████║███████╗██║  ██║
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝
```

<br/>

**Run. Jump. Reverse it.**

*A Road Runner-themed palindrome rhythm game — can you mirror your own moves?*

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-1.6-6e9f18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Tests](https://img.shields.io/badge/Tests-136%20passing-4ade80?style=flat-square&logo=checkmarx&logoColor=white)]()
[![License](https://img.shields.io/badge/License-MIT-f59e0b?style=flat-square)]()
[![Zero Dependencies](https://img.shields.io/badge/Runtime%20Deps-0-e879f9?style=flat-square)]()
[![Live](https://img.shields.io/badge/Play%20Now-GitHub%20Pages-brightgreen?style=flat-square&logo=github)]( https://kutluhangil.github.io/PalindromeRunner/)

<br/>

[▶ Play Now](https://kutluhangil.github.io/PalindromeRunner/) · [🎮 How to Play](#-how-to-play) · [🖼 Visuals](#-visuals) · [🏗 Architecture](#-architecture) · [🗺 Roadmap](#-roadmap)

</div>

---

## 🎯 Concept

Palindrome Runner is a rhythm-reflex game built on top of the classic endless runner formula, layered with a **temporal symmetry puzzle**. Every round is split into two equal halves:

```
◄──────────────────────── ROUND ─────────────────────────►

  FIRST HALF            REWIND             SECOND HALF
  ──────────            ──────             ───────────
  Dodge obstacles  ──►  ⚡ Flash!  ──►   Replicate your moves
  (inputs recorded)     Reset level        in mirror-time
```

The math is simple — mastering it is not:

> **If you jumped at time `t` in the first half,**
> **you must jump at exactly `(T − t)` in the second half.**

---

## 🖼 Visuals

The game features a **hand-drawn Looney Tunes cartoon desert** aesthetic, rendered entirely with the Canvas 2D API — no sprite sheets, no external images:

| Layer | Element | Detail |
|---|---|---|
| 🌤 Sky | Blue gradient | Deep cobalt → sky blue → pale horizon |
| 🏙 Far background | City silhouette | 11 semi-transparent buildings incl. ACME tower, very slow parallax |
| ☁️ Mid-sky | Cartoon clouds | Puffy multi-circle clouds, slow scroll |
| 🏔 Mid-ground | Desert mesas | Red/orange volcanic flat-tops with geological strata, medium parallax |
| 🌵 Foreground | Cacti & rocks | Scrolling desert floor decorations |
| 🛣 Ground | Sandy road | Amber-to-orange gradient + dashed white road markings |
| 🐦 Player | Road Runner | Blue body, orange beak, yellow-ringed eye, mohawk crest, animated running legs + dust puffs |
| 📦 Obstacles | ACME-style | Wooden crate · TNT dynamite (animated spark) · Cartoon boulder |
| 🎯 Count-down | Looney Tunes badge | Yellow ring, color-coded number (3=green / 2=orange / 1=red) |
| ✨ Result screen | "THAT'S ALL FOLKS!" | Warm yellow card, red border, cartoon font |

---

## 🎮 How to Play

### Phase Flow

```
┌─────────────┐   ┌────────────┐   ┌─────────┐   ┌──────────────┐   ┌────────┐
│  COUNTDOWN  │──►│ FIRST HALF │──►│ REWIND  │──►│ SECOND HALF  │──►│ RESULT │
│   3 · 2 · 1 │   │  ~15 sec   │   │  0.8 s  │   │  ~15 sec     │   │        │
└─────────────┘   └────────────┘   └─────────┘   └──────────────┘   └────────┘
```

| Phase | Duration | What happens |
|---|---|---|
| **COUNTDOWN** | 3 s | Watch 3-2-1, read the controls |
| **FIRST HALF** | Level dependent | Dodge obstacles — every input is recorded |
| **REWIND** | 0.8 s | White flash — level resets |
| **SECOND HALF** | Same duration | Replay your inputs in mirror-time |
| **RESULT** | — | Score, combo, stats breakdown |

---

### 🕹️ Controls

The entire game runs on **one action** — but in two intensities:

<table>
<tr>
<td align="center" width="50%">

**🔵 Short Press**
`< 150 ms`

Keyboard: tap `Space` or `Enter`  
Mobile: quick tap

**→ Normal jump**

</td>
<td align="center" width="50%">

**🟣 Long Press**
`≥ 150 ms`

Keyboard: hold `Space` or `Enter`  
Mobile: press and hold

**→ High jump (1.7×)**

</td>
</tr>
</table>

> 💡 **Ghost indicators** (pulsating white circles) appear in the second half to signal when to act and *how high* to jump:
> - **Low circle** → short press incoming
> - **High circle** → long press incoming

---

### 🚧 Obstacle Types

```
  ┌────────────────────────────────────────────────────────┐
  │                                                        │
  │  ████  ←── HIGH (Yellow TNT): Stay on the ground!      │
  │                                                        │
  │                                                        │
  │            ████████  ←── BLOCK (Boulder): Long press   │
  │  ██  ←── LOW (ACME box): Short press                   │
  │________________________________________________________│
                         GROUND
```

| Color | Type | Description | How to dodge |
|---|---|---|---|
| 🟫 Brown | `low` — ACME crate | Ground-level obstacle | **Short press** → normal jump |
| 🔴 Red | `high` — TNT dynamite | Flying aerial obstacle | **Do nothing** — stay on ground |
| ⚫ Gray | `block` — boulder | Tall ground obstacle | **Long press** → high jump |

---

### 📊 Scoring

#### Match Quality

Every action in the second half is compared against its mirror timestamp:

| Quality | Time Delta\* | Points | Combo |
|---|---|---|---|
| ✨ **Perfect** | ≤ 60 ms | +100 × multiplier | +1 combo |
| 👍 **Good** | ≤ 120 ms | +50 × multiplier | Resets |
| 🙂 **Ok** | ≤ 200 ms | +20 × multiplier | Resets |
| ❌ **Miss** | > 200 ms | −30 | Resets, −1 life |

*\*Tolerance windows vary by difficulty.*

#### Combo Multiplier

Chain **Perfect** hits to grow your score multiplier:

```
Combo  0–2  →  ×1      Combo  3–5  →  ×2
Combo  6–9  →  ×3      Combo 10+   →  ×4
```

#### Bonus Points

| Source | Points |
|---|---|
| Passing an obstacle without collision | +10 |
| Unmatched mirror input (2nd half miss) | −50 each |

#### Lives

You start with **3 lives** ❤️❤️❤️. Each miss (collision or skipped mirror) costs one. Lose all three and the round ends early.

---

### 🎯 Difficulty Levels

Select via URL parameter: `?level=3`  
Deterministic seed: `?seed=42&level=4`

| Level | Name | Duration | Ghost Hint | Max Tolerance |
|:---:|---|---|:---:|---|
| 1 | 🟢 Very Easy | 12 s | ✅ | 260 ms |
| 2 | 🔵 Easy *(default)* | 15 s | ✅ | 220 ms |
| 3 | 🟡 Medium | 18 s | ✅ | 200 ms |
| 4 | 🟠 Hard | 22 s | ❌ | 170 ms |
| 5 | 🔴 Expert | 26 s | ❌ | 140 ms |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** (bundled with Node)
- Any modern browser (Chrome, Firefox, Safari, Edge)

### Install & Run

```bash
git clone https://github.com/kutluhangil/PalindromeRunner.git
cd PalindromeRunner
npm install
npm run dev
# ► http://localhost:3000
```

### Commands

```bash
npm test           # Run 136 unit tests (Vitest)
npm run typecheck  # TypeScript type-check only (no emit)
npm run build      # Production bundle → dist/
npm run preview    # Preview production build
```

### Mobile Testing

Test on a real device over the same Wi-Fi network:

```bash
ipconfig getifaddr en0    # Get your Mac's local IP
# Open on phone: http://192.168.x.x:3000
```

---

## 🏗 Architecture

Palindrome Runner has **zero runtime dependencies**. All game logic is pure TypeScript — Vite is build-tooling only.

### Layer Diagram

```
┌──────────────────────────────────────────────────────────┐
│                        main.ts                           │
│              (entry point · DOM bootstrap)               │
└──────────┬──────────────────────┬────────────────────────┘
           │                      │
     ┌─────▼────────┐      ┌──────▼──────────────────────┐
     │  GameEngine  │      │  Renderer                    │
     │  (game loop) │      │  (Canvas 2D · pure render)   │
     └──────┬───────┘      └─────────────────────────────-┘
            │
   ┌────────┼────────────────────────────┐
   │        │                            │
┌──▼──────────────┐  ┌───────────┐  ┌───▼────────┐
│  gameplay/      │  │ entities/ │  │  utils/    │
│  ─────────────  │  │ ───────── │  │  ───────── │
│  Palindrome     │  │ Player    │  │  constants │
│  Validator      │  │ Obstacle  │  │  math      │
│  ScoreSystem    │  │ Background│  │  RNG       │
│  LevelGenerator │  └───────────┘  │  difficulty│
│  InputRecorder  │                 └────────────┘
└─────────────────┘
```

> 🔒 **Critical rule:** `GameEngine` holds zero DOM references — fully testable without a browser.

### Project Structure

```
src/
├── core/
│   ├── GameEngine.ts        ← Game loop, phase transitions, obstacle spawning
│   ├── Clock.ts             ← Pause-aware high-res timer
│   ├── InputManager.ts      ← Pointer/keyboard → tap / hold_start (≥150ms)
│   ├── StateMachine.ts      ← Valid phase transition map
│   └── FlashEffect.ts       ← Rewind flash effect state
│
├── entities/
│   ├── Player.ts            ← Jump physics (tap = normal, hold = 1.7×)
│   ├── Obstacle.ts          ← Movement, bounds, collision
│   └── Background.ts        ← Parallax offset accumulator
│
├── gameplay/
│   ├── PalindromeValidator.ts  ← Mirror-time matching algorithm
│   ├── InputRecorder.ts        ← Phase-scoped input log
│   ├── LevelGenerator.ts       ← Seeded RNG → deterministic obstacles
│   └── ScoreSystem.ts          ← Score · combo · lives logic
│
├── rendering/
│   ├── Renderer.ts          ← Full Looney Tunes canvas scene
│   │                          Sky · city silhouette · clouds · mesas ·
│   │                          cacti · sandy ground · Road Runner ·
│   │                          ACME box · TNT · boulder · countdown
│   ├── GhostIndicator.ts    ← Mirror hint circle (height = input type)
│   └── FlashEffect.ts       ← Rewind white flash renderer
│
├── ui/
│   ├── HUD.ts               ← Score / combo / lives / phase / timebar DOM
│   ├── ResultScreen.ts      ← "THAT'S ALL FOLKS!" result card + stats
│   └── Sfx.ts               ← Web Audio API procedural sound (beep beep!)
│
└── utils/
    ├── constants.ts         ← Canvas, physics, dimension constants
    ├── difficulty.ts        ← 5-level config + URL param parser
    ├── math.ts              ← clamp · lerp · mirrorTime
    └── RNG.ts               ← Mulberry32 seeded PRNG
```

---

## 🔬 Core Algorithm

### Palindrome Validation

Every first-half input generates a `mirrorTime`:

```
mirrorTime(t, T) = T − t

Example (T = 15 000 ms):
  Input at t = 1 500 ms  →  mirror expected at 13 500 ms
  Input at t = 7 200 ms  →  mirror expected at  7 800 ms
  Input at t = 9 000 ms  →  mirror expected at  6 000 ms
```

In the second half, each incoming input finds the **closest unmatched mirror of the same type** (`tap` only matches `tap`, `hold_start` only matches `hold_start`):

```typescript
validate(input: InputEvent): ValidationResult {
  const best = mirrors
    .filter(m => !used.has(m.id) && m.type === input.type)
    .minBy(m => Math.abs(m.mirrorTime - input.timestamp));

  const delta = Math.abs(best.mirrorTime - input.timestamp);
  const quality = delta <= 60  ? 'perfect'
                : delta <= 120 ? 'good'
                : delta <= 200 ? 'ok'
                               : 'miss';
  return { quality, deltaMs: delta };
}
```

### Hold Detection

`InputManager` measures press duration with sub-millisecond precision:

```
pointerdown / keydown ───── timer starts
                                 │
              ┌──────────────────▼──────────────────┐
              │          pointerup / keyup            │
              └──────────────────────────────────────┘
                                 │
              ┌──────────────────▼──────────────────┐
              │  duration < 150 ms                   │
              │    → 'tap'        (normal jump)       │
              │  duration ≥ 150 ms                   │
              │    → 'hold_start' (1.7× high jump)   │
              └──────────────────────────────────────┘
```

---

## 🔊 Sound

All sounds are **procedurally generated** with the Web Audio API — no audio files:

| Event | Waveform | Frequency | Style |
|---|---|---|---|
| **Jump (tap/hold)** | Sine × 2 | 960 → 680 Hz × 2 bursts | Road Runner "Meep Meep!" |
| **Perfect match** | Triangle | 880 Hz | Bright, rewarding |
| **Good match** | Triangle | 660 Hz | Positive |
| **Ok match** | Sine | 440 Hz | Neutral |
| **Miss** | Sawtooth | 140 Hz (falling) | Punishing |
| **Rewind** | Square | 260 → 130 Hz | Dramatic drop |

Mute preference is saved to `localStorage` and persists across sessions.

---

## 📱 Mobile & Fullscreen

| Feature | Implementation |
|---|---|
| **Fullscreen scaling** | `scaleStage()` — CSS `transform: scale()` fills the entire viewport; internal resolution stays 800×450 |
| **Touch input** | `PointerEvents API` — automatically handles mouse and touch |
| **Scroll prevention** | `touch-action: none` on body and canvas |
| **iOS Safari** | `100dvh` (dynamic viewport height) handles URL bar |
| **Orientation** | `screen.orientation` change event re-triggers scale calculation |
| **Portrait** | Game scales to fit width; playable but landscape is recommended |

---

## 🗺 Roadmap

| Status | Feature |
|:---:|---|
| ✅ | Core palindrome mechanic |
| ✅ | 3 obstacle types (low · high · block) |
| ✅ | Hold input → high jump (1.7×) |
| ✅ | Ghost indicator (per-input-type height) |
| ✅ | 5 difficulty levels |
| ✅ | Procedural sound (Web Audio API) |
| ✅ | Responsive / mobile fullscreen |
| ✅ | Deterministic level generation (seed) |
| ✅ | Looney Tunes desert + Road Runner visuals |
| ✅ | ACME · TNT · Boulder cartoon obstacles |
| ✅ | "Meep Meep!" jump sound |
| ✅ | GitHub Pages CI/CD deploy |
| 🔄 | `high` obstacle visual warning in advance |
| 🔄 | Hold duration recorded for palindrome matching |
| ○ | In-game difficulty selector |
| ○ | Timestamped high-score leaderboard |
| ○ | PWA manifest — "Add to Home Screen" |
| ○ | Replay system — watch your round back |

<sub>✅ Done · 🔄 In Progress · ○ Planned</sub>

---

## 🛠 Technical Notes

```
Language      TypeScript 5.4  (strict · noImplicitAny · strictNullChecks)
Build tool    Vite 5.2
Tests         Vitest 1.6  —  16 files · 136 tests · 100% passing
Dependencies  Runtime: 0  ·  Dev: 3  (vite, vitest, typescript)
Canvas        2D Context — zero DOM manipulation in render path
Physics       Hand-written (gravity + velocity integration)
RNG           Mulberry32 PRNG — seedable, deterministic
Font          Fredoka One (Google Fonts) — loaded asynchronously
Sound         Web Audio API — zero audio files, all synthesized
```

---

## 📄 Docs

- [`CLAUDE.md`](CLAUDE.md) — Persistent architectural context for Claude Code
- [`BUILD_PROMPTS.md`](BUILD_PROMPTS.md) — Phase-by-phase development history

---

## 📄 License

[MIT](LICENSE) © Kutluhan Gil

---

<div align="center">

*"Every move you make leaves a trace.*  
*Your second chance isn't to erase it — it's to reflect it."*

<br/>

⭐ **Star the repo if you enjoyed it!**

</div>
