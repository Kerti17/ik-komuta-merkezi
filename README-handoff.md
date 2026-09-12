# İK Komuta Merkezi — Handoff Dökümanı

## Proje Özeti
Mavi yaka/beyaz yaka karışık ekibi olan firmalar için İK karar destek paneli — **sektörden
bağımsız**, üretim, lojistik, perakende, hizmet gibi saha ekibi olan her firmaya satılacak şekilde
konumlandırılmıştır. İlk tasarım referansı Anadolu Tekstil A.Ş. (150 çalışan, 110 beyaz / 40 mavi
yaka) örneği üzerinden yapılmıştır — bu, panelin **bir örnek senaryosudur**, ürünün kapsamını
tekstille sınırlamaz. Her müşteri kendi sektörüne/departman yapısına göre kendi verisini yükler.
Ekteki `ik-komuta-merkezi.jsx` dosyası **çalışan bir tasarım/demo prototipidir** — tüm veriler
hard-coded demo verisidir, gerçek bir backend'e veya veritabanına bağlı değildir.

Hedef: Bu prototipi gerçek veriyle çalışan, sektörden bağımsız bir üretim uygulamasına dönüştürmek.

**Önemli — sektör-spesifik dilin genellenmesi gereken yerler:**
- Demo'daki departman isimleri (Dokuma, Konfeksiyon, Boya-Apre) tekstile özgüdür — gerçek ürün
  kod tabanında departman isimleri **serbest metin alanı** olmalı, sabit bir liste değil.
- "Makine/Bant Yetkinlik Matrisi" modülündeki örnekler (Jakarlı Dokuma, Boya Kazanı) tekstil
  makineleridir — üretim tipine göre modülün başlık/alan isimleri **özelleştirilebilir** olmalı
  (örn. bir lojistik firması için "Forklift/Araç Yetkinliği", bir hizmet firması için
  "Yazılım/Sistem Yetkinliği" gibi).
- "Mavi yaka / beyaz yaka" ayrımı tekstile özgü değildir — Türkiye'de saha/ofis çalışanı ayrımı
  için yaygın kullanılan genel bir terimdir, olduğu gibi kalabilir.

## Önerilen Mimari — Tek Web Uygulaması, İki Bölüm

Ayrı bir "masaüstü uygulaması" değil, **tarayıcıdan açılan tek bir web sitesi**. İki farklı
yetkiye sahip iki sayfa grubu barındırır:

| Bölüm | URL örneği | Kim kullanır | Ne yapar |
|---|---|---|---|
| **Dashboard** | `/panel` (veya ana sayfa) | Genel Müdür / üst yönetim | Sadece görüntüler, veri girişi yok. "Patron Raporu Al" burada |
| **Admin Panel** | `/admin` | İK | Şifre ile korunur. Excel yükleme, tekil veri formları (değerlendirme puanı, arabuluculuk dosyası vb.) |

**Önerilen teknik yığın:**
- **Next.js** — dashboard ve admin panelini tek proje içinde barındırır
- **Veritabanı**: başlangıç için **SQLite** (dosya tabanlı, sunucu kurulumu gerektirmez) yeterli;
  ileride çoklu kullanıcı/uzaktan erişim gerekirse **Supabase** (hazır kimlik doğrulama + ücretsiz katman) düşünülebilir
- **Kimlik doğrulama**: admin bölümü için basit şifre korumalı giriş (NextAuth veya benzeri)
- **Barındırma**: Vercel — sunucu yönetimi gerektirmeden tek tıkla yayına alınır

