# CLAUDE.md — Palindrome Runner Proje Bağlamı

Bu dosya Claude Code için kalıcı mimari bağlamdır. Her oturumda okunmalıdır.

---

## Oyun Konsepti

Runner tipi bir oyun: ilk yarıda koş ve tıkla (veya uzun bas), ikinci yarıda aynı hareketlerin **zaman aynasını** yap. Başarı = kendi input dizini palindroma çevirmek.

**Temel formül:** `mirrorTime(t, T) = T - t`

---

## Mimari Kural: Katman Ayrımı

### Katmanlar (bağımlılık yönü: yukarıdan aşağıya)

```
main.ts                      ← entry point, DOM bağlantısı
  ├── core/GameEngine         ← oyun mantığı, faz yönetimi
  │     ├── gameplay/*        ← palindrome, skor, input kayıt
  │     ├── entities/*        ← player, obstacle, background
  │     └── utils/*           ← sabitler, matematik, RNG
  ├── rendering/Renderer      ← Canvas 2D, saf fonksiyon
  └── ui/*                    ← DOM manipülasyonu, ses
```

**Kritik kurallar:**
- `GameEngine` **DOM'a bağlı değildir** — test edilebilirlik için şart
- `Renderer` yalnızca `CanvasRenderingContext2D` ve saf veri objelerini alır
- `InputManager` → `GameEngine.onInput()` yoluyla iletişim kurar (doğrudan GamePhase erişimi yok)
- `utils/*` hiçbir şeye import bağımlılığı **yoktur**

---

## Tip Sistemi

```ts
// src/types.ts — temel tipler

type InputType = 'tap' | 'hold_start' | 'hold_end'
// tap → kısa basış (<150ms) → normal zıplama
// hold_start → uzun basış (≥150ms) → yüksek zıplama

enum GamePhase { IDLE, COUNTDOWN, FIRST_HALF, REWIND, SECOND_HALF, RESULT }

interface InputEvent { id, timestamp, type, matchQuality?, deltaMs? }
interface RoundState { phase, level, firstHalfInputs, secondHalfInputs, score, combo, lives, elapsedMs, hintEnabled }
```

---

## Faz Akışı

```
start() →
  COUNTDOWN (3000ms)
    → enterFirstHalf()  : clock reset, recorder.start()
  FIRST_HALF (halfDurationMs)
    → enterRewind()     : recorder.stop() → firstHalfInputs, flashEffect.trigger()
  REWIND (800ms)
    → enterSecondHalf() : PalindromeValidator oluştur, recorder.start()
  SECOND_HALF (halfDurationMs)
    → enterResult()     : unmatchedPenalty uygula, clock.pause()
  RESULT → restart() ile döngü
```

---

## Hold Mekaniği

`InputManager`: `pointerdown`/`keydown` zamanını kaydeder → `pointerup`/`keyup`'ta süre ölçer.
- Süre < 150ms → `onInput('tap', pressStartMs)`
- Süre ≥ 150ms → `onInput('hold_start', pressStartMs)`

`GameEngine.onInput()`:
- Timestamp hesabı: `releaseElapsed - holdDuration` (basışın başladığı anı yakalar)
- `Player.jump(type)` çağrılır: `hold_start` → 1.7× hız

`PalindromeValidator`: `type` bazlı eşleştirme (`m.type !== input.type` → skip)

---

## Obstacle Sistemi

| Tip | Yükseklik | Kaçınma | Görsel |
|---|---|---|---|
| `low` | h=30, zemine dayalı | Kısa basış (tap) | Kırmızı |
| `high` | h=30, 80px yukarıda | Basmama (yerde kal) | Sarı |
| `block` | h=90, zemine dayalı | Uzun basış (hold) | Mor |

Engel atlama bonusu: `ScoreSystem.addObstacleBonus()` → +10 puan (çarpmadan geçince)

---

## Test Stratejisi

- `GameEngine` testleri `vi.useFakeTimers({ toFake: ['performance'] })` ile çalışır
- Her modül kendi `__tests__/` klasöründe
- `--passWithNoTests` aktif — yeni modül eklerken test yoksa süreç kırılmaz
- Toplam: 136 test, 16 dosya

**Test edilemeyen ve test gerektirmeyen:**
- `Renderer`, `GhostIndicator`, `FlashEffect` (render) — Canvas mock zor, görsel doğrulama yeterli
- `Sfx` — Web Audio API ortam bağımlı
- `InputManager` — DOM event simülasyonu gerektirir, GameEngine testleri dolaylı kapsar

---

## Sabitler (src/utils/constants.ts)

```ts
CANVAS_W = 800, CANVAS_H = 450
GROUND_Y = 390
PLAYER_W = 34, PLAYER_H = 46, PLAYER_X = 90
GRAVITY_PX_PER_MS2 = 0.0025
JUMP_VY_PX_PER_MS = -1.0  (hold → × 1.7)
SCROLL_SPEED_PX_PER_MS = 0.4
```

---

## Responsive

`scaleStage()` fonksiyonu (main.ts): `#stage` div'ini CSS `transform: scale()` ile küçültür.
Minimum ölçek 1.0 — büyütme yapılmaz.
Canvas boyutu her zaman 800×450 — sadece görsel ölçek değişir.

---

## Sık Yapılan Hatalar

1. `clock.elapsed()` yalnızca `Clock.ts` içinde `performance.now()` kullanır — başka yerde kullanma
2. `PalindromeValidator` saniyedeki birden fazla aynı tipteki mirror'ı ayrı ayrı eşleştirir — `used` Set ile birincisini işaretle
3. `REWIND` fazında obstacle spawn yoktur — `spawnIndex` sıfırlanmaz, çünkü `enterSecondHalf` onu sıfırlar
4. `InputRecorder.stop()` çağrıldıktan sonra `record()` çağrısı sessizce görmezden gelinir
