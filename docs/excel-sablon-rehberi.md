# İK Komuta Merkezi — Excel Şablon Rehberi

Admin Panel → **Excel İçe Aktarma** sayfasından üç ayrı şablon indirebilir ve doldurup geri
yükleyebilirsiniz. Her şablonun **ilk satırı başlık satırıdır, değiştirmeyin.** İkinci satırda
örnek bir kayıt bulunur — kendi verinizi yazmadan önce silebilirsiniz.

**Genel kural:** Yükleme sırasında her satır ayrı ayrı kontrol edilir. Hatalı satırlar **atlanır**,
geçerli satırlar yine de içe aktarılır — işlem sonunda hangi satırın hangi hata nedeniyle
atlandığı ekranda listelenir. Hatalı satırları düzeltip dosyayı tekrar yükleyebilirsiniz
(zaten yüklenmiş satırlar tekrar eklenmez diye kontrol yapılmaz — aynı kişiyi iki kez
yüklemeyin, tekrar eden kayıt oluşur).

---

## 1. Çalışanlar Şablonu

İndirme: Admin → Excel İçe Aktarma → Çalışanlar → "Şablonu İndir" (`calisanlar-sablonu.xlsx`)

**Önkoşul:** Kullanacağınız her departman ve şube isminin, Admin → **Departman & Şube**
sayfasında önceden tanımlanmış olması gerekir. Tanımlı değilse o satır hata verir.

| Kolon | Zorunlu mu? | Format | Açıklama |
|---|---|---|---|
| Ad Soyad | Evet | Serbest metin | — |
| Departman | Evet | Serbest metin | Departman & Şube sayfasındaki isimle **birebir** (büyük/küçük harf duyarsız) eşleşmeli |
| Şube | Evet | Serbest metin | Departman & Şube sayfasındaki isimle **birebir** eşleşmeli |
| Yaka Tipi (Mavi/Beyaz) | Evet | "Mavi" veya "Beyaz" | Başka bir değer kabul edilmez |
| İşe Giriş Tarihi (GG.AA.YYYY) | Evet | `15.03.2024` formatında | — |
| Aylık Maaş (opsiyonel) | Hayır | Sayı (ör. `25000`) | Boş bırakılırsa devir maliyeti / izin yükümlülüğü hesaplarında Ayarlar'daki varsayılan günlük ücret kullanılır |
| Doğum Tarihi (opsiyonel, GG.AA.YYYY) | Hayır | `10.05.1990` formatında | SGK Teşvik Motoru'nun yaş bazlı otomatik uygunluk önerisi için kullanılır — boş bırakılırsa o çalışan için yaş şartı olan teşviklerde "kontrol gerekli" işaretlenir |
| Cinsiyet (opsiyonel, Kadın/Erkek) | Hayır | "Kadın" veya "Erkek" | Aynı şekilde SGK Teşvik Motoru için — **kişisel veridir**, erişim sadece İK/admin rolüyle sınırlıdır, Bölüm Yöneticisi ekranında gösterilmez |
| Emekli (opsiyonel, Evet/Hayır) | Hayır | "Evet" veya "Hayır" | Boş bırakılırsa "Hayır" kabul edilir |

**Örnek satır:** `Ahmet Yılmaz | Dokuma | Çorlu Fabrika | Mavi | 15.03.2024 | 25000 | 10.05.1990 | Erkek | Hayır`

Yüklenen çalışanlar otomatik olarak **"aktif"** durumda oluşturulur. Bir çalışanın işten
ayrılışını işlemek için Admin → Çalışanlar → ilgili çalışan → "Düzenle" ekranını kullanın (bu,
Excel şablonunun kapsamında değildir).

---

## 2. Devamsızlık Şablonu

İndirme: Admin → Excel İçe Aktarma → Devamsızlık → "Şablonu İndir" (`devamsizlik-sablonu.xlsx`)