**Veri giriş yöntemi (karma model):**
- **Toplu/statik veriler → Excel içe aktarma.** Admin panelinde "Excel Yükle" butonu; departman,
  çalışan, devamsızlık, işe giriş tarihi gibi zaten Excel'de tutulan veriler şablon bir dosyadan
  toplu içe aktarılır (İK'nın alışık olduğu format, form doldurmaktan çok daha hızlı).
- **Tekil/güncel olaylar → basit form.** Deneme süresi değerlendirmesi, arabuluculuk dosyası gibi
  ayda birkaç kez oluşan olaylar için admin panelinde küçük formlar kullanılır — bunlar Excel'e
  toplu yüklemek için pratik değildir.

**Günlük akış:** İK ayda birkaç kez `/admin`'e girer, Excel yükler veya form doldurur → veriler
otomatik olarak `/panel`'e yansır → yönetim istediği an dashboard'u açar, elle bir şey
gönderilmesine gerek kalmaz.

## Teknik Yapı (mevcut demo)
- React (tek dosya, fonksiyonel component + hooks)
- Grafikler: `recharts`
- İkonlar: `lucide-react`
- Stil: inline style + birkaç CSS class (Tailwind kullanılmamış)
- Veri: dosya içinde sabit JS array/object'ler (`departmanlar`, `aylikDevir`, `degerlendirmeler`, vb.)

## Modül Listesi ve Durumu

| # | Modül | Gerçek veri ile çalışmaya hazır mı? | Not |
|---|---|---|---|
| 1 | Kadro genel görünüm (150 kişi, yaka dağılımı) | ✅ | Basit toplama/gruplama |
| 2 | Aylık devir hızı trendi | ✅ | İşe giriş-çıkış tarihlerinden hesaplanabilir |
| 3 | Departman bazlı devamsızlık | ✅ | Devamsızlık/izin sisteminden |
| 4 | Ayrılma riski skoru | ⚠️ | Skorlama mantığı (ağırlıklar) netleşmeli — şu an demo sabit skor |
| 5 | Devir maliyeti özeti | ⚠️ | Birim işe alım maliyeti varsayımları gerçek verilerle güncellenmeli |
| 6 | Deneme/6 ay/1 yıl değerlendirme takibi | ✅ | İşe giriş tarihi + kriter puanları (Yetkinlik/Uyum/Performans) |
| 7 | Vardiya & mesai yükü | ✅ | Puantaj/vardiya sisteminden |
| 8 | Kritik rol & yetkinlik matrisi | ⚠️ | Kritik rol tanımı ve yetkinlik verisi manuel girilecek; **alan/başlık isimleri sektöre göre özelleştirilebilir olmalı** (demo'daki tekstil makineleri sadece örnektir) |
| 9 | Çıkış mülakatı kök neden analizi | ⚠️ | Çıkış mülakatı formu kategorik veri üretmeli (şu an serbest metin varsa NLP/kategorize gerekir) |
| 10 | ISG tarama takibi | ✅ | Sağlık takip sisteminden tarih verisi |
| 11 | Pazartesi/Cuma devamsızlık sinyali | ✅ | Devamsızlık kayıtlarından otomatik hesaplanabilir |
| 12 | İK dijital asistanı (chatbot) | ❌ Kavramsal | Gerçek WhatsApp/HRIS entegrasyonu ve backend gerektirir — ayrı proje kapsamı |
| 13 | Arabuluculuk kazanç tablosu | ⚠️ | Hukuk/İK'nın manuel gireceği veri (tahmini dava maliyeti sübjektif) |
| 14 | Zorunlu istihdam (engelli) takibi | ✅ | Kadro sayısı + engelli çalışan sayısından otomatik |
| 15 | "Patron Raporu" (PDF/yönetici özeti) | ⚠️ | Şu an `window.print()` ile tarayıcı üzerinden PDF alınıyor; gerçek PDF üretimi için sunucu taraflı bir çözüm (örn. Puppeteer/wkhtmltopdf) veya `jsPDF` gibi bir kütüphane eklenmeli |
| 16 | SGK teşvik hatırlatıcısı | ⚠️ | Uygunluk mantığı statik/demo; gerçek uygunluk kontrolü mevzuat kurallarının kodlanmasını gerektirir |
| 17 | Yıllık karşılaştırma & sektör benchmarkı | ⚠️ | Geçmiş yıl verisi sistemde birikince otomatikleşir; sektör ortalaması dış kaynaktan (TÜİK/sektör raporu) güncellenmeli |
| 18 | Zorunlu eğitim takibi (yangın, ilkyardım vb.) | ✅ | ISG modülüyle aynı mantık, eğitim takvimi verisinden |
| 19 | Aylık memnuniyet anketi (nabız anketi) | ⚠️ | Gerçek anket toplama mekanizması (link/form) ayrıca kurulmalı |
| 20 | Rol bazlı görünürlük (Patron / Departman Müdürü) | ⚠️ | Demo'da tek örnek departmanla gösterildi; gerçek kullanıcı-rol-departman eşleştirmesi ve yetkilendirme backend'de kurulmalı |
| 21 | İşten çıkış maliyeti hesaplayıcı | ✅ | Panele **gömülü bir modül** olarak sunulur — ayrı/bağımsız bir araç olarak satılmaz veya lisanslanmaz, tek paketin bir parçasıdır |
| 22 | Otomatik e-posta hatırlatmaları | ❌ Kavramsal | Basit SMTP entegrasyonu gerektirir; şu an sadece ayar arayüzü demo |
| 23 | Audit log (işlem geçmişi) | ✅ | Her admin panel işleminde otomatik satır eklenmesi kolayca kurulabilir |

✅ = veri kaynağı net, doğrudan bağlanabilir
⚠️ = iş kuralı/veri kaynağı netleşmeli
❌ = bu prototipin kapsamı dışında, ayrı entegrasyon gerekir

## Ticari Model — Lisanslı Self-Hosted Ürün

- **Dağıtım şekli**: Ayrı bir masaüstü uygulaması değil, her müşteri şirket için **izole bir kurulum** —
  müşterinin kendi bulut hesabında (veya kurucunun sağladığı izole bir ortamda) tek tek kurulur.
  Veri/sunucuya müşterinin dışında kimse dokunmaz; KVKK veri sorumluluğu tamamen müşteri şirkette kalır.
- **Lisans doğrulama**: Kurulumda bir **lisans kodu** girilir; yazılım açılışta küçük bir lisans
  sunucusuna bağlanıp kodun geçerli ve süresinin dolmadığını **online doğrular**. Süre dolunca
  erişim kapanır — yenileme ile devam eder.
- **Fiyatlandırma**: **Sabit yıllık lisans ücreti: 29.900 TL** — çalışan sayısından/şirket
  büyüklüğünden bağımsız, tek fiyat, **tek paket**. İşten çıkış maliyeti hesaplayıcı dahil tüm
  modüller aynı pakette gelir; ayrıca satılan/lisanslanan bağımsız bir araç yoktur. Sunucu maliyeti
  kurucuya ait değildir (müşteri kendi ortamında barındırır).
- **Destek modeli**: 7/24 canlı destek yok. Kurulum sonrası destek, **uygulama içi mesaj/form**
  üzerinden iletilen taleplerle karşılanır. Günlük kullanım sorunlarının büyük kısmı, aşağıdaki PDF
  dökümanlarla self-servis şekilde çözülmesi hedeflenir.
- **Dökümantasyon (PDF)**: Kod tesliminin yanında üç ayrı PDF hazırlanacak —
  1. **Kurulum Rehberi** (lisans kodu aktivasyonu dahil)
  2. **Kullanım Kılavuzu** (dashboard + admin panel ekranları)
  3. **Excel Şablon Rehberi** (toplu veri yükleme formatı)

## Gerçek Veri Kaynakları (muhtemelen ihtiyaç olacak)
- Bordro/puantaj sistemi (vardiya, mesai, izin, devamsızlık)
- İşe giriş-çıkış kayıtları (özlük sistemi)
- Performans değerlendirme formları (deneme/6 ay/1 yıl)
- Çıkış mülakatı formları
- ISG/periyodik sağlık tarama takvimi
- Hukuk/arabuluculuk dosya kayıtları

## Netleşmesi Gereken İş Kuralları
1. **Ayrılma riski skoru**: hangi sinyaller, hangi ağırlıkla? (devamsızlık artışı, kıdem, fazla mesai, ücret bandı vb.)
2. **Değerlendirme kriterleri**: Yetkinlik/Uyum/Performans eşit ağırlıklı mı, yaka tipine göre farklı mı?
3. **Kritik rol tanımı**: hangi pozisyonlar "kritik" sayılacak, kim karar verecek?
4. **Devir maliyeti varsayımları**: mavi/beyaz yaka birim işe alım maliyeti gerçek rakamlarla güncellenmeli
5. **Kullanıcı rolleri/yetkilendirme**: paneli kimler görecek (Genel Müdür, İK, departman yöneticileri) — veri görünürlüğü rol bazlı farklılaşmalı mı?
6. **Sektör-agnostik alan yapısı**: departman isimleri, kritik rol/makine-yetkinlik alanları gibi tekstile özgü sabit listeler yerine, her müşterinin kendi sektörüne göre doldurabileceği serbest/özelleştirilebilir alanlar olmalı

## Önerilen Yapım Sırası
1. Next.js proje iskeleti + SQLite veritabanı şeması (çalışan, devamsızlık, değerlendirme, vardiya, arabuluculuk tabloları)
2. Admin panel: şifreli giriş + Excel içe aktarma (toplu veriler) + tekil olay formları (değerlendirme, arabuluculuk)
3. Dashboard'u sabit demo veri yerine veritabanından okuyacak şekilde bağlama (✅ işaretli modüller önce)
4. İş kuralı netleşen ⚠️ modüller (risk skoru ağırlıkları, kritik rol tanımı vb.)
5. PDF/rapor motorunun gerçek backend çözümüne taşınması
6. Lisans kodu + online doğrulama sistemi (aktivasyon, süre kontrolü, yenileme)
7. Her müşteri için izole kurulum süreci netleştirme (kurucunun elle mi kuracağı, script ile mi)
8. Kurulum/Kullanım/Excel Şablon PDF dökümanlarının hazırlanması
9. Vercel'e (veya müşteri ortamına) yayınlama
10. Chatbot/self-servis modülü — ayrı proje olarak ele alınmalı, bu kapsamın dışında

## Dosyalar
- `ik-komuta-merkezi.jsx` — tasarım prototipi (tüm veriler demo, dashboard bölümünün görsel referansı; işten çıkış maliyeti hesaplayıcısı da panelin bir modülü olarak burada yer almalı)
- `tanitim-sayfasi.html` — ürün tanıtım/satış sayfası (maliyet hesaplayıcının bir demo bölümü olarak gömülü versiyonunu içerir, ayrı satılan bir araç değildir)
