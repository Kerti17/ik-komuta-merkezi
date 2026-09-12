# İK Komuta Merkezi — Claude Code Talimatı

Bu doküman, bugüne kadar tasarım/planlama aşamasında alınan **tüm kararları** içerir ve
Claude Code'a doğrudan proje başlatma talimatı olarak verilmek üzere hazırlanmıştır. Ekli
üç referans dosyayla (`ik-komuta-merkezi.jsx`, `tanitim-sayfasi.html`, bu belge) birlikte kullanılmalıdır.

---

## 0. Rolün

Sen bir full-stack developersın. Aşağıdaki ürünü, belirtilen mimari ve iş kısıtlarına harfiyen
uyarak sıfırdan kur. Belirsiz bir nokta varsa varsayım yapıp ilerle, ama varsayımını açıkça belirt.

---

## 1. Ürün Tanımı ve Konumlandırma

**Ne:** Mavi yaka/beyaz yaka karışık ekibi olan firmalar için İK **karar destek paneli**.
Bordro/PDKS/özlük yazılımının (Kolay İK vb.) **yerine değil, üzerine** oturur — mevcut sistem
verideki "ne oldu"yu tutar, bu panel "ne yapmalıyım"a cevap verir.

**Kimin için:** **Sektörden bağımsız.** Üretim, lojistik, perakende, hizmet — saha ekibi olan
her firma hedef kitledir. Tasarım referansı bir tekstil firması (Anadolu Tekstil A.Ş., 150
çalışan) üzerinden yapılmıştır ama bu **sadece bir örnek senaryodur**, ürünün kapsamını
sınırlamaz.