**Önkoşul:** "Ad Soyad" alanı sistemdeki çalışanla **isim üzerinden** eşleştirilir. Sistemde
**aynı isimde birden fazla çalışan varsa o satır otomatik eşleştirilemez ve hata verir** —
böyle bir durum varsa (ör. iki "Ahmet Yılmaz") bu şablonla toplu yükleme yapamazsınız, ilgili
kayıtları Admin panelden tekil girmeniz gerekir.

| Kolon | Zorunlu mu? | Format | Açıklama |
|---|---|---|---|
| Ad Soyad | Evet | Sistemde kayıtlı çalışanla birebir aynı | — |
| Tarih (GG.AA.YYYY) | Evet | `04.08.2026` formatında | — |
| Tür (ör. Devamsızlık, Raporlu, Ücretsiz İzin) | Evet | Serbest metin | Sabit bir liste değildir, istediğiniz terimi kullanabilirsiniz — panel bu değeri olduğu gibi gösterir |
| Gün Sayısı (opsiyonel, varsayılan 1) | Hayır | Pozitif sayı | Yarım günlük devamsızlık için `0.5` gibi ondalık da girilebilir |
| Not (opsiyonel) | Hayır | Serbest metin | — |

**Örnek satır:** `Ahmet Yılmaz | 04.08.2026 | Devamsızlık | 1 | Habersiz`

**Not:** Panelin "Pazartesi/Cuma devamsızlık sinyali" özelliği, Gün Sayısı **1 veya altında**
olan kayıtları "tek günlük" olarak sayar — bu alanı doğru girmeniz bu özelliğin doğru
çalışması için önemlidir.

---

## 3. Vardiya & Mesai Şablonu

İndirme: Admin → Excel İçe Aktarma → Vardiya → "Şablonu İndir" (`vardiya-mesai-sablonu.xlsx`)

**Önkoşul:** Devamsızlık şablonuyla aynı — "Ad Soyad" isim üzerinden eşleştirilir, aynı isimde
birden fazla çalışan varsa satır hata verir.

Bu şablon **aylık dönem bazında** çalışır: aynı çalışan + aynı dönem için tekrar yüklerseniz,
önceki kayıt **güncellenir** (üzerine yazılır) — dolayısıyla bir ayın rakamlarını düzeltmek
için o ayı tekrar yükleyebilirsiniz, çift kayıt oluşmaz.

| Kolon | Zorunlu mu? | Format | Açıklama |
|---|---|---|---|
| Ad Soyad | Evet | Sistemde kayıtlı çalışanla birebir aynı | — |
| Dönem (YYYY-AA) | Evet | `2026-07` formatında | Ay-yıl, gün belirtilmez |
| Fazla Mesai Saati | Evet | Sayı (ör. `26`) | O dönemdeki toplam fazla mesai saati |
| Gece Vardiyası Sayısı (opsiyonel, varsayılan 0) | Hayır | Tam sayı | — |
| Hafta Sonu Mesai Sayısı (opsiyonel, varsayılan 0) | Hayır | Tam sayı | — |

**Örnek satır:** `Ahmet Yılmaz | 2026-07 | 26 | 4 | 2`

Panel, son 12 dönemin toplamını Ayarlar'daki **"Yasal Fazla Mesai Limiti"** ile karşılaştırıp
limiti aşan çalışanları kırmızı işaretler.

---

## Genel İpuçları

- Tarih alanlarında `GG.AA.YYYY` (ör. `04.08.2026`) veya `YYYY-AA-GG` (ör. `2026-08-04`)
  formatlarının ikisi de kabul edilir.
- Şablon dosyasının kolon **sırasını ve başlıklarını değiştirmeyin** — sistem başlıklara göre
  eşleştirme yapar.
- Büyük dosyalarda (yüzlerce satır) yükleme birkaç saniye sürebilir, sayfa kendiliğinden
  sonucu gösterecektir.
