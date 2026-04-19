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

**Koş. Atla. Tersine çevir.**

*Hareketlerin palindromdur — ya sen de öyle misin?*

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-1.6-6e9f18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Tests](https://img.shields.io/badge/Tests-136%20passing-4ade80?style=flat-square&logo=checkmarx&logoColor=white)]()
[![License](https://img.shields.io/badge/License-MIT-f59e0b?style=flat-square)]()
[![Zero Dependencies](https://img.shields.io/badge/Runtime%20Deps-0-e879f9?style=flat-square)]()

<br/>

[▶ Oyna](#-hızlı-başlangıç) · [📖 Nasıl Oynanır](#-nasıl-oynanır) · [🏗 Mimari](#-mimari) · [🗺 Yol Haritası](#-yol-haritası)

</div>

---

## 📖 Konsept

**Palindrome Runner**, klasik bir runner oyununun üzerine inşa edilmiş, zamansal simetri temelli bir bulmaca-refleks oyunudur. Her tur iki eşit yarıya bölünür:

```
◄────────────────── TUR ──────────────────►

  İLK YARI          REWIND         İKİNCİ YARI
  ─────────          ──────         ───────────
  Engelleri        ⚡ Flash!        Aynı hareketleri
  atlarsın  ────►  Sıfırlan  ────►  ayna-zamanında
  kaydedilir                        tekrar yaparsın
```

Aradaki matematiksel ilişki basittir ama ustalaşması asla değil:

> **Eğer ilk yarıda `t` zamanında zıpladıysan,**
> **ikinci yarıda tam `(T − t)` anında zıplamalısın.**

`t = 500ms` ise, ikinci yarıdaki beklenen zaman `T − 500ms`'dir.
Ne kadar senkronize olursan o kadar **Perfect** — ne kadar şaşırırsan o kadar **Miss**.

---

## 🎮 Nasıl Oynanır

### Faz Akışı

Her tur şu sırayı izler:

```
┌─────────────┐    ┌────────────┐    ┌─────────┐    ┌──────────────┐    ┌────────┐
│  COUNTDOWN  │───►│ İLK YARI  │───►│  REWIND │───►│ İKİNCİ YARI │───►│ SONUÇ │
│    3 · 2 · 1│    │  15 saniye │    │  0.8 sn │    │  15 saniye   │    │       │
└─────────────┘    └────────────┘    └─────────┘    └──────────────┘    └────────┘
```

| Faz | Süre | Ne yapacaksın |
|---|---|---|
| **HAZIRLAN** | 3 sn | 3-2-1 geri sayımı izle, kontrolleri gör |
| **İLK YARI** | Seviyeye göre | Engellere göre zıpla — hareketlerin kaydedilir |
| **GERİ SAR** | 0.8 sn | Beyaz flaş — level sıfırlanır |
| **İKİNCİ YARI** | Aynı süre | Geçmiş hareketlerini tam zamanında tekrar yap |
| **SONUÇ** | — | Skorun, combo'n ve istatistiklerin |

---

### 🕹️ Kontroller

Oyun sadece **tek bir aksiyona** dayanır — ama iki farklı şekilde:

<table>
<tr>
<td align="center" width="50%">

**🔵 Kısa Basış**
`< 150 ms`

Klavye: `Space` veya `Enter` (hafifçe bas, bırak)
Mobil: Kısa dokun

**→ Normal zıplama**

</td>
<td align="center" width="50%">

**🟣 Uzun Basış**
`≥ 150 ms`

Klavye: `Space` veya `Enter` (basılı tut)
Mobil: Basılı tut

**→ Yüksek zıplama (1.7×)**

</td>
</tr>
</table>

> 💡 **İkinci yarıda ghost indicator (beyaz daire)** seni uyarır:
> - Alçaktaki daire → **kısa bas** zamanı yaklaşıyor
> - Yüksekteki daire → **uzun bas** zamanı yaklaşıyor

---

### 🚧 Engel Türleri

Üç farklı engel tipi, üç farklı tepkiyi zorunlu kılar:

```
  ┌──────────────────────────────────────────────────┐
  │                                                  │
  │  ████  ←── HIGH (Sarı): Yerde kal, atlama!       │
  │                                                  │
  │                                                  │
  │            ████████  ←── BLOCK (Mor): Uzun bas   │
  │  ██  ←── LOW (Kırmızı): Kısa bas                 │
  │__________________________________________________│
                    ZEMIN
```

| Renk | Tür | Tanım | Kaçınma yöntemi |
|---|---|---|---|
| 🔴 Kırmızı | `low` | Zeminde alçak engel | **Kısa bas** → normal zıplama |
| 🟡 Sarı | `high` | Havada yüzen bariyer | **Hiçbir şey yapma** — yerde kal |
| 🟣 Mor | `block` | Zemine yaslanmış uzun blok | **Uzun bas** → yüksek zıplama |

> ⚠️ `high` engellerinde sezgi tersine çalışır: **zıplarsan çarparsın**, yerde kalırsan geçersin.

---

### 📊 Puanlama

#### Eşleşme Kalitesi

Her ikinci yarı tıklaması, ilk yarının mirror'ıyla karşılaştırılır:

| Kalite | Zaman Farkı\* | Puan | Combo |
|---|---|---|---|
| ✨ **Perfect** | ≤ 60 ms | +100 × çarpan | +1 combo |
| 👍 **Good** | ≤ 120 ms | +50 × çarpan | Sıfırlanır |
| 🙂 **Ok** | ≤ 200 ms | +20 × çarpan | Sıfırlanır |
| ❌ **Miss** | > 200 ms | −30 | Sıfırlanır, −1 can |

*\*Toleranslar zorluk seviyesine göre değişir.*

#### Combo Çarpanı

Art arda **Perfect** vurursan çarpan büyür:

```
Combo  0–2  →  ×1      Combo  3–5  →  ×2
Combo  6–9  →  ×3      Combo 10+   →  ×4
```

#### Diğer Puan Kaynakları

| Kaynak | Puan |
|---|---|
| Engeli çarpmadan geçmek | +10 |
| İkinci yarıda eşleşmeyen her mirror | −50 |

#### Can Sistemi

Turda **3 can** ile başlarsın. Her **Miss** (çarpışma veya kaçırılan mirror) 1 can düşürür. Canlar biterse tur biter.

---

### 🎯 Zorluk Seviyeleri

URL parametresiyle seçilir: `http://localhost:3000?level=3`
<br/>Seed ile deterministik level: `?seed=42&level=4`

| Level | İsim | Süre | Hint | Max Tolerans | Engel Sıklığı |
|:---:|---|---|:---:|---|---|
| 1 | 🟢 Çok Kolay | 12 sn | ✅ | 260 ms | Seyrek |
| 2 | 🔵 Kolay *(varsayılan)* | 15 sn | ✅ | 220 ms | Normal |
| 3 | 🟡 Orta | 18 sn | ✅ | 200 ms | Normal |
| 4 | 🟠 Zor | 22 sn | ❌ | 170 ms | Sık |
| 5 | 🔴 Uzman | 26 sn | ❌ | 140 ms | Çok sık |

> **Hint sistemi** (seviye 1–3): İkinci yarıda ghost indicator (beyaz pulsating daire) hangi anda ne yapman gerektiğini gösterir. Seviye 4 ve 5'te bu tamamen devre dışıdır — hafızandan başka kılavuzun yok.

---

## 🚀 Hızlı Başlangıç

### Gereksinimler

- **Node.js** ≥ 18
- **npm** (Node ile birlikte gelir)
- Modern bir tarayıcı (Chrome, Firefox, Safari, Edge)

### Kurulum & Çalıştırma

```bash
# Repoyu klonla
git clone https://github.com/kullanicin/palindrome-runner.git
cd palindrome-runner

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
# ► http://localhost:3000 adresinde açılır
```

### Diğer Komutlar

```bash
npm test           # 136 unit testi çalıştır (Vitest)
npm run typecheck  # TypeScript tip kontrolü (derleme yapmadan)
npm run build      # Üretim build'i (dist/ klasörüne)
npm run preview    # Build sonrası önizleme
```

### Mobil Test

Aynı ağdaki bir telefon veya tabletten oynamak için Mac'inin yerel IP'sini kullan:

```bash
# IP adresini bul
ipconfig getifaddr en0

# Telefon tarayıcısında aç
http://192.168.x.x:3000
```

---

## 🏗 Mimari

Palindrome Runner **sıfır runtime dependency** ile geliştirilmiştir. Tüm oyun mantığı pure TypeScript; Vite sadece build tooling için.

### Katman Diyagramı

```
┌─────────────────────────────────────────────────────────┐
│                        main.ts                          │
│              (entry point · DOM bağlantısı)             │
└──────────┬─────────────────────┬───────────────────────┘
           │                     │
     ┌─────▼──────────┐   ┌──────▼──────────────────────┐
     │  core/GameEngine│   │  rendering/Renderer          │
     │  (oyun motoru)  │   │  (Canvas 2D · pure render)  │
     └──────┬──────────┘   └──────────────────────────────┘
            │
    ┌───────┼───────────────────────────┐
    │       │                           │
┌───▼───────┴───┐  ┌───────────────┐  ┌▼───────────┐
│  gameplay/    │  │  entities/    │  │  utils/    │
│  ─────────── │  │  ─────────── │  │  ───────── │
│  Palindrome  │  │  Player       │  │  constants │
│  Validator   │  │  Obstacle     │  │  math      │
│  ScoreSystem │  │  Background   │  │  RNG       │
│  LevelGen    │  └───────────────┘  │  difficulty│
│  InputRec.   │                     └────────────┘
└───────────────┘
```

> 🔒 **Kritik Kural:** `GameEngine` hiçbir DOM referansı içermez. Bu sayede browser olmadan da tamamen test edilebilir.

### Proje Yapısı

```
palindrome-runner/
│
├── src/
│   ├── core/
│   │   ├── GameEngine.ts        ← Ana oyun döngüsü ve faz geçişleri
│   │   ├── Clock.ts             ← Pause-aware kronometre
│   │   ├── InputManager.ts      ← Pointer/klavye → tap / hold_start
│   │   ├── StateMachine.ts      ← Geçerli faz geçiş kuralları
│   │   ├── FlashEffect.ts       ← Rewind flaş state'i
│   │   └── __tests__/
│   │
│   ├── entities/
│   │   ├── Player.ts            ← Zıplama fiziği (tap vs hold)
│   │   ├── Obstacle.ts          ← Hareket, bounds, çarpışma
│   │   ├── Background.ts        ← Parallax offset takibi
│   │   └── __tests__/
│   │
│   ├── gameplay/
│   │   ├── PalindromeValidator.ts   ← Mirror-time eşleştirme algoritması
│   │   ├── InputRecorder.ts         ← Faz bazlı input kayıt/oynat
│   │   ├── LevelGenerator.ts        ← Seeded RNG ile deterministik level
│   │   ├── ScoreSystem.ts           ← Puan · combo · can mantığı
│   │   └── __tests__/
│   │
│   ├── rendering/
│   │   ├── Renderer.ts          ← Tüm canvas çizim koordinasyonu
│   │   ├── GhostIndicator.ts    ← Mirror hint dairesi (lane'e göre)
│   │   ├── FlashEffect.ts       ← Flaş render fonksiyonu
│   │   └── __tests__/ (entegre)
│   │
│   ├── ui/
│   │   ├── HUD.ts               ← Skor/combo/faz/timebar DOM
│   │   ├── ResultScreen.ts      ← Sonuç kartı render + stats
│   │   └── Sfx.ts               ← Web Audio API procedural ses
│   │
│   ├── utils/
│   │   ├── constants.ts         ← Canvas, fizik, boyut sabitleri
│   │   ├── difficulty.ts        ← 5 zorluk konfigürasyonu + URL parser
│   │   ├── math.ts              ← clamp · lerp · mirrorTime
│   │   ├── RNG.ts               ← Mulberry32 PRNG
│   │   └── __tests__/
│   │
│   ├── types.ts                 ← Tüm shared tipler
│   └── main.ts                  ← Bootstrap & oyun döngüsü
│
├── styles/
│   └── main.css
│
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── CLAUDE.md                    ← Claude Code için mimari bağlam
└── BUILD_PROMPTS.md             ← Geliştirme fazları geçmişi
```

---

## 🔬 Temel Algoritma

### Palindrome Doğrulama

İlk yarıda her input kaydedilirken `mirrorTime` hesaplanır:

```
mirrorTime(t, T) = T − t

Örnek (T = 15000ms):
  t = 1500ms → mirror bekleniyor: 13500ms
  t = 7200ms → mirror bekleniyor: 7800ms
  t = 9000ms → mirror bekleniyor: 6000ms
```

İkinci yarıda her input geldiğinde, `PalindromeValidator` eşleşmemiş mirror'lar arasında en yakın olanı bulur (tip bazlı — `tap` sadece `tap` ile eşleşir, `hold_start` sadece `hold_start` ile).

```typescript
// Basitleştirilmiş validator mantığı
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

### Hold Tespiti

`InputManager` basış süresini pikosaniye hassasiyetiyle ölçer:

```
pointerdown / keydown ─── süre ölçümü başlar
                              │
              ┌───────────────▼───────────────┐
              │         pointerup / keyup       │
              └───────────────────────────────┘
                              │
              ┌───────────────▼───────────────┐
              │ süre < 150ms ?                 │
              │   → 'tap'      (normal zıp)    │
              │ süre ≥ 150ms ?                 │
              │   → 'hold_start' (yüksek zıp)  │
              └───────────────────────────────┘
```

---

## 🔊 Ses Sistemi

Oyun, hiçbir ses dosyası kullanmaz. Tüm ses efektleri **Web Audio API** ile anlık üretilir:

| Durum | Dalga | Frekans | Efekt |
|---|---|---|---|
| Tap | Sinüs | 520 Hz | Kısa, nötr |
| Perfect | Üçgen | 880 Hz | Parlak, tatmin edici |
| Good | Üçgen | 660 Hz | Orta, olumlu |
| Ok | Sinüs | 440 Hz | Sakin |
| Miss | Testere | 140 Hz | Alçalan, olumsuz |
| Rewind | Kare | 260→130 Hz | Dramatik düşüş |

Ses 🔇 simgesiyle `localStorage`'a kaydedilen mute tercihi ile kalıcı olarak kapatılabilir.

---

## 📱 Mobil Destek

Oyun tüm ekran boyutlarında çalışır:

- **Responsive scaling:** `scaleStage()` fonksiyonu 800×450 canvas'ı küçük ekranlara `CSS transform: scale()` ile uyarlar — canvas çözünürlüğü değişmez, sadece görsel ölçek küçülür.
- **Touch desteği:** `PointerEvents API` hem mouse hem touch'ı otomatik yakalar.
- **Sayfa kaydırma engeli:** `touch-action: none` ile yanlışlıkla scroll önlenir.
- **iOS Safari uyumu:** `100dvh` (dynamic viewport height) ile URL bar boşluklarına karşı koruma.

---

## 🗺 Yol Haritası

| Durum | Özellik |
|:---:|---|
| ✅ | Temel palindrome mekaniği |
| ✅ | 3 engel tipi (low / high / block) |
| ✅ | Hold aksiyonu (yüksek zıplama) |
| ✅ | Ghost indicator (mirror hint) |
| ✅ | 5 zorluk seviyesi |
| ✅ | Procedural ses (Web Audio API) |
| ✅ | Responsive / mobil destek |
| ✅ | Deterministik level (seed sistemi) |
| 🔄 | `high` engeli için görsel uyarı |
| 🔄 | Hold süresi palindrome kaydı (`hold_end` tracking) |
| ○ | Zorluk seçim menüsü (in-game) |
| ○ | High score listesi (tarihe göre, localStorage) |
| ○ | PWA manifest — mobilde "Ana ekrana ekle" |
| ○ | Replay sistemi — turu tekrar izle |

<sub>✅ Tamamlandı · 🔄 Devam ediyor · ○ Planlandı</sub>

---

## 🛠 Teknik Bilgiler

```
Dil          TypeScript 5.4 (strict mod, noImplicitAny, strictNullChecks)
Build        Vite 5.2
Test         Vitest 1.6 — 16 dosya, 136 test, %100 pass
Bağımlılık   Runtime: 0 · DevDependencies: 3 (vite, vitest, typescript)
Canvas       2D Context — tüm render pure canvas, sıfır DOM manipülasyon
Fizik        El yazısı (gravity + velocity), harici kütüphane yok
RNG          Mulberry32 PRNG — deterministik, seed bazlı
```

---

## 📄 Lisans

[MIT](LICENSE) © Kutluhan Gil

---

<div align="center">

*"Her harekette bir iz bırakırsın. İkinci şansın, o izi silmek değil — yansıtmak."*

<br/>

⭐ Beğendiysen bir yıldız bırak!

</div>