**KRİTİK KURAL — sektör-agnostik veri modeli:**
- Departman isimleri sabit bir liste/enum OLMAMALI, admin panelinden serbestçe eklenebilir olmalı.
- "Kritik Rol & Yetkinlik Matrisi" modülündeki alan/başlık isimleri özelleştirilebilir olmalı
  (tekstil için "Jakarlı Dokuma", lojistik için "Forklift Ehliyeti", hizmet için "Yazılım
  Yetkinliği" gibi — admin bunları kendi tanımlar).
- "Mavi yaka / beyaz yaka" ayrımı olduğu gibi kalabilir — bu Türkiye'de genel kullanılan bir terim,
  tekstile özgü değil.
- Demo/seed veri tekstil örneği olarak kalabilir (referans dosyadaki gibi) ama şema hiçbir yerde
  tekstile hardcode edilmemeli.

---

## 2. Mimari — TEK-KİRACI (single-tenant), Çok-Kiracı DEĞİL

**Bu çok önemli bir karar, atlanmamalı:** Bu bir multi-tenant SaaS (ortak veritabanında birden
çok şirketin verisi, kayıt ol/giriş yap akışı) DEĞİLDİR. Her müşteri şirket için **ayrı, izole bir
kurulum** yapılır — kendi veritabanı, kendi domaini/subdomaini, kendi lisans anahtarı. Kod tabanı
tek bir "şablon" projedir; her müşteri için bu şablondan yeni bir deploy yapılır.

İki bölümlü tek web uygulaması:

| Bölüm | Route | Kullanıcı | İşlev |
|---|---|---|---|
| Dashboard | `/panel` | Genel Müdür / yönetim | Salt görüntüleme, "Patron Raporu Al" burada |
| Admin Panel | `/admin` | İK | Şifreli giriş, Excel içe aktarma, tekil olay formları |

---

## 3. Teknik Yığın

- **Next.js** (App Router) — dashboard + admin panel tek proje
- **Veritabanı — DİKKAT:** Ham dosya tabanlı SQLite, Vercel'in serverless ortamında **kalıcı
  değildir** (her istekte dosya sistemi sıfırlanabilir). Bunun yerine:
  - **Turso (libSQL)** — SQLite ile uyumlu, serverless, cömert ücretsiz katmanı var → **önerilen varsayım**
  - veya **Supabase Postgres** (ücretsiz katman + hazır auth)
  Bu ikisinden birini seç, ham `sqlite3` dosyasıyla Vercel'e deploy etme.
- **Kimlik doğrulama**: `/admin` için basit şifreli giriş (NextAuth credentials provider veya
  benzeri basit bir çözüm yeterli — OAuth gerekmez)
- **Grafikler**: `recharts` (referans dosyadaki gibi)
- **İkonlar**: `lucide-react`
- **Barındırma**: Vercel (her müşteri için ayrı proje/domain)

---

## 4. Veri Modeli (asgari tablolar)

- `employees` — ad, departman (free-text/FK), yaka tipi (mavi/beyaz), şube, işe giriş tarihi,
  maaş bandı, **doğum tarihi, cinsiyet, emekli durumu (evet/hayır)** — son üçü SGK teşvik
  uygunluk hesaplaması için gerekli
- `departments` — serbest, admin tarafından yönetilir
- `branches` — şube/lokasyon listesi (çoklu şube desteği için)
- `attendance` — devamsızlık kayıtları (tarih, çalışan, tür)
- `shifts_overtime` — vardiya, gece vardiyası, hafta sonu mesai, yıllık fazla mesai saati
- `evaluations` — deneme/6 ay/1 yıl değerlendirmeleri; kriter bazlı puanlar (Yetkinlik/Uyum/Performans),
  değerlendirme tarihi, durum (bekliyor/acil/gecikti/devam/sonlandırıldı)
- `critical_roles` — özelleştirilebilir alan adlarıyla kritik rol/yetkinlik matrisi; **yedek
  personel atanmamışsa uyarı durumu (`has_backup: false`) tutulur**
- `exit_interviews` — çıkış mülakatı, kategorize kök neden
- `health_screenings` — ISG tarama takvimi (tür, tarih)
- `mediation_cases` — arabuluculuk dosyaları (ödenen tutar, tahmini dava maliyeti, tarih)
- `disciplinary_records` — tutanak kayıtları (çalışan, tarih, tür: sözlü/yazılı uyarı/devamsızlık
  tutanağı, açıklama) — ayrılma riski analizinde çalışanla ilişkilendirilir
- `recognitions` — ödül/takdir kayıtları (çalışan, ödül adı, tarih) — risk analizinde çapraz
  referans için kullanılır (örn. "ödül almasına rağmen risk taşıyan" içgörüsü)
- `leave_balances` — yıllık izin bakiyesi (hak edilen gün, kullanılan gün, kalan/birikmiş gün);
  eşik değerlere göre (varsayılan: 30+ gün kritik, 15-29 dikkat) otomatik uyarı üretir, tahmini
  mali yükümlülük (kalan gün × günlük ücret) hesaplanır
- `disability_quota` — toplam kadro, mevcut engelli çalışan sayısı (yasal %3 hesaplaması koddan yapılır)
- `sgk_incentive_rules` — **statik değil, İK tarafından yönetilen teşvik kuralları**: teşvik adı,
  açıklama, uygunluk kriterleri (yaş aralığı, cinsiyet, engellilik durumu, bölge — serbest/opsiyonel
  alanlar), tahmini tutar/oran, aktif/pasif durumu; `employees` verisiyle otomatik uygunluk önerisi
  üretir, son onay İK'da kalır
- `manager_notes` — bölüm yöneticisinin çalışanla ilgili girdiği serbest metin notlar (çalışan,
  yönetici, tarih, not); İK panelinde çalışan detayında görünür
- `managers` — bölüm yöneticisi hesapları (kısıtlı giriş: sadece kendi departmanını görür)
- `risk_score_weights` — ayrılma riski skoru ağırlıkları (Bölüm 5, madde 17), admin panelden
  değiştirilebilir, koda sabitlenmez
- `license` — lisans anahtarı, aktivasyon tarihi, son geçerlilik tarihi
- `audit_log` — (Faz 2) admin panelde yapılan her değişiklik

---

## 5. Modüller — Öncelik Sırasıyla

### Faz 1 (MVP — veri kaynağı net, doğrudan kurulabilir)
1. Kadro genel görünüm (yaka dağılımı, departman/şube kırılımı)
2. Aylık devir hızı trendi
3. Departman bazlı devamsızlık
4. Deneme/6 ay/1 yıl değerlendirme takibi (kıdem eşiği) — kriter bazlı puanlama, deneme süresi
   varsayılan 2 ay (admin değiştirebilir)
5. Vardiya & mesai yükü (yasal limit varsayılan 270 saat/yıl, admin değiştirebilir)
6. ISG tarama takibi
7. Pazartesi/Cuma devamsızlık sinyali
8. Zorunlu istihdam (engelli) takibi — %3 kontenjan otomatik hesaplama
9. Çoklu şube/lokasyon filtresi
10. İşten çıkış maliyeti hesaplayıcı — **panelin gömülü bir modülü**, ayrı satılan/lisanslanan
    bağımsız bir araç DEĞİL. Maliyet kalemleri: boş pozisyon maliyeti, işe alım süreci, oryantasyon
    verim kaybı, **KKD/kıyafet-ekipman maliyeti** (yeni personel için baret, iş kıyafeti, eldiven,
    ayakkabı vb. — mavi yaka için varsayılan daha yüksek, beyaz yaka için düşük/badge-ekipman)
11. "Patron Raporu" — tek sayfa yönetici özeti. MVP'de `window.print()` ile tarayıcı üzerinden
    PDF alınır (bkz. Bölüm 8, risk notu)
12. Tutanak kayıtları — ayrılma riski yüksek çalışanlarla ilişkilendirilmiş disiplin/uyarı
    tutanakları (tür, tarih, açıklama); risk tablosunda tutanak sayısı gösterilir
13. Ödül/takdir alan personel — performans veya risk bölümüyle ilişkilendirilmiş ödül kaydı;
    risk listesindeki bir çalışan aynı zamanda ödüllüyse bu çapraz gösterilir (güçlü bir İK
    içgörüsü: ödül tek başına bağlılığı garanti etmez)
14. Birikmiş yıllık izin takibi — hak edilen/kullanılan/kalan gün karşılaştırması, eşik bazlı
    uyarı (varsayılan 30+ gün kritik, 15-29 dikkat, admin panelden değiştirilebilir), tahmini mali
    yükümlülük (kalan gün × günlük ücret) — hem operasyonel (kullandırma planı) hem mali risk
    (ayrılıkta nakit ödeme yükümlülüğü) olarak sunulur

### Faz 1.5 — İlk Kurulumda Eksik Kalan / Şimdi Netleşen Gereksinimler
**Not: Bunlardan bazıları (Patron Raporu, İşten Çıkış Maliyeti Hesaplayıcı) zaten Faz 1'de vardı
ama ilk kurulumda atlanmış — tamamlanmalı. Diğerleri önceden Faz 2'ye ertelenmişti, iş kuralları
artık netleşti, şimdi öncelikli.**

15. **İşten Çıkış Maliyeti Hesaplayıcı tamamlanmalı** — madde 10 ile aynı, henüz yapılmamış / ilk
    kurulumda görünmüyor. Panelin gömülü bir modülü olarak eklenmeli (ayrı bir araç değil):
    boş pozisyon maliyeti + işe alım süreci + oryantasyon verim kaybı + KKD/kıyafet-ekipman
    maliyeti kalemleriyle.
16. **Patron Raporu tamamlanmalı** — madde 11 ile aynı, henüz yapılmamış. Bu, **sabit, tek
    sayfalık bir yönetici özeti**: işgücü maliyeti, 3 büyük risk, 2 kritik karar gibi önceden
    tanımlı bir şablon. `window.print()` ile PDF alınır (bkz. Bölüm 8).
17. **YENİ — Genel Rapor/Sunum PDF Dışa Aktarma (Patron Raporu'ndan AYRI bir özellik):**
    İK'nın, yönetim toplantısında ihtiyacına göre **kendi seçtiği verileri** PDF olarak
    çıkarabilmesi gerekiyor — sabit tek şablonla sınırlı değil. Örnek kullanım: İK, devir
    analizi grafiğini + risk listesini + birikmiş izin tablosunu seçip "PDF olarak indir"
    diyebilmeli, panel bunları düzenli bir sunum formatında (başlık, tarih, şirket adı ile)
    tek PDF'e dönüştürmeli. Pratik uygulama: her modülün (devir analizi, risk listesi, vardiya
    yükü, izin bakiyesi, arabuluculuk tablosu vb.) yanına küçük bir "PDF'e Aktar" butonu
    eklenmeli — MVP'de bu da `window.print()` ile o bölümü yazdırma diyaloğuna gönderebilir
    (Bölüm 8'deki teknik sınırlama burada da geçerli). İleri düzeyde (Faz 2) birden fazla
    bölümün seçilip tek PDF'te birleştirildiği bir "rapor oluşturucu" ekranı düşünülebilir.
18. **Kritik Rol & Yedekleme Uyarısı** — önceki plandaki "Kritik rol & yetkinlik matrisi"nin
    somutlaşmış hali. Admin, kritik pozisyonları ve bu pozisyon için yedek/çapraz eğitimli
    personeli tanımlar. **Bir kritik pozisyonun yedeği yoksa dashboard'da görünür bir uyarı
    banner'ı gösterilmeli** ("Bu pozisyon için yedek personel yok — [Ad Soyad] ayrılırsa
    operasyon durabilir"). Alan isimleri özelleştirilebilir kalmalı (Bölüm 1'deki kural geçerli).
19. **Ayrılma Riski Skoru — v1 formülü netleşti, artık uygulanmalı:**
    0-100 arası ağırlıklı skor, aşağıdaki beş sinyalden hesaplanır:
    - **Devamsızlık trendi** (%30): son 3 ayın devamsızlık oranı, önceki 3 aya göre artış yüzdesi
    - **Fazla mesai yükü** (%20): yıllık fazla mesainin yasal limite (270 saat) yakınlık oranı
    - **Tutanak sayısı** (%20): son 12 ayda alınan tutanak sayısı (`disciplinary_records`'tan)
    - **Kıdem <1 yıl** (%15): deneme/6 ay/1 yıl döneminde olma durumu (evet/hayır, evet ise puan)
    - **Birikmiş izin** (%15): 30+ gün birikmiş izin varsa ek risk sinyali (`leave_balances`'tan)
    Her sinyal 0-100 arasında normalize edilip ağırlıklı ortalaması alınır. Bu ilk versiyon —
    gerçek kullanımla (hangi sinyaller gerçekten ayrılmayı öngörüyor) zamanla kalibre edilecek,
    ağırlıklar admin panelden değiştirilebilir bir ayar olarak tutulmalı, koda sabitlenmemeli.
20. **SGK Teşvik Motoru — statik liste değil, İK'nın yönetebildiği kural tablosu:**
    Yasalar sık değiştiği için İK, teşvik tanımlarını **kendi ekleyip/düzenleyip/pasife
    alabilmeli**. Admin ekranında: teşvik adı, açıklama, uygunluk kriterleri (yaş aralığı,
    cinsiyet, engellilik durumu, bölge gibi serbest/opsiyonel alanlar), tahmini tutar/oran,
    aktif/pasif durumu. Sistem bu kurallara göre `employees` tablosundaki yaş/cinsiyet/engellilik
    verisiyle **otomatik uygunluk önerisi** sunabilir, ama son onay/işaretleme İK'da kalır —
    tam otomatik hesaplama garanti edilmez, İK'nın doğrulaması gerekir.
21. **Bölüm Yöneticisi Değerlendirme & Not Ekranı — yeni rol, yeni ekran:**
    Departman yöneticileri için ayrı, kısıtlı bir giriş (kendi departmanındaki çalışanları
    görür, başka departmanı görmez). Bu ekrandan bir çalışanla ilgili **serbest metin not**
    girebilir (tarih + not + hangi yönetici girdi). Bu notlar **İK'nın panelinde görünür**
    olmalı (çalışan detayında bir "Yönetici Notları" bölümü olarak). Bu, "Rol bazlı görünürlük"
    fikrinin somutlaşmış, öncelikli hali.
22. **`employees` tablosuna yeni alanlar:** doğum tarihi, cinsiyet, emekli durumu (evet/hayır).
    Bu alanlar SGK teşvik uygunluk hesaplaması için gereklidir (madde 20). Yeni personel ekleme
    formuna bu alanlar eklenmelidir. **KVKK notu:** doğum tarihi ve cinsiyet özel nitelikli
    olmasa da kişisel veridir — bu alanlara erişim admin/İK rolüyle sınırlı tutulmalı, bölüm
    yöneticisi ekranında (madde 21) gösterilmemeli.

### Faz 2 (iş kuralı netleşmesi gereken ⚠️ modüller — MVP sonrası)
23. Devir maliyeti özeti (birim işe alım maliyeti varsayımları gerçek verilerle güncellenince)
24. Çıkış mülakatı kök neden analizi (kategorize veri toplama mekanizmasıyla)
25. Yıllık karşılaştırma & sektör benchmarkı
26. Zorunlu eğitim takibi (ISG modülüyle aynı mantık, farklı tür alanı)
27. Aylık memnuniyet anketi
28. Otomatik e-posta hatırlatmaları (kıdem eşiği/ISG tarihi yaklaşınca)
29. Audit log

### Kapsam Dışı (bu proje için yapılmayacak)
- İK dijital asistanı / chatbot (WhatsApp entegrasyonu) — ayrı proje


---

## 6. Admin Panel Gereksinimleri

- Şifreli giriş (`/admin`)
- **Excel içe aktarma**: sabit bir şablon formatı tanımla (kolonlar: ad, departman, şube, yaka
  tipi, işe giriş tarihi vb.), admin panelden bu şablonu **indirilebilir** yap, yüklenen dosyayı
  şablona göre parse edip veritabanına yaz, hatalı satırları kullanıcıya göster.
- **Tekil olay formları**: değerlendirme puanı girişi, arabuluculuk dosyası ekleme, ISG tarama
  tarihi güncelleme gibi formlar.
- **Destek/mesaj formu**: kullanıcının kuruculara ileteceği soruları göndereceği basit bir form
  (bkz. Bölüm 9).
- **Ayarlar**: deneme süresi (varsayılan 2 ay), yasal fazla mesai limiti (varsayılan 270 saat),
  kritik rol alan tanımları gibi firmaya özel parametrelerin düzenlenebildiği bir ekran.

---

## 7. Lisanslama Sistemi (AYRI, KÜÇÜK BİR ALT SİSTEM)

**Önemli netleştirme:** "Sunucu maliyetim yok" kararı genel kurulum için geçerli (her müşteri
kendi ortamında barınır) — ama lisans doğrulama merkezi olmak zorunda, bu yüzden kurucunun
**tek, çok küçük ve ücretsiz katmanda kalabilecek** bir alt servise ihtiyacı var:

- Basit bir **lisans doğrulama API'si** (örn. Vercel Edge Function + küçük bir Turso/Supabase
  tablosu — kurucunun kendi hesabında, tüm müşteriler için ortak, sadece lisans anahtarlarını
  tutar, müşteri verisini ASLA tutmaz).
- Uygulama açılışında bu API'ye lisans anahtarını gönderir, geçerlilik ve son kullanma tarihini
  kontrol eder.
- **Süre dolunca**: uygulama verileri silmez, sadece erişimi kilitler ve "Lisansınızın süresi
  doldu, yenilemek için iletişime geçin" ekranı gösterir.
- Bu API'nin barınması (Vercel Edge Function ücretsiz katmanı yeterli olur) kurucunun tek
  sürdürmesi gereken merkezi bileşendir — geri kalan her şey müşteride.

---

## 8. Patron Raporu / PDF — Bilinen Sınırlama

MVP'de `window.print()` kullanılır (tarayıcının "PDF olarak kaydet" özelliği). Bu; tarayıcıya
göre görünüm farkı, otomatik dosya adlandırma olmaması gibi küçük sınırlamalar taşır ama MVP için
kabul edilebilir. Faz 2'de gerçek sunucu taraflı PDF üretimi (örn. `@react-pdf/renderer` veya
Puppeteer tabanlı bir çözüm) değerlendirilebilir.

---

## 9. Destek Mekanizması

7/24 canlı destek yok. Admin paneldeki destek formu, basit bir transactional email servisiyle
(örn. Resend — ücretsiz katmanı var) kurucunun e-postasına iletilir. Ekstra bir ticket sistemi
kurmaya gerek yok, e-posta yeterli.

---

## 10. Tasarım Sistemi

**Ürün arayüzü ve pazarlama sitesi artık kasıtlı olarak İKİ AYRI görsel kimlik taşıyor** —
birbirine kopyalanmamalı:

**A) Ürün arayüzü (`/panel`, `/admin`)** — `ik-komuta-merkezi.jsx` referans alınır. Açık/kumaş
temalı, işlevsel:
- Renkler: ink `#1B2333`, paper `#F8F5EC`, thread (altın) `#D4A017`, denim (mavi) `#2A4F82`,
  brick (kiremit) `#B23A2E`, pine (yeşil) `#327355`, indigo `#4B3F86`
- "Kumaş bakım etiketi" (care-label) bileşeni fiyat/özellik özetlerinde kullanılabilir

**B) Pazarlama sitesi (`tanitim-sayfasi.html`, ayrı barındırılır, ürünün parçası değil)** —
koyu, teknik/premium SaaS teması (Linear/Vercel tarzı):
- Renkler: bg `#0A0D14`, surface `#12161F`, accent (indigo/mor) `#7C7FFF`, ayrıca gold/coral/mint/sky
  ikincil vurgular
