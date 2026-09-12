# İK Komuta Merkezi — Kullanım Kılavuzu

İK Komuta Merkezi üç ayrı bölümden oluşur:

- **`/admin`** — İK ekibinin veri girdiği, şifreyle korunan yönetim paneli.
- **`/panel`** — Genel Müdür/yönetimin salt görüntülediği, paylaşılan şifreyle korunan gösterge paneli.
- **`/yonetici`** — Bölüm yöneticilerinin **sadece kendi departmanını** görebildiği, kısıtlı bir
  giriş (bkz. Bölüm C). Aynı giriş ekranını (`/admin/login`) kullanır — hesabın rolü
  otomatik olarak doğru ekrana yönlendirir.

Günlük akış: İK, `/admin`'den Excel yükler veya form doldurur → veriler otomatik olarak
`/panel`'e yansır → yönetim istediği an panelini açar, kimseye bir şey göndermesi gerekmez.

---

## Bölüm A — Admin Panel (`/admin`)

Soldaki menüden aşağıdaki sayfalara erişilir:

| Sayfa | Ne işe yarar |
|---|---|
| **Ana Sayfa** | Aktif çalışan sayısı, bekleyen değerlendirme, süresi geçmiş ISG taraması, kritik izin bakiyesi gibi hızlı özet sayılar. |
| **Çalışanlar** | Tekil çalışan ekleme/düzenleme (ad, departman, şube, yaka tipi, işe giriş tarihi, maaş, doğum tarihi/cinsiyet/emekli durumu — son üçü opsiyonel, SGK Teşvik Motoru için kullanılır). Toplu ekleme için Excel İçe Aktarma'yı kullanın. Çalışan detay sayfasında, o çalışan için bölüm yöneticisi tarafından girilmiş **Yönetici Notları** da (varsa) görünür. |
| **Departman & Şube** | Departman ve şube listesini tanımlar — çalışan eklemeden/Excel yüklemeden önce burası doldurulmalı. Departman/şube isimleri tamamen serbesttir, sektörünüze göre istediğiniz gibi adlandırabilirsiniz. |
| **Excel İçe Aktarma** | Çalışan, devamsızlık ve vardiya/mesai verilerini toplu yükler. Ayrıntılar için *Excel Şablon Rehberi*'ne bakın. |
| **Değerlendirmeler** | Deneme süresi / 6 ay / 1 yıl değerlendirme kayıtları — durum ve Yetkinlik/Uyum/Performans puanları buradan girilir/güncellenir. |
| **Arabuluculuk** | Arabulucuda anlaşılan dosyalar — ödenen tutar ve tahmini dava maliyeti (tasarrufu hesaplamak için). |
| **ISG Taramaları** | Periyodik sağlık kontrollerinin (odyometri, akciğer grafisi vb.) son tarihleri. |
| **Zorunlu Eğitim** | İSG, yangın, ilkyardım gibi periyodik zorunlu eğitimlerin son tarihleri — ISG Taramaları ile aynı mantık, ayrı bir tür alanı. |
| **Tutanaklar** | Sözlü/yazılı uyarı, devamsızlık tutanağı gibi disiplin kayıtları. |
| **Ödül / Takdir** | Ödül/takdir alan personel kayıtları. |
| **İzin Bakiyeleri** | Çalışan bazında yıllık hak edilen/kullanılan/kalan izin günleri. |
| **Engelli Kontenjanı** | Toplam kadro ve mevcut engelli çalışan sayısı — panel buradan yasal kontenjan açığını otomatik hesaplar. |
| **Kritik Rol & Yedekleme** | Kritik pozisyonları (ad tamamen serbest) ve o pozisyon için yedek/çapraz eğitimli personel durumunu tanımlarsınız. Yedeği olmayan (Yedek Sayısı = 0) bir pozisyon varsa `/panel`'de otomatik, görünür bir uyarı çıkar. |
| **SGK Teşvikleri** | Teşvik tanımlarını (yaş aralığı/cinsiyet/engellilik/bölge kriterleriyle) siz eklersiniz — statik bir liste değildir, mevzuat değiştikçe siz güncellersiniz. Sistem aktif çalışanlarla otomatik uygunluk önerisi sunar (yeşil "uygun" / sarı "kontrol gerekli"), **son onay her zaman sizde kalır** — özellikle engellilik ve bölge kriterleri çalışan bazında sistemde tutulmadığından hiçbir zaman otomatik onaylanmaz. |
| **Bölüm Yöneticileri** | Departman yöneticisi hesapları (ad/e-posta/şifre/departman) oluşturursunuz. Bu kişiler `/admin/login`'den giriş yapıp otomatik olarak `/yonetici`'ye yönlendirilir — sadece kendi departmanlarını görürler (bkz. Bölüm C). |
| **Çıkış Mülakatı** | Ayrılan çalışanlar için kategorize çıkış mülakatı kaydı (ayrılış nedeni sabit bir kategori listesinden seçilir) — `/panel`'de kök neden analizi grafiğine döner. |
| **Ayarlar** | Şirket adı, deneme süresi, yasal fazla mesai limiti, izin eşikleri, maliyet varsayımları (işe alım, KKD, boş pozisyon süresi vb.), Patron Raporu'ndaki işgücü maliyeti/ciro alanları, **Ayrılma Riski Skoru ağırlıkları** (bkz. aşağıda) ve panel şifresi. |
| **Lisans** | Lisansınızın durumunu gösterir (aktif/süresi doldu/geçersiz), manuel yeniden kontrol imkanı sunar. Anahtar buradan **girilmez** — kurulumda ortam değişkeni olarak tanımlanır. |
| **Audit Log** | Admin panelde ve Bölüm Yöneticisi ekranında yapılan her değişikliğin (kim, ne zaman, ne yaptı) salt-okunur kaydı — son 300 işlem listelenir. |
| **Destek** | Sorularınızı/taleplerinizi e-posta olarak iletir (7/24 canlı destek yoktur). |

