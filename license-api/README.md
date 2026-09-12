# Lisans Doğrulama Servisi

`claude-code-talimati.md` Bölüm 7'deki "ayrı, küçük bir alt sistem". **Bu klasör, ana İK Komuta
Merkezi uygulamasından (bir üst klasör) tamamen bağımsız, ayrı bir şekilde deploy edilir.**

- Ana uygulama: her **müşterinin kendi** Vercel + Turso hesabında barınır (bkz. üst klasördeki
  README-handoff.md / Kurulum Rehberi).
- Bu servis: **kurucunun kendi** Vercel + Turso hesabında barınır, tüm müşteriler için ortaktır.
  Müşteri verisi (çalışan, departman, maaş vb.) **asla** buraya gelmez — sadece lisans anahtarı,
  hangi müşteriye ait olduğu (kurucunun kendi takibi için) ve geçerlilik tarihi tutulur.

## Kurulum (bir kez, kurucu tarafından)

1. `npm install`
2. Kendi Turso hesabınızda küçük bir veritabanı oluşturun, `.env.example`'ı `.env` olarak
   kopyalayıp `LICENSES_DATABASE_URL` / `LICENSES_AUTH_TOKEN` değerlerini doldurun.
3. `npm run db:generate && npm run db:migrate`
4. Bu klasörü **ayrı bir Vercel projesi** olarak deploy edin (ana uygulamadan farklı proje —
   `vercel --cwd license-api` veya bu klasörü ayrı bir repo'ya taşıyıp Vercel'e bağlayın).
5. Vercel proje ayarlarına `LICENSES_DATABASE_URL` / `LICENSES_AUTH_TOKEN` ortam değişkenlerini
   girin.
6. Deploy sonrası Vercel'in verdiği URL'i not edin (örn. `https://ikkm-lisans.vercel.app`) — her
   müşteri kurulumunun `.env` dosyasına `LICENSE_API_URL` olarak bu URL girilecek.

## Yeni müşteri sattığınızda

```bash
npm run license:create -- "Müşteri A.Ş." 365
```

Üretilen `IKKM-XXXX-XXXX-XXXX-XXXX` anahtarını müşterinin kurulum `.env` dosyasına `LICENSE_KEY`
olarak yazın (Kurulum Rehberi PDF'inin bir adımı).

## Ödeme yenilendiğinde

```bash
npm run license:renew -- IKKM-XXXX-XXXX-XXXX-XXXX 365
```

Müşteri tarafında hiçbir şey değiştirmeye gerek yok — aynı anahtar, bir sonraki periyodik
kontrolde (varsayılan 24 saat, bkz. ana uygulamadaki `lib/license.ts`) yeni tarihi otomatik alır.

## Lisansı iptal etmek gerekirse

Şu an için `npm run db:studio` ile açılan Drizzle Studio üzerinden ilgili satırın `status`
alanını `iptal` yapın (ayrı bir CLI script'i yok — MVP kapsamında bu nadir/manuel bir işlem).

## Uç nokta

`POST /api/verify` — gövde: `{ "licenseKey": "..." }`. Yanıt:
`{ "valid": boolean, "status": "aktif" | "suresi_doldu" | "gecersiz", "expiresAt": "YYYY-MM-DD" | null }`

Ek bir API anahtarı/gizli değer gerekmez — `licenseKey`'in kendisi zaten müşteriye özeldir ve
çağrı sunucu-sunucu yapılır (tarayıcıdan değil).