- Grid doku arka plan, cam-efekti kartlar, tarayıcı-çerçeveli ürün mockup'ları, kaydırma animasyonları

Fontlar her iki kimlikte de aynı: Archivo (başlık), Inter (gövde metni), Space Mono (veri/etiket).

---

## 11. Ticari Model (özet — bkz. detaylar için Bölüm 7)

- **Fiyat**: Sabit **29.900 TL/yıl**, tek paket, tüm modüller dahil, çalışan/şube sayısı sınırı yok
- **Dağıtım**: Self-hosted, izole kurulum, KVKK sorumluluğu müşteride
- **Destek**: Form/mesaj üzerinden, 7/24 değil
- **Teslimat**: Kod + 3 PDF (Kurulum Rehberi, Kullanım Kılavuzu, Excel Şablon Rehberi)

---

## 12. Bilinen Riskler ve Alınan Önlemler

Bu bölüm, planlama sürecinde tespit edilen sorunları ve çözüm kararlarını belgeler —
Claude Code bunları bilerek ilerlemeli:

| Risk | Çözüm |
|---|---|
| SQLite dosyası Vercel'de kalıcı değil | Turso (libSQL) veya Supabase Postgres kullan, ham SQLite dosyası ile prod'a çıkma |
| Lisans doğrulama "sunucu yok" kararıyla çelişiyor | Kurucu, sadece lisans anahtarlarını tutan tek, küçük, ücretsiz katmanda kalan bir API barındırır — bu istisna açıkça kabul edilmiştir |
| "Kurulum kime ait" belirsizliği (kurucu mu, müşteri mi barındırıyor) | **Varsayım**: Müşteri kendi ücretsiz Vercel + Turso/Supabase hesabını açar (Kurulum Rehberi PDF'i bu adımı içerir), kurucu bu hesaba deploy eder. Böylece KVKK veri sorumluluğu net şekilde müşteride kalır. |
| Sektöre kilitli veri modeli riski | Departman/kritik-rol alanları serbest/özelleştirilebilir yapıldı (Bölüm 1, 4, 6) |
| Excel şablonu tanımsızlığı | Admin panelden indirilebilir sabit şablon dosyası + Excel Şablon Rehberi PDF |
| `window.print()` PDF sınırlaması | MVP için kabul edildi, Faz 2'de gerçek PDF motoru planlandı |
| Çok-kiracı (multi-tenant) yanlış varsayımı riski | Bölüm 2'de açıkça tek-kiracı mimari zorunlu kılındı |
| Lisans süresi dolunca veri kaybı riski | Süre dolunca sadece erişim kilitlenir, veri silinmez |

---

## 13. Referans Dosyalar

- `ik-komuta-merkezi.jsx` — dashboard'un görsel/işlevsel referansı (demo veriyle)
- `tanitim-sayfasi.html` — pazarlama/satış sayfası (ayrı barındırılır, ürünün kendisi değildir)
- Bu belge — mimari, iş kuralı ve ticari model kaynak dokümanı

## 14. Yapım Sırası

1. Next.js iskeleti + Turso/Supabase şeması (Bölüm 4)
2. Admin panel: auth + Excel içe aktarma + tekil formlar + ayarlar ekranı
3. Dashboard: Faz 1 modülleri veritabanına bağlama
4. Lisans doğrulama alt sistemi (Bölüm 7)
5. Destek formu + e-posta entegrasyonu
6. Patron Raporu (`window.print()` ile MVP)
7. Faz 2 modülleri (iş kuralları netleştikçe)
8. 3 PDF dökümanının hazırlanması
9. Vercel'e (müşterinin hesabına) yayınlama
