# İK Komuta Merkezi — Kurulum Rehberi

Bu rehber, İK Komuta Merkezi'ni kendi bulut hesabınızda (Vercel + Turso) sıfırdan çalışır hale
getirmeniz için gereken adımları içerir. Tahmini süre: 30-45 dakika, teknik bilgi gerektirmez —
her adımda tıklanacak yerler ve kopyala-yapıştır komutlar belirtilmiştir.

**Önemli**: Bu kurulum sadece **sizin şirketinize** özeldir — kendi veritabanınız, kendi
barındırma hesabınız. Verileriniz sizin dışınızda kimseyle paylaşılmaz.

---

## 1. Supabase hesabı ve veritabanı oluşturma

Supabase, uygulamanın verilerini (çalışan, devamsızlık, değerlendirme vb.) sakladığı ücretsiz
bulut Postgres veritabanı servisidir.

1. [supabase.com](https://supabase.com) adresinden ücretsiz bir hesap açın (GitHub ile giriş
   yapabilirsiniz).
2. **New Project** ile yeni bir proje oluşturun (isim önerisi: şirket adınızın kısaltması, ör.
   `ik-komuta-atas`), bir veritabanı şifresi belirleyin ve bölge seçin (Vercel'e yakın bir bölge
   önerilir).
3. Proje hazır olduktan sonra **Settings → Database → Connection string** sayfasına gidin ve
   **URI** sekmesinden bağlantı dizesini kopyalayın — tercihen **Transaction pooler** (port
   `6543`) seçeneğini kullanın, bu Vercel gibi sunucusuz (serverless) ortamlar için önerilir.
   Kopyaladığınız değerdeki `[YOUR-PASSWORD]` kısmını 2. adımda belirlediğiniz şifreyle
   değiştirin → bu tam değeri `DATABASE_URL` olarak kullanacaksınız.

## 2. Vercel'e deploy

