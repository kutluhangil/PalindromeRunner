# BUILD_PROMPTS.md — Geliştirme Geçmişi

Bu dosya, projenin fazlara ayrılmış geliştirme sürecini belgeler.
Her faz tamamlandıkça güncellenir.

---

## Faz 1 — Temel Altyapı ✅

**Hedef:** Çalışır bir oyun iskeletini ortaya çıkar.

### Yapılanlar
- `types.ts`: `InputType`, `GamePhase`, `InputEvent`, `RoundState`, `LevelData`, `ObstacleData`
- `Clock.ts`: Pause-aware kronometre (`performance.now()` yalnızca burada)
- `StateMachine.ts`: Geçerli faz geçişleri Map'i (`VALID_TRANSITIONS`)
- `InputRecorder.ts`: Start/stop/record döngüsü, `crypto.randomUUID()`
- `ScoreSystem.ts`: perfect/good/ok/miss, combo çarpanı (×1/2/3/4), can sistemi
- `LevelGenerator.ts`: Mulberry32 seeded PRNG ile deterministik obstacle üretimi
- `PalindromeValidator.ts`: `mirrorTime(t, T) = T - t`, tip bazlı eşleştirme, `used` Set
- `GameEngine.ts`: Tüm parçaları birleştiren ana motor

### Test Coverage
- 9 modül, 100+ test, tümü pass

---

## Faz 2 — Render ve UI ✅

**Hedef:** Oyun canvasta görünür hale gelsin.

### Yapılanlar
- `Renderer.ts`: Canvas 2D, gradyan arka plan, parallax çizgiler, obstacle/player çizimi
- `GhostIndicator.ts`: İkinci yarıda mirror zamanlarını gösteren pulsating daire
- `FlashEffect.ts` (core): State tutma — `trigger()`, `update()`, `getProgress()`
- `FlashEffect.ts` (rendering): `sin(progress * π)` alpha ile beyaz flaş
- `HUD.ts`: Skor/combo/faz etiketi/timebar DOM güncelleme
- `ResultScreen.ts`: Sonuç kartı — stats hesaplama ve render
- `Sfx.ts`: Web Audio API, 6 ton (tap/perfect/good/ok/miss/rewind)
- `Player.ts`: Zıplama fiziği, zemin kontrolü
- `Obstacle.ts`: Spawn, hareket, `bounds()`, `collidesWith()`
- `Background.ts`: Offset takibi
- `index.html`, `styles/main.css`: Temel layout
- `main.ts`: Oyun döngüsü, high score, mute, InputManager

---

## Faz 3 — Hold Mekaniği ve Düzeltmeler ✅

**Hedef:** Eksikleri gider, hold aksiyonu ile 3 engel tipini anlamlı kıl.

### Değişiklikler

#### Hold Mekaniği (yeni)
- `InputManager.ts`: `pointerdown`/`keydown` zamanı kaydedilir → `pointerup`/`keyup`'ta süre ölçülür
  - < 150 ms → `'tap'` (normal zıplama)
  - ≥ 150 ms → `'hold_start'` (yüksek zıplama)
  - Callback: `onInput(type, pressStartMs)`
- `Player.ts`: `jump(type)` — `hold_start` → `JUMP_VY × 1.7`
- `GameEngine.ts`: `onInput(type, pressStartMs)` — hold için timestamp düzeltmesi

#### Obstacle Bonus (düzeltme)
- `GameEngine.updateObstacles()`: Çarpmadan geçen engel → `scoreSystem.addObstacleBonus()` (+10)

#### Countdown UI (eksik giderildi)
- `Renderer.drawCountdown()`: Canvas'ta 3-2-1 geri sayım — pulsating sayı + "HAZIRLAN!" metni + kontrol ipucu

#### Parallax Düzeltmesi (artefact giderildi)
- Yatay çizgiler: Y ekseni kayar (önceki: negatif X başlangıcı)
- Dikey çizgiler eklendi: Sola kayan şeritler (hareket hissi)

#### GhostIndicator Lane (düzeltme)
- `MirrorHint` arayüzüne `type: InputType` eklendi
- `GameEngine.getExpectedMirrors()`: `type` alanı artık dahil
- `Renderer`: `laneForType(type)` → tap=0 (alçak), hold_start=2 (yüksek)
- `GhostIndicator`: `LANE_Y` map ile tam yükseklik konumları

#### Responsive / Mobil (yeni)
- `main.ts`: `scaleStage()` — `transform: scale()` ile ölçekleme, `resize` event ile güncelleme
- `styles/main.css`: `touch-action: none`, `overflow: hidden`, `dvh` desteği

#### README ve Belgeler (yeni)
- `README.md`: Oyun mekaniklerini tam anlatan dokümantasyon
- `CLAUDE.md`: Mimari bağlam, kurallar, sık hatalar
- `BUILD_PROMPTS.md`: Bu dosya

---

## Faz 4 — Planlanan (Gelecek)

- [ ] İkinci yarıda `high` engeli ekranı uyarısı (kavramsal olarak yerde kalman gerekiyor ama hint yok)
- [ ] Holds için `hold_end` kaydı ve palindrome eşleştirmesi (şu an hold süresi kayıt altına alınmıyor)
- [ ] Difficulty URL param'ının in-game menüden seçilebilmesi
- [ ] Highscore ekranı (birden fazla skor, tarih damgası)
- [ ] PWA manifest — mobilde "Ana ekrana ekle" desteği