## Bölüm B — Yönetim Paneli (`/panel`)

Tek sayfalık, filtrelenebilir bir gösterge panelidir. Üstteki **Tüm Kadro / Beyaz Yaka /
Mavi Yaka** ve şube filtreleri, kadro kompozisyonu ve departman bazlı devamsızlık grafiklerini
anında günceller.

Panelde sırasıyla şu bölümler yer alır:
- **Kritik Rol & Yedekleme Uyarısı** (varsa) — yedeği tanımlanmamış kritik pozisyonlar en üstte,
  görünür bir uyarı olarak listelenir.
- Üst KPI kartları (toplam çalışan, bu ay devir hızı, yıllık işten çıkış maliyeti, kıdem eşiğine
  yaklaşan dosya sayısı, **yüksek riskli çalışan sayısı**)
- **Ayrılma Riski Skoru** — devamsızlık trendi, fazla mesai yükü, tutanak sayısı, kıdem ve
  birikmiş izin sinyallerinden hesaplanan 0-100 arası ağırlıklı skor; en riskli çalışan en
  üstte. Ağırlıklar Admin → Ayarlar'dan değiştirilebilir (varsayılan %30/%20/%20/%15/%15).
  Bu ilk versiyon — gerçek kullanımla zamanla kalibre edilmesi beklenir.
- Aylık devir hızı trendi (son 12 ay)
- **Devir Maliyeti Özeti** — devir hızı trendini işten çıkış maliyetiyle birleştirip son 12 ayın
  gerçek devir maliyetini ve hangi departmanın en çok maliyete yol açtığını gösterir.
- Departman bazında devamsızlık (gün sayısı) ve kadro kompozisyonu
- Deneme süresi & kıdem öncesi değerlendirme takibi
- İşten çıkış maliyeti hesaplayıcı (boş pozisyon + işe alım + oryantasyon + KKD, mavi/beyaz yaka ayrı ayrı)
- **Çıkış Mülakatı — Kök Neden Analizi** — Admin → Çıkış Mülakatı'nda kaydedilen ayrılış
  nedeni kategorilerinin dağılımı, en sık neden en üstte.
- Zorunlu istihdam (engelli) takibi
- Birikmiş yıllık izin takibi
- Vardiya & mesai yükü (yasal limiti aşanlar kırmızı işaretlenir)
- Periyodik ISG tarama takibi, **Zorunlu Eğitim Takibi** ve Pazartesi/Cuma devamsızlık sinyali
- Tutanak kayıtları, Ödül/Takdir, Arabuluculuk kazanç tablosu

### Patron Raporu alma

Sağ üstteki **"Patron Raporu Al (PDF)"** butonuna basın. Açılan tek sayfalık özet ekranında
**"Yazdır / PDF Kaydet"** butonuna basıp tarayıcının yazdırma penceresinden "PDF olarak kaydet"
seçeneğini kullanın. Bu rapordaki riskler ve önerilen kararlar, o anki gerçek verinize göre
otomatik olarak hesaplanır — ay değiştikçe/veri güncellendikçe içerik de değişir.

### Tek bir bölümü PDF olarak dışa aktarma (Patron Raporu'ndan ayrı)

Patron Raporu **sabit, tek sayfalık** bir özet iken, bazen toplantıya göre panelin **sadece bir
bölümünü** (ör. sadece devir analizi grafiğini, sadece risk listesini) paylaşmak isteyebilirsiniz.
Bunun için her bölümün başlığının yanında küçük bir **"PDF'E AKTAR"** butonu vardır:

1. İstediğiniz bölümün "PDF'e Aktar" butonuna basın.
2. Panel otomatik olarak sadece o bölümü (şirket adı + bölüm başlığı + tarihle) gösterecek
   şekilde daralır ve tarayıcının yazdırma penceresi açılır.
3. "PDF olarak kaydet" seçeneğini kullanın.
4. Yazdırma penceresini kapattığınızda panel otomatik olarak normal görünümüne döner.

## Bölüm C — Bölüm Yöneticisi Ekranı (`/yonetici`)

Departman yöneticilerinin (ör. üretim müdürü, mağaza müdürü) kendi ekibiyle ilgili gözlemlerini
İK'ya iletebilmesi için ayrı, kısıtlı bir ekrandır.

**Kurulum (İK tarafından):** Admin → **Bölüm Yöneticileri** sayfasından yöneticinin adı,
e-postası, bir şifre ve **hangi departmanı** göreceği belirlenerek hesap oluşturulur.

**Kullanım (yönetici tarafından):**
1. Yönetici `/admin/login` adresine gidip kendisine verilen e-posta/şifre ile giriş yapar —
   sistem otomatik olarak `/yonetici`'ye yönlendirir (İK'nın admin ekranlarını **göremez**).
2. Ekranda **sadece kendi departmanındaki** aktif çalışanlar listelenir.
3. Bir çalışanın altındaki kutuya tarih + serbest metin not yazıp **"Not Ekle"** ile kaydeder.
4. Daha önce girilmiş notlar (kendisinin veya aynı departmandaki başka bir yöneticinin) aynı
   ekranda, "hangi tarihte, kim tarafından" bilgisiyle görünür.

**İK tarafında görünürlük:** Bu notlar Admin → Çalışanlar → ilgili çalışan → **"Yönetici
Notları"** bölümünde salt-okunur olarak görünür. Doğum tarihi, cinsiyet gibi kişisel veri
alanları KVKK gereği bu ekranda **hiç gösterilmez, çekilmez** — yönetici sadece ad ve yaka
tipini görür.

## Sık Sorulan Sorular

**Yeni bir çalışan nasıl eklerim?**
Tek tek eklemek için Admin → Çalışanlar → "Yeni Çalışan" formunu; birden fazla çalışanı aynı anda
eklemek için Admin → Excel İçe Aktarma → Çalışanlar şablonunu kullanın.

**Devamsızlık/izin nasıl işlenir?**
Günlük devamsızlık kayıtları Excel İçe Aktarma → Devamsızlık şablonuyla toplu yüklenir. Yıllık
izin *bakiyesi* (hak edilen/kullanılan/kalan toplam) ise Admin → İzin Bakiyeleri sayfasından ayrı
olarak girilir — bu ikisi farklı verilerdir.

**Panelde bir sayı yanlış/eksik görünüyor, neden?**
Çoğu zaman ilgili Ayarlar alanı (ör. günlük ücret varsayımı, yasal mesai limiti) boş
bırakılmıştır. Ayarlar sayfasındaki "Varsayılan Maliyet Kalemleri" ve diğer parametreleri
kontrol edin.

**Panel şifresini unuttum / değiştirmek istiyorum.**
Admin → Ayarlar → "Panel Şifresi" alanından yeni bir şifre belirleyin.

**Ayrılma Riski Skoru'na ne kadar güvenmeliyim, ağırlıkları nasıl ayarlarım?**
Bu ilk versiyondur (v1) — beş sinyalin ağırlıkları (Admin → Ayarlar) varsayılan olarak
%30/%20/%20/%15/%15'tir. Gerçek kullanımınızla hangi sinyallerin sizde gerçekten ayrılmayı
öngördüğünü gözlemleyip zamanla bu ağırlıkları kendi verinize göre ayarlamanız beklenir —
sabit, değiştirilemez bir kural değildir.

**SGK Teşvik Motoru bir çalışanı otomatik "uygun" göstermiyor, hep "kontrol gerekli" diyor.**
Muhtemel nedenler: (1) çalışanın doğum tarihi/cinsiyeti girilmemiş — Çalışanlar sayfasından
tamamlayın; (2) teşvik kuralı engellilik veya bölge şartı içeriyor — bu ikisi çalışan bazında
sistemde tutulmadığından **hiçbir zaman** otomatik onaylanmaz, elle doğrulamanız gerekir.

**Bölüm yöneticisi hesabı nasıl oluşturulur?**
Admin → Bölüm Yöneticileri → "Yeni Yönetici Hesabı Oluştur" formunu doldurun (bkz. Bölüm C).

**Kim, ne zaman, neyi değiştirdi — nasıl görebilirim?**
Admin → Audit Log sayfasından, admin panelde ve Bölüm Yöneticisi ekranında yapılan tüm
değişikliklerin (kim, ne zaman, hangi işlem) listesini görebilirsiniz.