1. [vercel.com](https://vercel.com) adresinden ücretsiz bir hesap açın.
2. Size teslim edilen kod deposunu (Git repository) Vercel'e bağlayın ("Import Project").
3. Vercel projeyi otomatik olarak Next.js olarak tanıyacaktır — ek bir ayara gerek yoktur.
4. **Henüz "Deploy" demeyin** — önce aşağıdaki ortam değişkenlerini (Environment Variables)
   girmeniz gerekiyor (3. adım).

## 3. Ortam değişkenlerini girme

Vercel proje ayarlarında **Settings → Environment Variables** bölümüne gidin ve aşağıdaki
değerleri tek tek girin:

| Değişken | Değer | Zorunlu mu? |
|---|---|---|
| `DATABASE_URL` | 1. adımda aldığınız Supabase Connection string (URI) | Evet |
| `AUTH_SECRET` | Rastgele, uzun bir metin (aşağıda üretme yöntemi var) | Evet |
| `LICENSE_API_URL` | Yazılımı size teslim eden firmadan alacağınız adres | Evet |
| `LICENSE_KEY` | Satın alma sonrası size verilen lisans anahtarı (`IKKM-XXXX-...`) | Evet |
| `RESEND_API_KEY` | Destek formu için — bkz. not aşağıda | Hayır (boşsa destek mesajları çalışmaz, uygulama yine açılır) |
| `SUPPORT_EMAIL_TO` | Destek mesajlarının gideceği e-posta | Hayır |
| `SUPPORT_EMAIL_FROM` | Gönderici adresi (Resend'de doğrulanmış bir alan adı gerekir) | Hayır — boş bırakılabilir |

**`AUTH_SECRET` nasıl üretilir?** Bilgisayarınızda bir terminal açıp şunu çalıştırın:
```
openssl rand -base64 32
```
Çıkan metni olduğu gibi yapıştırın. (Mac/Linux'ta hazır gelir; Windows'ta yoksa
[base64.guru/generate/random/bytes](https://www.base64.guru/generate/random/bytes) gibi bir
araçla 32 baytlık rastgele bir metin üretip kullanabilirsiniz.)

**Destek e-postası (RESEND_API_KEY) opsiyoneldir** — bu alanları boş bırakırsanız Admin Panel
→ Destek sayfasındaki form yine çalışır ama e-posta gönderilmez. Aktif etmek isterseniz
[resend.com](https://resend.com)'da ücretsiz bir hesap açıp API anahtarınızı girin.

Tüm değerleri girdikten sonra **Deploy** butonuna basın.

## 4. Veritabanı tablolarını oluşturma (migration)

Deploy tamamlandıktan sonra veritabanı tablolarının oluşturulması gerekir. Bunu kendi
bilgisayarınızdan, kodun bulunduğu klasörde şu komutlarla yapabilirsiniz:

```
npm install
```

Proje klasöründe bir `.env` dosyası oluşturup (`.env.example` dosyasını kopyalayabilirsiniz)
içine 3. adımda Vercel'e girdiğiniz `DATABASE_URL` değerini yazın, sonra:

```
npm run db:migrate
```

Bu komut bir kere çalıştırılır (kurulum sırasında). İleride yazılım güncellemesi geldiğinde
tekrar çalıştırmanız istenebilir — bu, teslimatı yapan firma tarafından bildirilir.

## 5. İlk yönetici (İK) hesabını oluşturma

Aynı `.env` dosyasına iki satır daha ekleyin (sadece bu komut için geçici olarak):

```
SEED_ADMIN_EMAIL=ik@sirketiniz.com
SEED_ADMIN_PASSWORD=GucluBirSifre123!
```

Sonra:

```
npm run db:seed-admin
```

Bu, `/admin` girişinde kullanacağınız e-posta/şifreyi oluşturur. İşlem bittikten sonra bu iki
satırı `.env` dosyasından silebilirsiniz (güvenlik için).

## 6. İlk giriş ve temel ayarlar

1. Vercel'in verdiği adrese `/admin` ekleyerek girin (ör. `https://sirketiniz.vercel.app/admin`),
   5. adımdaki e-posta/şifre ile giriş yapın.
2. **Ayarlar** sayfasından şirket adınızı, deneme süresi/mesai limiti/izin eşikleri gibi
   parametreleri firmanıza göre düzenleyin.
3. Aynı sayfadan **"Panel Şifresi"** belirleyin — bu, genel müdür/yönetimin `/panel` adresine
   giriş yapacağı paylaşılan şifredir (kişisel hesap değildir).
4. **Departman & Şube** sayfasından şirketinizdeki departman ve şube listesini oluşturun
   (çalışan eklemeden önce bu adım gerekli).
5. **Çalışanlar** sayfasından (veya toplu yükleme için **Excel İçe Aktarma**'dan — bkz.
   *Excel Şablon Rehberi*) çalışan listenizi girin.
6. **(Opsiyonel) Bölüm yöneticisi hesapları** — departman müdürlerinizin kendi ekipleriyle ilgili
   not girebileceği kısıtlı bir ekran istiyorsanız, **Bölüm Yöneticileri** sayfasından hesap
   oluşturun. Bu adım hiç yapılmazsa uygulamanın geri kalanı sorunsuz çalışır — tamamen opsiyoneldir.

Yukarıdaki adımlar dışında panelde **Kritik Rol & Yedekleme**, **SGK Teşvikleri**, **Ayrılma
Riski Skoru ağırlıkları** (Ayarlar içinde) gibi ek yapılandırma ekranları da vardır — bunlar da
opsiyoneldir, boş bırakılırsa ilgili modül "veri yok" gösterir ya da (risk skoru ağırlıkları
gibi) makul varsayılan değerlerle çalışmaya devam eder. Tüm ekranların ayrıntılı açıklaması
için bkz. *Kullanım Kılavuzu*.

## 7. Genel Müdür / yönetim erişimi

Yönetim ekibine `https://sirketiniz.vercel.app/panel` adresini ve 6.3'te belirlediğiniz panel
şifresini iletin. Bu ekran salt-görüntülemedir, veri girişi yapılamaz.

## Sorun Giderme

- **"Lisansınız yapılandırılmamış" ekranı görüyorum**: `LICENSE_KEY` ortam değişkeni
  girilmemiş veya yanlış — 3. adımı kontrol edin.
- **Giriş sayfası hiç açılmıyor / hata veriyor**: `DATABASE_URL` yanlış girilmiş olabilir
  (şifre veya proje adresi hatalı), Vercel'deki değeri Supabase → Settings → Database →
  Connection string ile karşılaştırın.
- **Excel yüklerken "Departman tanımlı değil" hatası**: Departman & Şube sayfasından önce
  ilgili departman/şubeyi eklemeniz gerekir (bkz. Excel Şablon Rehberi).
- Diğer sorunlar için Admin Panel → **Destek** sayfasından mesaj gönderebilirsiniz.
