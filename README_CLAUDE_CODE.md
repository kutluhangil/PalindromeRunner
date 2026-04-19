# Claude Code ile Palindrome Runner — Kullanım Kılavuzu

Bu rehber, `CLAUDE.md` ve `BUILD_PROMPTS.md` dosyalarını Claude Code ile nasıl kullanacağını anlatır.

## Ön Hazırlık

1. Claude Code yüklü olsun. (`npm install -g @anthropic-ai/claude-code` veya kendi kurulum yöntemin)
2. Boş bir proje klasörü aç:
   ```bash
   mkdir palindrome-runner
   cd palindrome-runner
   git init
   ```
3. `CLAUDE.md` ve `BUILD_PROMPTS.md` dosyalarını bu klasöre kopyala.
4. Claude Code'u başlat:
   ```bash
   claude
   ```

Claude Code klasördeki `CLAUDE.md`'yi otomatik okur. Bu dosya proje boyunca kalıcı bağlam görevi görür — her turda hatırlanır.

## İş Akışı

`BUILD_PROMPTS.md` içindeki her faz, `===` çizgileriyle çevrili bağımsız bir prompttur. Yapman gereken:

### Her Faz İçin

1. `BUILD_PROMPTS.md`'yi aç. O anki fazın blokunu (`===` arası) kopyala.
2. Claude Code'a yapıştır, Enter'a bas.
3. Claude dosyaları oluşturur, testleri çalıştırır, raporlar.
4. Acceptance criteria'yı kontrol et:
   - `npm run typecheck` yeşil mi?
   - `npm test` yeşil mi?
   - İstenen dosyalar var mı?
5. Problem varsa düzeltmesini iste: "X testinde fail var, düzelt".
6. Her şey yolunda ise commit at:
   ```bash
   git add .
   git commit -m "Claude'un önerdiği mesaj"
   ```
7. Bir sonraki fazı yapıştır.

### Fazlar Arası Disiplin

- **Atlama yok.** Faz 1'i bitirmeden Faz 2'yi yapıştırma. Bağımlılıklar birikiyor.
- **Karıştırma yok.** Aynı anda iki fazın promptunu yapıştırma; Claude birini unutabilir.
- **Ad-hoc değişiklik.** Bir faz ortasında aklına başka bir şey gelirse ayrı konuşmada hallet, mevcut fazı bozma.

## Tavsiye Edilen Tur

Tek seferde yapma. İki oturuma böl:

- **Oturum 1**: Faz 0-4 (logic katmanı, görünür çıktı az ama sağlam temel).
- **Oturum 2**: Faz 5-8 (oynanabilir oyun).
- **Opsiyonel Oturum 3**: Faz 9 polish.

Her oturumdan sonra push et, ertesi gün temiz kafayla devam.

## Replit'te Kullanım

Claude Code'u Replit'te koşturmak yerine şunu öneriyorum:

- Local'de Claude Code ile geliştir.
- Her commit sonrası GitHub'a push.
- Replit'te bu GitHub repo'yu açıp `npm install && npm run dev` ile oynat.

Alternatif: Replit'in kendi Agent'ı da var; ama `CLAUDE.md` + `BUILD_PROMPTS.md` yapısı Claude Code'a göre kurgulanmış. Replit Agent'a yapıştırırsan format benzer çalışır ama dosya yönetimi farklı olabilir.

## Sorun Giderme

**Claude bir fazda çok dağılıyor.**
Fazın promptunu tekrar yapıştır, başına "Kapsam dışına çıkma, sadece şu fazı yap." ekle.

**Testler bir faz sonrası kırıldı.**
"Faz N'in mevcut testleri kırdı mı kontrol et, düzelt, ama kapsam ekleme." de.

**Claude kural ihlali yapıyor (örn. `Math.random()`).**
"CLAUDE.md'de `Math.random()` yasak. Bu kullanımı kaldır ve `mulberry32`'ye çevir." de.

**Replit'te çalıştırma farkı.**
`.replit` dosyasını Replit'te elle düzenle. Claude'a dokunmamasını söyledim zaten.

## Dosya Haritası

| Dosya | Kim okur? | Amaç |
|---|---|---|
| `CLAUDE.md` | Claude Code (her turda otomatik) | Kalıcı proje bağlamı, kurallar |
| `BUILD_PROMPTS.md` | Sen | Fazlara ayrılmış iş emri deposu |
| `README_CLAUDE_CODE.md` | Sen | Bu dosya — nasıl kullanılır |
| `README.md` | Herkes (GitHub'da) | Proje açıklaması (Faz 0'da Claude yaratacak) |

## Başlarken

```bash
mkdir palindrome-runner && cd palindrome-runner
git init
cp /path/to/CLAUDE.md .
cp /path/to/BUILD_PROMPTS.md .
claude
```

Claude Code açılınca ilk mesajın:

```
BUILD_PROMPTS.md'deki Faz 0'ı yapıyoruz. Hazır olduğunda haber ver, promptu yapıştırırım.
```

Claude "hazırım" deyince, `BUILD_PROMPTS.md`'den Faz 0 bloğunu (`===` arası) kopyala ve yapıştır.

Başarılar.
