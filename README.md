# Palindrome Runner

> **Koş, tıkla — sonra aynını tersine yap.**

Palindrome Runner bir ritim-refleks oyunudur. **İlk yarıda** engellere göre atlarsın; **ikinci yarıda** aynı hareketleri ayna-simetrisi içinde tekrarlamak zorundasın. Ne kadar senkronize olursan o kadar yüksek puan alırsın.

---

## Oynanış

### Kontroller

| Aksiyon | PC | Mobil |
|---|---|---|
| **Normal zıplama** (low engeli aşmak) | `Space` / `Enter` / tıkla (kısa) | Kısa dokunuş |
| **Yüksek zıplama** (block engeli aşmak) | Uzun bas (≥ 150 ms) | Uzun basılı tut |
| **High engeli** (havadaki bariyer) | Hiçbir şey yapma — yerde kal | Dokunma |

### Engel Türleri

| Renk | Tür | Kaçınma yöntemi |
|---|---|---|
| 🔴 Kırmızı | `low` — yerde alçak engel | Kısa bas → normal zıplama |
| 🟡 Sarı | `high` — havada yüzen bariyer | Basmadan geç (yerde kal) |
| 🟣 Mor | `block` — uzun yüksek blok | Uzun bas → yüksek zıplama |

### Faz Sırası

```
COUNTDOWN (3s) → FIRST_HALF → REWIND (0.8s) → SECOND_HALF → RESULT
```

1. **COUNTDOWN**: 3-2-1 geri sayım. Kontroller ekranda görünür.
2. **İLK YARI**: Engellere göre zıpla, inputların kaydedilir.
3. **GERİ SAR**: Ekran flaş efekti görür, seviye sıfırlanır.
4. **İKİNCİ YARI**: Aynı hareketleri ayna-zamanında tekrarla. Beyaz daireler (ghost indicator) seni uyarır.
5. **SONUÇ**: Puan, combo, perfect/good/ok/miss dağılımı gösterilir.

### Puanlama

| Eşleşme | Puan | Koşul |
|---|---|---|
| Perfect | +100 × combo çarpanı | ≤ 60 ms fark (seviyeye göre değişir) |
| Good | +50 | ≤ 120 ms |
| Ok | +20 | ≤ 200 ms |
| Miss | −30 + 1 can | Pencere dışı veya hiç basılmaz |
| Engel atlama | +10 | Çarpmadan geçilen her engel |
| Eşleşmeyen mirror | −50 her biri | İkinci yarıda kaçırılan tap'lar |

**Combo çarpanı**: 3+ perfect → ×2 · 6+ → ×3 · 10+ → ×4

### Zorluk Seviyeleri

URL parametresiyle seçilir: `?level=3`

| Seviye | Etiket | Hint | Tolerans (ok) |
|---|---|---|---|
| 1 | Çok Kolay | ✅ | 260 ms |
| 2 | Kolay (varsayılan) | ✅ | 220 ms |
| 3 | Orta | ✅ | 200 ms |
| 4 | Zor | ❌ | 170 ms |
| 5 | Uzman | ❌ | 140 ms |

Seed ile deterministik level üretimi: `?seed=42&level=3`

---

## Çalıştırma

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # TypeScript kontrolü + Vite build
npm run preview    # Build önizleme
npm test           # Vitest (136 test)
npm run typecheck  # Sadece tsc --noEmit
```

---

## Proje Yapısı

```
src/
├── core/
│   ├── GameEngine.ts       # Ana oyun döngüsü ve faz yönetimi
│   ├── Clock.ts            # Pause-aware kronometre
│   ├── InputManager.ts     # Pointer/klavye → tap/hold_start ayrımı
│   ├── StateMachine.ts     # Geçerli faz geçişleri
│   └── FlashEffect.ts      # Rewind flaş efekti state'i
├── entities/
│   ├── Player.ts           # Zıplama fiziği (tap vs hold_start)
│   ├── Obstacle.ts         # Engel hareketi + çarpışma
│   └── Background.ts       # Parallax offset takibi
├── gameplay/
│   ├── PalindromeValidator.ts  # Mirror-time eşleştirme algoritması
│   ├── InputRecorder.ts        # Faz bazlı input kaydı
│   ├── LevelGenerator.ts       # Seeded RNG ile deterministik level
│   └── ScoreSystem.ts          # Puan + combo + can mantığı
├── rendering/
│   ├── Renderer.ts         # Canvas 2D render + geri sayım UI
│   ├── GhostIndicator.ts   # Mirror hint dairesi (lane'e göre yükseklik)
│   └── FlashEffect.ts      # Flaş render fonksiyonu
├── ui/
│   ├── HUD.ts              # Skor/combo/faz/timebar DOM güncelleme
│   ├── ResultScreen.ts     # Sonuç kartı
│   └── Sfx.ts              # Web Audio API ses efektleri
└── utils/
    ├── constants.ts        # Canvas, engel, oyuncu sabitleri
    ├── difficulty.ts       # Zorluk seviyeleri + URL param parser
    ├── math.ts             # clamp, lerp, mirrorTime
    └── RNG.ts              # Mulberry32 seeded PRNG
```

---

## Teknik Notlar

- **Sıfır runtime dependency** — sadece TypeScript + Vite + Vitest
- **Palindrome algoritması**: `mirrorTime(t, T) = T - t` — ilk yarıdaki t zamanındaki basış, ikinci yarıda `(T - t)` anında beklenir
- **Hold mekaniği**: InputManager basış süresini ölçer; ≥ 150 ms → `hold_start` (Player 1.7× yüksek zıplar)
- **Deterministik level**: aynı seed her zaman aynı obstacle dizisini üretir (Mulberry32 PRNG)
- **Responsive**: JS tabanlı `scaleStage()` — 800×450 canvas küçük ekranlarda CSS `transform:scale()` ile ölçeklenir

---

## Belgeler

- [`CLAUDE.md`](CLAUDE.md) — Claude Code için kalıcı proje bağlamı ve mimari kurallar
- [`BUILD_PROMPTS.md`](BUILD_PROMPTS.md) — Fazlara ayrılmış geliştirme geçmişi
