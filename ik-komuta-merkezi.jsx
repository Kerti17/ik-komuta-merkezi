import React, { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, Users, Wallet, Clock, ShieldAlert, CheckCircle2, XCircle, Moon, GitBranch, Activity, MessageCircle, Siren, Wrench, Scale, ClipboardCheck, FileDown, ArrowLeft, Printer, Building2, Landmark, Smile, Flame, History, BellRing, Eye, Palmtree } from "lucide-react";

// ---------- Tasarım tokenleri ----------
// Zemin: sıcak kumaş beji | Yazı: mürekkep lacivert | Aksan: mekik/bobin sarısı | Uyarı: tuğla kırmızısı | Olumlu: çam yeşili
const COLORS = {
  ink: "#1B2333",
  paper: "#F3F0E8",
  paperDeep: "#E9E4D6",
  thread: "#C99A2E",
  threadDeep: "#9C7418",
  brick: "#A8402E",
  pine: "#3F6B4F",
  denim: "#33507A",
  line: "#D8D2C0",
};

// ---------- Demo veri: Anadolu Tekstil A.Ş. (150 çalışan, 2 şube) ----------
const departmanlar = [
  { ad: "Dokuma", yaka: "mavi", kisi: 12, devamsizlik: 6.8, devir: 42, sube: "Çorlu Fabrika" },
  { ad: "Konfeksiyon", yaka: "mavi", kisi: 14, devamsizlik: 7.9, devir: 51, sube: "Çorlu Fabrika" },
  { ad: "Boya-Apre", yaka: "mavi", kisi: 8, devamsizlik: 5.4, devir: 33, sube: "Çorlu Fabrika" },
  { ad: "Saha Kalite Kontrol", yaka: "mavi", kisi: 6, devamsizlik: 4.1, devir: 28, sube: "Çorlu Fabrika" },
  { ad: "Satış & Pazarlama", yaka: "beyaz", kisi: 22, devamsizlik: 1.8, devir: 11, sube: "İstanbul Merkez Ofis" },
  { ad: "Lojistik & Tedarik", yaka: "beyaz", kisi: 20, devamsizlik: 2.1, devir: 14, sube: "Çorlu Fabrika" },
  { ad: "Tasarım & Ar-Ge", yaka: "beyaz", kisi: 18, devamsizlik: 1.2, devir: 9, sube: "İstanbul Merkez Ofis" },
  { ad: "Kalite (Ofis)", yaka: "beyaz", kisi: 14, devamsizlik: 1.9, devir: 12, sube: "Çorlu Fabrika" },
  { ad: "Muhasebe & Finans", yaka: "beyaz", kisi: 15, devamsizlik: 1.4, devir: 7, sube: "İstanbul Merkez Ofis" },
  { ad: "Bilgi İşlem", yaka: "beyaz", kisi: 8, devamsizlik: 1.1, devir: 6, sube: "İstanbul Merkez Ofis" },
  { ad: "İnsan Kaynakları", yaka: "beyaz", kisi: 7, devamsizlik: 1.0, devir: 5, sube: "İstanbul Merkez Ofis" },
  { ad: "Yönetim", yaka: "beyaz", kisi: 6, devamsizlik: 0.6, devir: 3, sube: "İstanbul Merkez Ofis" },
];

const subeListesi = ["Tümü", "Çorlu Fabrika", "İstanbul Merkez Ofis"];

// ---------- SGK Teşvik Hatırlatıcısı ----------
// Not: Oranlar/rakamlar demo amaçlıdır — güncel SGK tebliğine göre teyit edilmelidir.
const sgkTesvikleri = [
  { ad: "Genç/Kadın/Engelli İstihdam Teşviki (5510 Ek-1)", uygun: true, aciklama: "18-29 yaş erkek, kadın veya engelli çalışan için işveren SGK priminde indirim", tahminiYillikTasarruf: 46000 },
  { ad: "İşbaşı Eğitim Programı (İŞKUR)", uygun: true, aciklama: "Deneme süresindeki yeni işe alımlar için İŞKUR katkı payı", tahminiYillikTasarruf: 18000 },
  { ad: "Bölgesel Teşvik (6. Bölge)", uygun: false, aciklama: "İşyeri adresi teşvik kapsamındaki 6. bölge illerinde değil", tahminiYillikTasarruf: 0 },
  { ad: "Engelli Çalıştırma Teşviki", uygun: true, aciklama: "Kontenjanın üzerinde engelli çalışan istihdamı için ek SGK prim indirimi", tahminiYillikTasarruf: 12000 },
];

const aylikDevir = [
  { ay: "Eyl", mavi: 3.8, beyaz: 0.9 },
  { ay: "Eki", mavi: 4.1, beyaz: 1.1 },
  { ay: "Kas", mavi: 3.6, beyaz: 0.8 },
  { ay: "Ara", mavi: 5.2, beyaz: 1.3 },
  { ay: "Oca", mavi: 4.9, beyaz: 1.0 },
  { ay: "Şub", mavi: 4.4, beyaz: 0.9 },
  { ay: "Mar", mavi: 5.6, beyaz: 1.4 },
  { ay: "Nis", mavi: 6.1, beyaz: 1.2 },
  { ay: "May", mavi: 5.3, beyaz: 1.1 },
  { ay: "Haz", mavi: 4.8, beyaz: 1.0 },
  { ay: "Tem", mavi: 5.9, beyaz: 1.3 },
  { ay: "Ağu", mavi: 6.4, beyaz: 1.5 },
];

const riskliCalisanlar = [
  { ad: "M. Yıldız", dep: "Konfeksiyon", yaka: "mavi", skor: 88, sebep: "Devamsızlık artışı + fazla mesai yükü", tutanakSayisi: 2 },
  { ad: "A. Kaya", dep: "Dokuma", yaka: "mavi", skor: 82, sebep: "Kıdem <1 yıl, oryantasyon sonrası düşüş", tutanakSayisi: 0 },
  { ad: "S. Demir", dep: "Boya-Apre", yaka: "mavi", skor: 76, sebep: "Vardiya değişikliği sonrası devamsızlık", tutanakSayisi: 1 },
  { ad: "E. Çelik", dep: "Satış & Pazarlama", yaka: "beyaz", skor: 71, sebep: "Terfi bekleyişi, 2 yıl aynı unvan", tutanakSayisi: 0 },
  { ad: "B. Arslan", dep: "Konfeksiyon", yaka: "mavi", skor: 69, sebep: "Ücret bandı emsal altı", tutanakSayisi: 0, odullu: true },
  { ad: "F. Şahin", dep: "Lojistik & Tedarik", yaka: "beyaz", skor: 64, sebep: "Yoğun seyahat, izin kullanamama", tutanakSayisi: 0 },
];

// ---------- Tutanak Kayıtları (risk listesindeki çalışanlarla ilişkili) ----------
const tutanakKayitlari = [
  { ad: "M. Yıldız", dep: "Konfeksiyon", tarih: "12.07.2026", tur: "Devamsızlık Tutanağı", aciklama: "Habersiz devamsızlık, savunma alındı" },
  { ad: "M. Yıldız", dep: "Konfeksiyon", tarih: "03.05.2026", tur: "Sözlü Uyarı", aciklama: "Geç kalma" },
  { ad: "S. Demir", dep: "Boya-Apre", tarih: "20.06.2026", tur: "Yazılı Uyarı", aciklama: "İş güvenliği talimatına uymama" },
];

// ---------- Ödül/Takdir Alan Personel ----------
const odullendirilenler = [
  { ad: "B. Arslan", dep: "Konfeksiyon", odul: "Yılın Ekip Lideri (2025)", tarih: "Ocak 2026" },
  { ad: "Z. Er", dep: "Lojistik & Tedarik", odul: "Ayın Personeli (3 kez)", tarih: "2025-2026" },
  { ad: "D. Taş", dep: "Boya-Apre", odul: "Ayın Personeli", tarih: "Mart 2026" },
];

// ---------- Birikmiş Yıllık İzin Takibi ----------
// Not: Kalan gün, önceki yıllardan devreden + bu yılki hak edişten kullanılmayan toplamdır.
// Ayrılık durumunda bu bakiye izin ücreti olarak ödenmek zorundadır — mali yükümlülük taşır.
const GUNLUK_UCRET_TAHMIN = { mavi: 830, beyaz: 1833 }; // TL, demo — maaş/30 kabaca
const izinBakiyeleri = [
  { ad: "M. Yıldız", dep: "Konfeksiyon", yaka: "mavi", hakEdilenGun: 14, kullanilanGun: 6, kalanGun: 38 },
  { ad: "B. Arslan", dep: "Konfeksiyon", yaka: "mavi", hakEdilenGun: 14, kullanilanGun: 9, kalanGun: 28 },
  { ad: "S. Demir", dep: "Boya-Apre", yaka: "mavi", hakEdilenGun: 14, kullanilanGun: 11, kalanGun: 22 },
  { ad: "F. Şahin", dep: "Lojistik & Tedarik", yaka: "beyaz", hakEdilenGun: 20, kullanilanGun: 8, kalanGun: 19 },
  { ad: "Z. Er", dep: "Lojistik & Tedarik", yaka: "beyaz", hakEdilenGun: 20, kullanilanGun: 15, kalanGun: 12 },
  { ad: "N. Aydın", dep: "Satış & Pazarlama", yaka: "beyaz", hakEdilenGun: 14, kullanilanGun: 9, kalanGun: 5 },
];

// Kıdem tazminatı hakkı 1 yılda doğduğu için üç aşama takip ediliyor:
// Deneme Süresi (ilk 2 ay) → İlk 6 Ay → İlk 1 Yıl (kıdem eşiği, karar son tarihi)
// Kriter bazlı puanlama: Yetkinlik (iş bilgisi/beceri), Uyum (ekip/kültür), Performans (üretkenlik/hedef)
// Her kriter 100 üzerinden; ortalama otomatik hesaplanır. Değerlendirme yapılmamışsa puanlar null.
const degerlendirmeler = [
  { ad: "İ. Kurt", dep: "Konfeksiyon", yaka: "mavi", iseGiris: "18.07.2026", asama: "Deneme Süresi (2 Ay)", sonTarih: "18.09.2026", kalanGun: 35, durum: "bekliyor", puan: null },
  { ad: "K. Yılmaz", dep: "Konfeksiyon", yaka: "mavi", iseGiris: "15.07.2026", asama: "Deneme Süresi (2 Ay)", sonTarih: "15.09.2026", kalanGun: 32, durum: "bekliyor", puan: null },
  { ad: "N. Aydın", dep: "Satış & Pazarlama", yaka: "beyaz", iseGiris: "02.03.2026", asama: "İlk 6 Ay", sonTarih: "02.09.2026", kalanGun: 19, durum: "bekliyor", puan: null },
  { ad: "R. Koç", dep: "Dokuma", yaka: "mavi", iseGiris: "20.09.2025", asama: "İlk 1 Yıl (Kıdem Eşiği)", sonTarih: "20.09.2026", kalanGun: 37, durum: "bekliyor", puan: null },
  { ad: "T. Aksoy", dep: "Bilgi İşlem", yaka: "beyaz", iseGiris: "10.08.2025", asama: "İlk 1 Yıl (Kıdem Eşiği)", sonTarih: "10.08.2026", kalanGun: 4, durum: "acil", puan: null },
  { ad: "H. Polat", dep: "Boya-Apre", yaka: "mavi", iseGiris: "05.02.2026", asama: "İlk 6 Ay", sonTarih: "05.08.2026", kalanGun: -9, durum: "gecikti", puan: null },
  { ad: "S. Yavuz", dep: "Muhasebe & Finans", yaka: "beyaz", iseGiris: "25.07.2025", asama: "İlk 1 Yıl (Kıdem Eşiği)", sonTarih: "25.07.2026", kalanGun: -20, durum: "gecikti", puan: null },
  { ad: "Z. Er", dep: "Lojistik & Tedarik", yaka: "beyaz", iseGiris: "12.06.2025", asama: "Tamamlandı", sonTarih: "12.06.2026", kalanGun: null, durum: "devam", puan: { yetkinlik: 85, uyum: 82, performans: 79 } },
  { ad: "C. Doğan", dep: "Kalite (Ofis)", yaka: "beyaz", iseGiris: "01.05.2025", asama: "Tamamlandı", sonTarih: "01.05.2026", kalanGun: null, durum: "sonlandirildi", puan: { yetkinlik: 45, uyum: 38, performans: 40 } },
];

const ortalamaPuan = (p) => (p ? Math.round((p.yetkinlik + p.uyum + p.performans) / 3) : null);

const DURUM_STIL = {
  bekliyor: { label: "Bekliyor", bg: "#F5E9CC", fg: "#9C7418" },
  acil: { label: "ACİL — Karar Bekliyor", bg: "#F3D6CE", fg: "#A8402E" },
  gecikti: { label: "Süre Geçti", bg: "#EAC5BC", fg: "#7A2C1E" },
  devam: { label: "Devam — Onaylandı", bg: "#DCEADF", fg: "#3F6B4F" },
  sonlandirildi: { label: "Sonlandırıldı", bg: "#E6E6E6", fg: "#555" },
};

// ---------- Vardiya & Mesai Yükü (mavi yaka) ----------
const YASAL_MESAI_LIMIT = 270; // saat/yıl
const mesaiVerisi = [
  { ad: "M. Yıldız", dep: "Konfeksiyon", yillikMesai: 312, geceVardiyasi: 18, haftasonuMesai: 9 },
  { ad: "A. Kaya", dep: "Dokuma", yillikMesai: 298, geceVardiyasi: 22, haftasonuMesai: 11 },
  { ad: "B. Arslan", dep: "Konfeksiyon", yillikMesai: 288, geceVardiyasi: 20, haftasonuMesai: 10 },
  { ad: "D. Taş", dep: "Boya-Apre", yillikMesai: 265, geceVardiyasi: 16, haftasonuMesai: 8 },
  { ad: "S. Demir", dep: "Boya-Apre", yillikMesai: 245, geceVardiyasi: 14, haftasonuMesai: 6 },
  { ad: "C. Aydemir", dep: "Konfeksiyon", yillikMesai: 205, geceVardiyasi: 9, haftasonuMesai: 5 },
  { ad: "O. Er", dep: "Dokuma", yillikMesai: 190, geceVardiyasi: 8, haftasonuMesai: 4 },
  { ad: "Y. Bulut", dep: "Saha Kalite Kontrol", yillikMesai: 150, geceVardiyasi: 5, haftasonuMesai: 3 },
];

// ---------- Kritik Rol Risk Haritası & Yetkinlik Matrisi ----------
const kritikRoller = [
  { rol: "Dokuma Usta Başı", mevcut: "O. Er", yedekSayisi: 0, yedekDurum: "Yedek Yok", risk: "kritik" },
  { rol: "Jakarlı Dokuma Teknisyeni", mevcut: "S. Demir", yedekSayisi: 0, yedekDurum: "Yedek Yok", risk: "kritik" },
  { rol: "Konfeksiyon Usta Başı", mevcut: "B. Arslan", yedekSayisi: 1, yedekDurum: "Gelişmekte (~6 ay)", risk: "orta" },
  { rol: "Boya-Apre Operatörü (Kimyasal)", mevcut: "D. Taş", yedekSayisi: 2, yedekDurum: "Hazır", risk: "düşük" },
];

const makineListesi = ["Jakarlı Dokuma", "Dijital Baskı", "Boya Kazanı", "Overlok", "Kalite Ölçüm"];
const yetkinlikMatrisi = [
  { ad: "O. Er", dep: "Dokuma", makineler: [true, false, false, true, true] },
  { ad: "S. Demir", dep: "Boya-Apre", makineler: [true, true, false, false, true] },
  { ad: "B. Arslan", dep: "Konfeksiyon", makineler: [false, false, false, true, true] },
  { ad: "D. Taş", dep: "Boya-Apre", makineler: [false, false, true, false, true] },
  { ad: "C. Aydemir", dep: "Konfeksiyon", makineler: [false, true, false, true, false] },
];

// ---------- Çıkış Mülakatı Kök Neden Analizi ----------
const cikisNedenleri = [
  { neden: "Ücret Yetersizliği", mavi: 34, beyaz: 18 },
  { neden: "Vardiya / Mesai Saatleri", mavi: 28, beyaz: 6 },
  { neden: "Servis / Ulaşım", mavi: 15, beyaz: 4 },
  { neden: "Yönetici Tutumu", mavi: 12, beyaz: 14 },
  { neden: "Kariyer Yolu Yetersizliği", mavi: 6, beyaz: 40 },
  { neden: "Diğer", mavi: 5, beyaz: 18 },
];

// ---------- Periyodik ISG Taramaları ----------
const isgTaramalari = [
  { ad: "O. Er", dep: "Dokuma", tur: "Odyometri (İşitme)", sonTarih: "14.08.2026", kalanGun: -1 },
  { ad: "M. Yıldız", dep: "Konfeksiyon", tur: "Odyometri (İşitme)", sonTarih: "20.08.2026", kalanGun: 5 },
  { ad: "D. Taş", dep: "Boya-Apre", tur: "Akciğer Grafisi", sonTarih: "28.08.2026", kalanGun: 13 },
  { ad: "S. Demir", dep: "Boya-Apre", tur: "Solunum Fonksiyon Testi", sonTarih: "02.09.2026", kalanGun: 18 },
];

// ---------- Pazartesi/Cuma Devamsızlık Sinyali ----------
const supheliDevamsizlik = [
  { ad: "C. Aydemir", dep: "Konfeksiyon", pazartesi: 5, cuma: 4, toplamTekGunluk: 11, oran: 82 },
  { ad: "Y. Bulut", dep: "Saha Kalite Kontrol", pazartesi: 2, cuma: 2, toplamTekGunluk: 6, oran: 67 },
];

// ---------- Self-servis chatbot demo diyaloğu ----------
const chatbotOrnekleri = [
  { soru: "Kaç gün iznim kaldı?", yanit: "2026 için 14 gün izin hakkınız kaldı, son kullanım: 2 gün önce onaylandı." },
  { soru: "Bordromu gönderebilir misin?", yanit: "Temmuz 2026 bordronuz kayıtlı e-postanıza gönderildi." },
  { soru: "Servis bu akşam kaçta kalkıyor?", yanit: "Bu akşam Organize Sanayi hattı 18:00 ve 19:30'da kalkıyor." },
];

// ---------- Arabuluculuk Kazanç Tablosu ----------
const arabuluculukVerisi = [
  { ad: "C. Doğan", dep: "Kalite (Ofis)", tarih: "15.05.2026", odenenTutar: 38000, tahminiDavaMaliyeti: 145000 },
  { ad: "E. Yaman", dep: "Konfeksiyon", tarih: "22.03.2026", odenenTutar: 22000, tahminiDavaMaliyeti: 68000 },
  { ad: "F. Kılıç", dep: "Lojistik & Tedarik", tarih: "10.01.2026", odenenTutar: 31000, tahminiDavaMaliyeti: 95000 },
];

// ---------- Zorunlu İstihdam (Engelli) Takibi ----------
// Not: Özel sektörde 50+ çalışanı olan işyerleri için %3 engelli çalıştırma zorunluluğu vardır (İş Kanunu m.30).
// Eski hükümlü/terör mağduru çalıştırma zorunluluğu ise yalnızca kamu işyerleri için geçerlidir; özel sektörde isteğe bağlıdır.
const zorunluIstihdam = {
  toplamKadro: 150,
  kontenjanOrani: 0.03,
  mevcutEngelliSayisi: 3,
  aylikCezaRiskiTahmini: 84000, // demo/tahmini, güncel SGK tebliğine göre teyit edilmeli
};

const finansalOzet = {
  aylikIsgucuMaliyeti: 5100000, // TL, demo — bordro + SGK + yan haklar toplamı
  aylikCiro: 28500000, // TL, demo
};

// ---------- Yıllık Karşılaştırma (geçen yıla göre) ----------
const yillikKiyas = {
  maviDevirGecenYil: 49, maviDevirBuYil: 56,
  beyazDevirGecenYil: 15, beyazDevirBuYil: 13,
  devamsizlikGecenYil: 3.4, devamsizlikBuYil: 3.1,
};

// ---------- Sektör Benchmark ----------
const sektorBenchmark = [
  { metrik: "Mavi Yaka Yıllık Devir", firma: 56, sektor: 45, birim: "%" },
  { metrik: "Beyaz Yaka Yıllık Devir", firma: 13, sektor: 18, birim: "%" },
  { metrik: "Ortalama Devamsızlık", firma: 3.1, sektor: 4.2, birim: "%" },
];

// ---------- Zorunlu Eğitim Takibi ----------
const egitimTakibi = [
  { ad: "B. Arslan", dep: "Konfeksiyon", egitim: "Yangın Eğitimi (Yenileme)", sonTarih: "25.08.2026", kalanGun: 6 },
  { ad: "D. Taş", dep: "Boya-Apre", egitim: "İş Güvenliği Temel Eğitimi", sonTarih: "02.09.2026", kalanGun: 14 },
  { ad: "O. Er", dep: "Dokuma", egitim: "İlkyardım Sertifikası (Yenileme)", sonTarih: "12.08.2026", kalanGun: -7 },
  { ad: "C. Aydemir", dep: "Konfeksiyon", egitim: "Yangın Eğitimi (Yenileme)", sonTarih: "30.09.2026", kalanGun: 42 },
];

// ---------- Basit Memnuniyet Anketi (1-10, aylık, anonim) ----------
const memnuniyetTrend = [
  { ay: "Mar", puan: 6.8 }, { ay: "Nis", puan: 6.5 }, { ay: "May", puan: 6.9 },
  { ay: "Haz", puan: 6.2 }, { ay: "Tem", puan: 6.0 }, { ay: "Ağu", puan: 6.4 },
];
const memnuniyetKatilim = 87; // % katılım oranı, demo

// ---------- Rol Bazlı Görünürlük (demo) ----------
const gorunumModlari = ["Patron / Genel Müdür", "Departman Müdürü (Konfeksiyon)"];

// ---------- Otomatik Hatırlatma Ayarları (demo, statik önizleme) ----------
const otomatikHatirlatmalar = [
  { tur: "Kıdem Eşiği Kararı", aktif: true, kanal: "E-posta", ne_zaman: "Son tarihten 30 gün önce" },
  { tur: "ISG Tarama Süresi", aktif: true, kanal: "E-posta", ne_zaman: "Son tarihten 14 gün önce" },
  { tur: "Zorunlu Eğitim Yenileme", aktif: true, kanal: "E-posta", ne_zaman: "Son tarihten 14 gün önce" },
  { tur: "Fazla Mesai Limit Uyarısı", aktif: false, kanal: "E-posta", ne_zaman: "Limitin %90'ına ulaşınca" },
];

// ---------- Audit Log (kim, ne zaman, ne değiştirdi) ----------
const auditLog = [
  { kullanici: "İK - E. Korkmaz", islem: "T. Aksoy için değerlendirme puanı girildi", tarih: "18.08.2026 14:22" },
  { kullanici: "İK - E. Korkmaz", islem: "Ağustos devamsızlık Excel'i içe aktarıldı (150 satır)", tarih: "17.08.2026 09:05" },
  { kullanici: "Genel Müdür", islem: "Patron Raporu PDF olarak indirildi", tarih: "15.08.2026 18:40" },
  { kullanici: "İK - E. Korkmaz", islem: "C. Doğan dosyası 'Sonlandırıldı' olarak güncellendi", tarih: "01.05.2026 11:12" },
];

const maliyet = {
  maviIsealimBirim: 15000,
  beyazIsealimBirim: 45000,
  maviYillikDevirSayisi: 22,
  beyazYillikDevirSayisi: 12,
};

const fmtTL = (n) => n.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export default function IKKomutaMerkezi() {
  const [filtre, setFiltre] = useState("tumu");
  const [sube, setSube] = useState("Tümü");
  const [gorunum, setGorunum] = useState(gorunumModlari[0]);
  const [raporAcik, setRaporAcik] = useState(false);

  const isMudurGorunumu = gorunum !== gorunumModlari[0];
  const mudurDepartmani = "Konfeksiyon";

  const filtreliDep = useMemo(
    () =>
      departmanlar
        .filter((d) => filtre === "tumu" || d.yaka === filtre)
        .filter((d) => sube === "Tümü" || d.sube === sube)
        .filter((d) => !isMudurGorunumu || d.ad === mudurDepartmani),
    [filtre, sube, isMudurGorunumu]
  );

  const kadroGoruntulenen = filtreliDep.reduce((s, d) => s + d.kisi, 0);
  const toplamKisi = departmanlar.reduce((s, d) => s + d.kisi, 0);
  const maviKisi = departmanlar.filter((d) => d.yaka === "mavi").reduce((s, d) => s + d.kisi, 0);
  const beyazKisi = toplamKisi - maviKisi;

  const ortDevamsizlik = (
    filtreliDep.reduce((s, d) => s + d.devamsizlik * d.kisi, 0) /
    filtreliDep.reduce((s, d) => s + d.kisi, 0)
  ).toFixed(1);

  const toplamDevirMaliyet =
    maliyet.maviYillikDevirSayisi * maliyet.maviIsealimBirim +
    maliyet.beyazYillikDevirSayisi * maliyet.beyazIsealimBirim;

  const kidemEsigiYaklasan = degerlendirmeler.filter(
    (d) => d.asama.includes("1 Yıl") && (d.durum === "acil" || d.durum === "gecikti" || (d.kalanGun !== null && d.kalanGun <= 30))
  ).length;

  const bekleyenDegerlendirme = degerlendirmeler.filter((d) => ["bekliyor", "acil", "gecikti"].includes(d.durum)).length;

  const siraliDegerlendirmeler = [...degerlendirmeler].sort((a, b) => {
    const rank = { gecikti: 0, acil: 1, bekliyor: 2, devam: 3, sonlandirildi: 4 };
    if (rank[a.durum] !== rank[b.durum]) return rank[a.durum] - rank[b.durum];
    return (a.kalanGun ?? 999) - (b.kalanGun ?? 999);
  });

  const pieData = [
    { name: "Beyaz Yaka", value: beyazKisi, color: COLORS.denim },
    { name: "Mavi Yaka", value: maviKisi, color: COLORS.thread },
  ];

  const arabuluculukToplamTasarruf = arabuluculukVerisi.reduce((s, a) => s + (a.tahminiDavaMaliyeti - a.odenenTutar), 0);
  const gerekliKontenjan = Math.round(zorunluIstihdam.toplamKadro * zorunluIstihdam.kontenjanOrani);
  const kontenjanAcigi = Math.max(0, gerekliKontenjan - zorunluIstihdam.mevcutEngelliSayisi);
  const isgucuMaliyetOrani = ((finansalOzet.aylikIsgucuMaliyeti / finansalOzet.aylikCiro) * 100).toFixed(1);

  if (raporAcik) {
    return (
      <ExecutiveSummary
        onGeri={() => setRaporAcik(false)}
        toplamKisi={toplamKisi}
        isgucuMaliyeti={finansalOzet.aylikIsgucuMaliyeti}
        isgucuMaliyetOrani={isgucuMaliyetOrani}
        toplamDevirMaliyet={toplamDevirMaliyet}
        arabuluculukToplamTasarruf={arabuluculukToplamTasarruf}
        kidemEsigiYaklasan={kidemEsigiYaklasan}
        kontenjanAcigi={kontenjanAcigi}
        cezaRiski={zorunluIstihdam.aylikCezaRiskiTahmini}
      />
    );
  }

  return (
    <div style={{ background: COLORS.paper, minHeight: "100vh", fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", color: COLORS.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        .disp { font-family: 'Archivo', ui-sans-serif, sans-serif; letter-spacing: -0.01em; }
        .mono { font-family: 'Space Mono', ui-monospace, monospace; }
        .thread-rule { background: repeating-linear-gradient(90deg, ${COLORS.thread} 0px, ${COLORS.thread} 6px, transparent 6px, transparent 12px); height: 3px; }
        .card { background: #fff; border: 1px solid ${COLORS.line}; border-radius: 4px; }
        .tab-btn { transition: all 0.15s ease; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${COLORS.line}`, padding: "28px 32px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="mono" style={{ fontSize: 11, color: COLORS.threadDeep, letterSpacing: "0.12em", marginBottom: 6 }}>
              ANADOLU TEKSTİL A.Ş. — İNSAN KAYNAKLARI
            </div>
            <h1 className="disp" style={{ fontSize: 30, fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
              İK Komuta Merkezi
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
              <Eye size={13} color="#6b7280" />
              <select
                value={gorunum}
                onChange={(e) => setGorunum(e.target.value)}
                className="mono"
                style={{ padding: "5px 9px", fontSize: 11, fontWeight: 700, borderRadius: 3, border: `1px solid ${COLORS.line}`, background: "#fff", color: COLORS.ink, cursor: "pointer" }}
              >
                {gorunumModlari.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 11, color: "#6b7280", marginBottom: 10 }}>
              RAPOR DÖNEMİ<br /><span style={{ color: COLORS.ink, fontWeight: 700 }}>Eylül 2025 – Ağustos 2026</span>
            </div>
            {!isMudurGorunumu && (
              <button
                onClick={() => setRaporAcik(true)}
                className="mono"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", fontSize: 11.5, fontWeight: 700,
                  background: COLORS.ink, color: COLORS.paper, border: "none", borderRadius: 3, cursor: "pointer",
                }}
              >
                <FileDown size={13} /> Patron Raporu Al (PDF)
              </button>
            )}
          </div>
        </div>
        {isMudurGorunumu && (
          <div className="mono" style={{ marginTop: 14, fontSize: 11, color: COLORS.threadDeep, background: "#F5E9CC", padding: "8px 12px", borderRadius: 3, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Eye size={12} /> DEPARTMAN MÜDÜRÜ GÖRÜNÜMÜ — Sadece {mudurDepartmani} verileri gösteriliyor, şirket geneli finansal veriler gizli
          </div>
        )}
        <div className="thread-rule" style={{ marginTop: 20, borderRadius: 2 }} />
      </div>

      <div style={{ padding: "24px 32px 48px", maxWidth: 1180, margin: "0 auto" }}>

        {/* KPI kartları */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 28 }}>
          <KpiCard icon={<Users size={16} />} label="Toplam Çalışan" value={toplamKisi} sub={`${beyazKisi} beyaz · ${maviKisi} mavi yaka`} />
          <KpiCard icon={<TrendingUp size={16} />} label="Mavi Yaka Yıllık Devir" value="%56" sub="Sektör ortalaması ~%45" tone="brick" />
          <KpiCard icon={<TrendingDown size={16} />} label="Beyaz Yaka Yıllık Devir" value="%13" sub="Sektör ortalaması ~%18" tone="pine" />
          <KpiCard icon={<Wallet size={16} />} label="Yıllık Devir Maliyeti" value={fmtTL(toplamDevirMaliyet)} sub="İşe alım + oryantasyon + verim kaybı" tone="thread" />
          <KpiCard icon={<ShieldAlert size={16} />} label="Kıdem Eşiğine ≤30 Gün" value={kidemEsigiYaklasan} sub={`${bekleyenDegerlendirme} değerlendirme karar bekliyor`} tone="brick" />
        </div>

        {/* Filtre */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
          {[
            { k: "tumu", label: "Tüm Kadro" },
            { k: "beyaz", label: "Beyaz Yaka" },
            { k: "mavi", label: "Mavi Yaka" },
          ].map((f) => (
            <button
              key={f.k}
              onClick={() => setFiltre(f.k)}
              className="tab-btn mono"
              style={{
                padding: "7px 16px",
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 3,
                border: `1px solid ${filtre === f.k ? COLORS.ink : COLORS.line}`,
                background: filtre === f.k ? COLORS.ink : "transparent",
                color: filtre === f.k ? COLORS.paper : COLORS.ink,
                cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          ))}
          <div style={{ width: 1, height: 20, background: COLORS.line, margin: "0 4px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Building2 size={13} color="#6b7280" />
            <select
              value={sube}
              onChange={(e) => setSube(e.target.value)}
              className="mono"
              style={{
                padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 3,
                border: `1px solid ${COLORS.line}`, background: "#fff", color: COLORS.ink, cursor: "pointer",
              }}
            >
              {subeListesi.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {sube !== "Tümü" && (
            <span style={{ fontSize: 11.5, color: "#6b7280" }}>{kadroGoruntulenen} kişi görüntüleniyor</span>
          )}
        </div>


        {/* Devir trendi */}
        <SectionCard title="Aylık Devir Hızı Trendi" sub="Mavi yaka, beyaz yakanın ~4 katı hızla kayboluyor — Mart'tan itibaren ivme kazanıyor">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={aylikDevir} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={COLORS.line} vertical={false} />
              <XAxis dataKey="ay" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: `1px solid ${COLORS.line}` }} />
              <Line type="monotone" dataKey="mavi" name="Mavi Yaka" stroke={COLORS.thread} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="beyaz" name="Beyaz Yaka" stroke={COLORS.denim} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginTop: 16 }}>
          {/* Departman devamsızlık */}
          <SectionCard title="Departman Bazında Devamsızlık Oranı" sub={`Filtrelenmiş ortalama: %${ortDevamsizlik}`}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={filtreliDep} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={COLORS.line} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} unit="%" />
                <YAxis type="category" dataKey="ad" width={130} tick={{ fontSize: 11, fill: COLORS.ink }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: `1px solid ${COLORS.line}` }} />
                <Bar dataKey="devamsizlik" name="Devamsızlık %" radius={[0, 3, 3, 0]}>
                  {filtreliDep.map((d, i) => (
                    <Cell key={i} fill={d.yaka === "mavi" ? COLORS.thread : COLORS.denim} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          {/* Kadro dağılımı */}
          <SectionCard title="Kadro Kompozisyonu" sub="150 çalışan">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {pieData.map((p, i) => <Cell key={i} fill={p.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: `1px solid ${COLORS.line}` }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 8, padding: "10px 12px", background: COLORS.paperDeep, borderRadius: 4, fontSize: 12, lineHeight: 1.5 }}>
              Mavi yaka kadronun <b>%27'sini</b> oluştururken, yıllık devrin <b>%65'ini</b> tek başına yaratıyor.
            </div>
          </SectionCard>
        </div>

        {/* Riskli çalışanlar */}
        <SectionCard
          title="Ayrılma Riski Yüksek Çalışanlar"
          sub="Devamsızlık, kıdem ve fazla mesai sinyallerinden hesaplanan risk skoru"
          icon={<AlertTriangle size={15} color={COLORS.brick} />}
          style={{ marginTop: 16 }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                  {["Çalışan", "Departman", "Yaka", "Risk Skoru", "Ana Sinyal", "Tutanak / Ödül"].map((h) => (
                    <th key={h} className="mono" style={{ textAlign: "left", padding: "8px 10px", fontSize: 10.5, color: "#6b7280", fontWeight: 700, letterSpacing: "0.04em" }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {riskliCalisanlar.map((c, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                    <td style={{ padding: "9px 10px", fontWeight: 600 }}>{c.ad}</td>
                    <td style={{ padding: "9px 10px", color: "#4b5563" }}>{c.dep}</td>
                    <td style={{ padding: "9px 10px" }}>
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                        background: c.yaka === "mavi" ? "#F5E9CC" : "#DCE3EE",
                        color: c.yaka === "mavi" ? COLORS.threadDeep : COLORS.denim,
                      }}>
                        {c.yaka === "mavi" ? "MAVİ" : "BEYAZ"}
                      </span>
                    </td>
                    <td style={{ padding: "9px 10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 46, height: 6, background: COLORS.paperDeep, borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${c.skor}%`, height: "100%", background: c.skor > 80 ? COLORS.brick : c.skor > 65 ? COLORS.thread : COLORS.pine }} />
                        </div>
                        <span className="mono" style={{ fontWeight: 700 }}>{c.skor}</span>
                      </div>
                    </td>
                    <td style={{ padding: "9px 10px", color: "#4b5563" }}>{c.sebep}</td>
                    <td style={{ padding: "9px 10px" }}>
                      {c.tutanakSayisi > 0 && (
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: "#F3D6CE", color: COLORS.brick, marginRight: 4 }}>
                          {c.tutanakSayisi} Tutanak
                        </span>
                      )}
                      {c.odullu && (
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: "#DCEADF", color: COLORS.pine }}>
                          🏆 Ödüllü
                        </span>
                      )}
                      {!c.tutanakSayisi && !c.odullu && <span style={{ color: "#9ca3af", fontSize: 11.5 }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mono" style={{ fontSize: 10.5, color: "#6b7280", marginTop: 18, marginBottom: 8, letterSpacing: "0.04em" }}>TUTANAK KAYITLARI</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {tutanakKayitlari.map((t, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 10px", background: COLORS.paperDeep, borderRadius: 4, fontSize: 12 }}>
                <span><b>{t.ad}</b> <span style={{ color: "#9ca3af" }}>· {t.dep}</span> — {t.tur}: {t.aciklama}</span>
                <span className="mono" style={{ color: "#6b7280", flexShrink: 0 }}>{t.tarih}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, padding: "10px 12px", background: "#DCEADF", borderRadius: 4, fontSize: 12, lineHeight: 1.5 }}>
            <b>Dikkat çeken içgörü:</b> B. Arslan bu yıl "Yılın Ekip Lideri" ödülünü aldı ama yine de ayrılma riski listesinde — tutanağı yok, performansı iyi, ama sebep "ücret bandı emsal altı". Ödül tek başına bağlılığı garanti etmiyor; ücret dengesizliği ödüllü personeli bile kaybettirebilir.
          </div>
        </SectionCard>

        {/* Deneme & kıdem öncesi değerlendirme takibi */}
        <SectionCard
          title="Deneme Süresi & Kıdem Öncesi Değerlendirme Takibi"
          sub="Kıdem tazminatı hakkı 1. yılda doğar — karar bu tarihten önce netleşmeli. En acil olan en üstte."
          icon={<ShieldAlert size={15} color={COLORS.brick} />}
          style={{ marginTop: 16 }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                  {["Çalışan", "Departman", "İşe Giriş", "Aşama", "Son Tarih", "Kalan Gün", "Durum", "Yetkinlik / Uyum / Performans"].map((h) => (
                    <th key={h} className="mono" style={{ textAlign: "left", padding: "8px 10px", fontSize: 10.5, color: "#6b7280", fontWeight: 700, letterSpacing: "0.04em" }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {siraliDegerlendirmeler.map((d, i) => {
                  const stil = DURUM_STIL[d.durum];
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${COLORS.line}`, background: d.durum === "gecikti" ? "#FBF2EF" : "transparent" }}>
                      <td style={{ padding: "9px 10px", fontWeight: 600 }}>{d.ad}</td>
                      <td style={{ padding: "9px 10px", color: "#4b5563" }}>{d.dep}</td>
                      <td style={{ padding: "9px 10px", color: "#4b5563" }} className="mono">{d.iseGiris}</td>
                      <td style={{ padding: "9px 10px" }}>
                        <span style={{
                          fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                          background: d.asama.includes("Kıdem") ? "#F3D6CE" : COLORS.paperDeep,
                          color: d.asama.includes("Kıdem") ? COLORS.brick : COLORS.ink,
                        }}>
                          {d.asama}
                        </span>
                      </td>
                      <td style={{ padding: "9px 10px", color: "#4b5563" }} className="mono">{d.sonTarih}</td>
                      <td style={{ padding: "9px 10px" }} className="mono">
                        {d.kalanGun === null ? "—" : d.kalanGun < 0 ? `${Math.abs(d.kalanGun)} gün geçti` : `${d.kalanGun} gün`}
                      </td>
                      <td style={{ padding: "9px 10px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 10, background: stil.bg, color: stil.fg }}>
                          {d.durum === "devam" && <CheckCircle2 size={12} />}
                          {d.durum === "sonlandirildi" && <XCircle size={12} />}
                          {stil.label}
                        </span>
                      </td>
                      <td style={{ padding: "9px 10px" }}>
                        {d.puan ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span className="mono" style={{ fontSize: 11, color: "#4b5563" }}>
                              Y:{d.puan.yetkinlik} · U:{d.puan.uyum} · P:{d.puan.performans}
                            </span>
                            <span className="disp" style={{
                              fontSize: 13, fontWeight: 800,
                              color: ortalamaPuan(d.puan) >= 60 ? COLORS.pine : COLORS.brick,
                            }}>
                              Ort. {ortalamaPuan(d.puan)}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: "#9ca3af", fontSize: 12 }}>Değerlendirme bekleniyor</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, padding: "10px 12px", background: COLORS.paperDeep, borderRadius: 4, fontSize: 12, lineHeight: 1.5 }}>
            <b>S. Yavuz</b> ve <b>H. Polat</b> için değerlendirme son tarihi geçmiş durumda — kıdem eşiğini geçen dosyalarda karar gecikmesi şirket için tazminat riski doğurur, öncelikli aksiyon gerekiyor. Değerlendirme, üç kriterin ortalaması üzerinden yapılır: <b>Yetkinlik</b> (iş bilgisi/beceri), <b>Uyum</b> (ekip/kültür) ve <b>Performans</b> (üretkenlik/hedef gerçekleştirme).
          </div>
        </SectionCard>

        {/* Maliyet özeti */}
        <SectionCard title="İşe Alım Maliyet Özeti" sub="Ortalama birim maliyet × yıllık devir sayısı" icon={<Clock size={15} />} style={{ marginTop: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <MiniStat label="Mavi Yaka Birim İşe Alım" value={fmtTL(maliyet.maviIsealimBirim)} />
            <MiniStat label="Mavi Yaka Yıllık Devir Adedi" value={maliyet.maviYillikDevirSayisi} />
            <MiniStat label="Beyaz Yaka Birim İşe Alım" value={fmtTL(maliyet.beyazIsealimBirim)} />
            <MiniStat label="Beyaz Yaka Yıllık Devir Adedi" value={maliyet.beyazYillikDevirSayisi} />
          </div>
          <div className="thread-rule" style={{ margin: "16px 0", borderRadius: 2 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 13, color: "#4b5563" }}>Toplam tahmini yıllık kayıp</span>
            <span className="disp" style={{ fontSize: 26, fontWeight: 800, color: COLORS.brick }}>{fmtTL(toplamDevirMaliyet)}</span>
          </div>
        </SectionCard>

        {/* Arabuluculuk Kazanç Tablosu */}
        <SectionCard
          title="Arabuluculuk Kazanç Tablosu"
          sub="Dava yerine arabulucuda anlaşılan dosyalarda engellenen olası dava maliyeti"
          icon={<Scale size={15} color={COLORS.pine} />}
          style={{ marginTop: 16 }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                  {["Çalışan", "Departman", "Anlaşma Tarihi", "Ödenen Tutar", "Tahmini Dava Maliyeti", "Sağlanan Tasarruf"].map((h) => (
                    <th key={h} className="mono" style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, color: "#6b7280", fontWeight: 700, letterSpacing: "0.04em" }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {arabuluculukVerisi.map((a, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                    <td style={{ padding: "9px 10px", fontWeight: 600 }}>{a.ad}</td>
                    <td style={{ padding: "9px 10px", color: "#4b5563" }}>{a.dep}</td>
                    <td style={{ padding: "9px 10px", color: "#4b5563" }} className="mono">{a.tarih}</td>
                    <td style={{ padding: "9px 10px" }} className="mono">{fmtTL(a.odenenTutar)}</td>
                    <td style={{ padding: "9px 10px", color: "#4b5563" }} className="mono">{fmtTL(a.tahminiDavaMaliyeti)}</td>
                    <td style={{ padding: "9px 10px", fontWeight: 700, color: COLORS.pine }} className="mono">{fmtTL(a.tahminiDavaMaliyeti - a.odenenTutar)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="thread-rule" style={{ margin: "16px 0", borderRadius: 2 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 13, color: "#4b5563" }}>Toplam sağlanan tasarruf (12 ay)</span>
            <span className="disp" style={{ fontSize: 26, fontWeight: 800, color: COLORS.pine }}>{fmtTL(arabuluculukToplamTasarruf)}</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "#9ca3af" }}>
            Tahmini dava maliyeti; işe iade/kıdem-ihbar farkı, avukatlık ücreti, faiz ve yargılama giderleri baz alınarak İK/Hukuk tarafından hesaplanmalıdır — burada demo amaçlı gösterilmiştir.
          </div>
        </SectionCard>

        {/* Zorunlu İstihdam Takibi */}
        <SectionCard
          title="Zorunlu İstihdam (Engelli Çalışan) Takibi"
          sub="İş Kanunu m.30 — 50+ çalışanlı işyerlerinde %3 engelli çalıştırma zorunluluğu"
          icon={<ClipboardCheck size={15} color={kontenjanAcigi > 0 ? COLORS.brick : COLORS.pine} />}
          style={{ marginTop: 16 }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <MiniStat label="Toplam Kadro" value={zorunluIstihdam.toplamKadro} />
            <MiniStat label="Yasal Kontenjan (%3)" value={`${gerekliKontenjan} kişi`} />
            <MiniStat label="Mevcut Engelli Çalışan" value={zorunluIstihdam.mevcutEngelliSayisi} />
            <div style={{ background: kontenjanAcigi > 0 ? "#F3D6CE" : "#DCEADF", borderRadius: 4, padding: "12px 14px" }}>
              <div className="mono" style={{ fontSize: 10, color: kontenjanAcigi > 0 ? COLORS.brick : COLORS.pine, marginBottom: 4, letterSpacing: "0.04em" }}>KONTENJAN AÇIĞI</div>
              <div className="disp" style={{ fontSize: 18, fontWeight: 700, color: kontenjanAcigi > 0 ? COLORS.brick : COLORS.pine }}>
                {kontenjanAcigi > 0 ? `${kontenjanAcigi} kişi eksik` : "Kontenjan dolu"}
              </div>
            </div>
          </div>
          {kontenjanAcigi > 0 && (
            <div style={{ marginTop: 12, padding: "10px 12px", background: "#FBF2EF", borderRadius: 4, fontSize: 12, lineHeight: 1.5 }}>
              <AlertTriangle size={13} color={COLORS.brick} style={{ display: "inline", marginRight: 4, verticalAlign: -2 }} />
              Mevcut açıkla aylık tahmini idari para cezası riski: <b>{fmtTL(zorunluIstihdam.aylikCezaRiskiTahmini)}</b>. Rakam demo/tahminidir, güncel SGK tebliğine göre teyit edilmelidir.
            </div>
          )}
          <div style={{ marginTop: 10, fontSize: 11, color: "#9ca3af" }}>
            Not: Eski hükümlü/terör mağduru çalıştırma zorunluluğu Türkiye'de yalnızca kamu işyerleri için geçerlidir; özel sektörde isteğe bağlıdır ve bu panelde ayrı bir yasal kontenjan olarak izlenmez.
          </div>
        </SectionCard>

        {/* SGK Teşvik Hatırlatıcısı */}
        <SectionCard
          title="SGK Teşvik Hatırlatıcısı"
          sub="Firmanızın yararlanabileceği güncel istihdam teşvikleri — uygun olanlar otomatik işaretlenir"
          icon={<Landmark size={15} color={COLORS.pine} />}
          style={{ marginTop: 16 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sgkTesvikleri.map((t, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 4, background: t.uygun ? COLORS.paperDeep : "#F4F4F2",
                opacity: t.uygun ? 1 : 0.65,
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {t.uygun ? <CheckCircle2 size={14} color={COLORS.pine} /> : <XCircle size={14} color="#9ca3af" />}
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{t.ad}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 2, marginLeft: 20 }}>{t.aciklama}</div>
                </div>
                {t.uygun && (
                  <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: COLORS.pine, whiteSpace: "nowrap" }}>
                    ~{fmtTL(t.tahminiYillikTasarruf)}/yıl
                  </span>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "#9ca3af" }}>
            Rakamlar demo amaçlıdır; kesin uygunluk ve tutar için güncel SGK tebliği ve mali müşavir teyidi gereklidir.
          </div>
        </SectionCard>

        {/* Birikmiş Yıllık İzin Takibi */}
        <SectionCard
          title="Birikmiş Yıllık İzin Takibi"
          sub="Çok fazla izni biriken personel için kullandırma planı gerekir — hem operasyonel hem mali risk taşır"
          icon={<Palmtree size={15} color={COLORS.brick} />}
          style={{ marginTop: 16 }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                  {["Çalışan", "Departman", "Hak Edilen", "Kullanılan", "Kalan (Birikmiş)", "Durum", "Tahmini Yükümlülük"].map((h) => (
                    <th key={h} className="mono" style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, color: "#6b7280", fontWeight: 700, letterSpacing: "0.04em" }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...izinBakiyeleri].sort((a, b) => b.kalanGun - a.kalanGun).map((i, idx) => {
                  const durum = i.kalanGun >= 30 ? "kritik" : i.kalanGun >= 15 ? "dikkat" : "normal";
                  const stil = durum === "kritik"
                    ? { bg: "#F3D6CE", fg: COLORS.brick, label: "ACİL — Kullandırılmalı" }
                    : durum === "dikkat"
                    ? { bg: "#F5E9CC", fg: COLORS.threadDeep, label: "Planlanmalı" }
                    : { bg: "#DCEADF", fg: COLORS.pine, label: "Normal" };
                  const yukumluluk = i.kalanGun * GUNLUK_UCRET_TAHMIN[i.yaka];
                  return (
                    <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.line}`, background: durum === "kritik" ? "#FBF2EF" : "transparent" }}>
                      <td style={{ padding: "9px 10px", fontWeight: 600 }}>{i.ad}</td>
                      <td style={{ padding: "9px 10px", color: "#4b5563" }}>{i.dep}</td>
                      <td style={{ padding: "9px 10px" }} className="mono">{i.hakEdilenGun} gün</td>
                      <td style={{ padding: "9px 10px" }} className="mono">{i.kullanilanGun} gün</td>
                      <td style={{ padding: "9px 10px", fontWeight: 700 }} className="mono">{i.kalanGun} gün</td>
                      <td style={{ padding: "9px 10px" }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: stil.bg, color: stil.fg }}>{stil.label}</span>
                      </td>
                      <td style={{ padding: "9px 10px", color: "#4b5563" }} className="mono">{fmtTL(yukumluluk)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, padding: "10px 12px", background: "#FBF2EF", borderRadius: 4, fontSize: 12, lineHeight: 1.5 }}>
            <b>M. Yıldız</b> (38 gün) ve <b>B. Arslan</b> (28 gün) için izin kullandırma planı acil — bu bakiye, ayrılık durumunda nakit olarak ödenmesi gereken bir yükümlülüktür. Yoğun olmayan bir döneme (örn. sezon arası) kullandırma planlanmalı.
          </div>
        </SectionCard>

        {/* Vardiya & Mesai Yükü */}
        <SectionCard
          title="Vardiya & Mesai Yükü (Mavi Yaka)"
          sub={`Yasal yıllık fazla mesai limiti: ${YASAL_MESAI_LIMIT} saat — limiti aşanlar kırmızı`}
          icon={<Moon size={15} color={COLORS.brick} />}
          style={{ marginTop: 16 }}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={mesaiVerisi} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={COLORS.line} vertical={false} />
              <XAxis dataKey="ad" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={{ stroke: COLORS.line }} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} unit="s" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: `1px solid ${COLORS.line}` }} />
              <Bar dataKey="yillikMesai" name="Yıllık Fazla Mesai (saat)" radius={[3, 3, 0, 0]}>
                {mesaiVerisi.map((m, i) => (
                  <Cell key={i} fill={m.yillikMesai > YASAL_MESAI_LIMIT ? COLORS.brick : COLORS.thread} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ overflowX: "auto", marginTop: 8 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                  {["Çalışan", "Departman", "Yıllık Fazla Mesai", "Gece Vardiyası", "Hafta Sonu Mesai", "Durum"].map((h) => (
                    <th key={h} className="mono" style={{ textAlign: "left", padding: "7px 9px", fontSize: 10, color: "#6b7280", fontWeight: 700, letterSpacing: "0.04em" }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...mesaiVerisi].sort((a, b) => b.yillikMesai - a.yillikMesai).map((m, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                    <td style={{ padding: "7px 9px", fontWeight: 600 }}>{m.ad}</td>
                    <td style={{ padding: "7px 9px", color: "#4b5563" }}>{m.dep}</td>
                    <td style={{ padding: "7px 9px" }} className="mono">
                      <span style={{ fontWeight: 700, color: m.yillikMesai > YASAL_MESAI_LIMIT ? COLORS.brick : COLORS.ink }}>{m.yillikMesai} sa</span>
                    </td>
                    <td style={{ padding: "7px 9px" }} className="mono">{m.geceVardiyasi}</td>
                    <td style={{ padding: "7px 9px" }} className="mono">{m.haftasonuMesai}</td>
                    <td style={{ padding: "7px 9px" }}>
                      {m.yillikMesai > YASAL_MESAI_LIMIT ? (
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: "#F3D6CE", color: COLORS.brick }}>LİMİT AŞILDI</span>
                      ) : m.yillikMesai > YASAL_MESAI_LIMIT - 30 ? (
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: "#F5E9CC", color: COLORS.threadDeep }}>YAKLAŞIYOR</span>
                      ) : (
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: "#DCEADF", color: COLORS.pine }}>NORMAL</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 10, padding: "10px 12px", background: COLORS.paperDeep, borderRadius: 4, fontSize: 12, lineHeight: 1.5 }}>
            <b>M. Yıldız</b> ve <b>A. Kaya</b> yasal limiti aştı, <b>B. Arslan</b> ve <b>D. Taş</b> limite yaklaşıyor. Bir sonraki vardiya planında gece/hafta sonu yükü <b>O. Er</b> ve <b>Y. Bulut</b>'a kaydırılarak dağılım dengelenebilir.
          </div>
        </SectionCard>

        {/* Kritik Rol Risk Haritası & Yetkinlik Matrisi */}
        <SectionCard
          title="Kritik Rol Risk Haritası & Yedekleme (Bench)"
          sub="Kritik banttaki bir ayrılış üretimi durdurabilir — yedeği olmayanlar önce görünür"
          icon={<GitBranch size={15} color={COLORS.denim} />}
          style={{ marginTop: 16 }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10, marginBottom: 18 }}>
            {kritikRoller.map((r, i) => {
              const renk = r.risk === "kritik" ? COLORS.brick : r.risk === "orta" ? COLORS.threadDeep : COLORS.pine;
              const bg = r.risk === "kritik" ? "#F3D6CE" : r.risk === "orta" ? "#F5E9CC" : "#DCEADF";
              return (
                <div key={i} style={{ border: `1px solid ${COLORS.line}`, borderLeft: `4px solid ${renk}`, borderRadius: 4, padding: "12px 14px" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{r.rol}</div>
                  <div style={{ fontSize: 11.5, color: "#6b7280", margin: "4px 0" }}>Mevcut: {r.mevcut}</div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: bg, color: renk }}>
                    {r.yedekDurum}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mono" style={{ fontSize: 10.5, color: "#6b7280", marginBottom: 8, letterSpacing: "0.04em" }}>MAKİNE / BANT YETKİNLİK MATRİSİ</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                  <th className="mono" style={{ textAlign: "left", padding: "7px 9px", fontSize: 10, color: "#6b7280", fontWeight: 700 }}>ÇALIŞAN</th>
                  {makineListesi.map((m) => (
                    <th key={m} className="mono" style={{ textAlign: "center", padding: "7px 6px", fontSize: 9.5, color: "#6b7280", fontWeight: 700 }}>{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {yetkinlikMatrisi.map((k, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                    <td style={{ padding: "7px 9px", fontWeight: 600 }}>{k.ad} <span style={{ color: "#9ca3af", fontWeight: 400 }}>· {k.dep}</span></td>
                    {k.makineler.map((yetkin, j) => (
                      <td key={j} style={{ padding: "7px 6px", textAlign: "center" }}>
                        {yetkin ? <CheckCircle2 size={15} color={COLORS.pine} style={{ display: "inline" }} /> : <span style={{ color: "#d1d5db" }}>—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Çıkış mülakatı kök neden analizi */}
        <SectionCard
          title="Çıkış Mülakatı — Kök Neden Analizi"
          sub="Mavi yaka çoğunlukla vardiya/servis, beyaz yaka çoğunlukla kariyer yolu nedeniyle ayrılıyor"
          icon={<AlertTriangle size={15} color={COLORS.brick} />}
          style={{ marginTop: 16 }}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={cikisNedenleri} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={COLORS.line} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} unit="%" />
              <YAxis type="category" dataKey="neden" width={160} tick={{ fontSize: 11, fill: COLORS.ink }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: `1px solid ${COLORS.line}` }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="mavi" name="Mavi Yaka %" fill={COLORS.thread} radius={[0, 3, 3, 0]} />
              <Bar dataKey="beyaz" name="Beyaz Yaka %" fill={COLORS.denim} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 10, padding: "10px 12px", background: COLORS.paperDeep, borderRadius: 4, fontSize: 12, lineHeight: 1.5 }}>
            Mavi yakada ayrılmaların <b>%62'si</b> ücret ve vardiya/mesai kaynaklı — servis saatleri ve adil vardiya planlamasıyla doğrudan azaltılabilir. Beyaz yakada ise <b>%40</b> ile kariyer yolu belirsizliği ilk sırada.
          </div>
        </SectionCard>

        {/* Akıllı hatırlatıcılar: ISG + şüpheli devamsızlık */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
          <SectionCard title="Periyodik ISG Tarama Takibi" sub="Akciğer grafisi, odyometri, solunum testi gibi zorunlu kontroller" icon={<Activity size={15} color={COLORS.denim} />}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...isgTaramalari].sort((a, b) => a.kalanGun - b.kalanGun).map((t, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: t.kalanGun < 0 ? "#FBF2EF" : COLORS.paperDeep, borderRadius: 4 }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{t.ad} <span style={{ color: "#9ca3af", fontWeight: 400 }}>· {t.dep}</span></div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>{t.tur}</div>
                  </div>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: t.kalanGun < 0 ? COLORS.brick : t.kalanGun <= 7 ? COLORS.threadDeep : COLORS.pine }}>
                    {t.kalanGun < 0 ? `${Math.abs(t.kalanGun)} gün geçti` : `${t.kalanGun} gün kaldı`}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Pazartesi / Cuma Devamsızlık Sinyali" sub="Hafta başı-sonu tek günlük rapor yoğunluğu" icon={<Siren size={15} color={COLORS.brick} />}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {supheliDevamsizlik.map((s, i) => (
                <div key={i} style={{ padding: "8px 10px", background: "#FBF2EF", borderRadius: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{s.ad} <span style={{ color: "#9ca3af", fontWeight: 400 }}>· {s.dep}</span></span>
                    <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: COLORS.brick }}>%{s.oran} Pzt/Cum</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                    {s.toplamTekGunluk} tek günlük rapor — {s.pazartesi} Pazartesi, {s.cuma} Cuma
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Örüntü İK görüşmesi için bir öneridir, tek başına disiplin gerekçesi değildir.</div>
            </div>
          </SectionCard>
        </div>

        {/* Dijital İK asistanı - self servis */}
        <SectionCard
          title="İK Dijital Asistanı — Self-Servis Talepler"
          sub="Rutin soruların otomatik yanıtlanması için kavramsal önizleme (WhatsApp / dahili ekran)"
          icon={<MessageCircle size={15} color={COLORS.denim} />}
          style={{ marginTop: 16 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 480 }}>
            {chatbotOrnekleri.map((c, i) => (
              <div key={i}>
                <div style={{ alignSelf: "flex-end", background: COLORS.ink, color: COLORS.paper, padding: "8px 12px", borderRadius: "10px 10px 2px 10px", fontSize: 12.5, display: "inline-block", marginLeft: "auto", float: "right", clear: "both" }}>
                  {c.soru}
                </div>
                <div style={{ clear: "both" }} />
                <div style={{ background: COLORS.paperDeep, padding: "8px 12px", borderRadius: "10px 10px 10px 2px", fontSize: 12.5, display: "inline-block", marginTop: 6, maxWidth: "90%" }}>
                  {c.yanit}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: "10px 12px", background: COLORS.paperDeep, borderRadius: 4, fontSize: 12, lineHeight: 1.5 }}>
            Ayrıca anonim <b>istek/şikayet kanalı</b> ile çalışanlar fabrika koşulları, yemekhane veya yönetimle ilgili geri bildirimi doğrudan İK'ya iletebilir — bu panelde toplanıp kök neden analizine (yukarıdaki bölüm) beslenir. Bu modül gerçek WhatsApp/HRIS entegrasyonu gerektirir, şu an kavramsal önizlemedir.
          </div>
        </SectionCard>

        <div style={{ marginTop: 32, marginBottom: -6 }}>
          <div className="mono" style={{ fontSize: 11, color: COLORS.threadDeep, letterSpacing: "0.1em" }}>YENİ EKLENEN MODÜLLER</div>
        </div>

        {/* A1: SGK Teşvik Hatırlatıcısı */}
        <SectionCard
          title="SGK Teşvik Hatırlatıcısı"
          sub="Firmanızın yararlanabileceği güncel istihdam teşvikleri — demo/tahmini rakamlar, güncel tebliğe göre teyit edilmelidir"
          icon={<Landmark size={15} color={COLORS.pine} />}
          style={{ marginTop: 16 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sgkTesvikleri.map((t, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "10px 12px", background: t.uygun ? "#DCEADF" : COLORS.paperDeep, borderRadius: 4 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{t.ad}</div>
                  <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 2 }}>{t.aciklama}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: t.uygun ? COLORS.pine : "#e5e5e5", color: t.uygun ? "#fff" : "#888" }}>
                    {t.uygun ? "UYGUN" : "UYGUN DEĞİL"}
                  </span>
                  {t.uygun && <div className="mono" style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>{fmtTL(t.tahminiYillikTasarruf)}/yıl</div>}
                </div>
              </div>
            ))}
          </div>
          <div className="thread-rule" style={{ margin: "14px 0", borderRadius: 2 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 13, color: "#4b5563" }}>Toplam kullanılabilir tahmini teşvik tasarrufu</span>
            <span className="disp" style={{ fontSize: 22, fontWeight: 800, color: COLORS.pine }}>
              {fmtTL(sgkTesvikleri.filter((t) => t.uygun).reduce((s, t) => s + t.tahminiYillikTasarruf, 0))}/yıl
            </span>
          </div>
        </SectionCard>

        {/* A2 + A3: Yıllık Kıyas & Sektör Benchmark */}
        <SectionCard title="Yıllık Karşılaştırma & Sektör Benchmarkı" sub="Geçen yıla göre değişim ve sektör ortalamasıyla kıyas" icon={<History size={15} color={COLORS.denim} />} style={{ marginTop: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 16 }}>
            <div style={{ background: COLORS.paperDeep, borderRadius: 4, padding: "12px 14px" }}>
              <div className="mono" style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>MAVİ YAKA DEVİR</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span className="disp" style={{ fontSize: 20, fontWeight: 800, color: COLORS.brick }}>%{yillikKiyas.maviDevirBuYil}</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>geçen yıl %{yillikKiyas.maviDevirGecenYil}</span>
                <TrendingUp size={13} color={COLORS.brick} />
              </div>
            </div>
            <div style={{ background: COLORS.paperDeep, borderRadius: 4, padding: "12px 14px" }}>
              <div className="mono" style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>BEYAZ YAKA DEVİR</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span className="disp" style={{ fontSize: 20, fontWeight: 800, color: COLORS.pine }}>%{yillikKiyas.beyazDevirBuYil}</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>geçen yıl %{yillikKiyas.beyazDevirGecenYil}</span>
                <TrendingDown size={13} color={COLORS.pine} />
              </div>
            </div>
            <div style={{ background: COLORS.paperDeep, borderRadius: 4, padding: "12px 14px" }}>
              <div className="mono" style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>DEVAMSIZLIK</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span className="disp" style={{ fontSize: 20, fontWeight: 800, color: COLORS.pine }}>%{yillikKiyas.devamsizlikBuYil}</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>geçen yıl %{yillikKiyas.devamsizlikGecenYil}</span>
                <TrendingDown size={13} color={COLORS.pine} />
              </div>
            </div>
          </div>

          <div className="mono" style={{ fontSize: 10.5, color: "#6b7280", marginBottom: 8 }}>SEKTÖR ORTALAMASIYLA KIYAS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sektorBenchmark.map((b, i) => {
              const kotu = b.firma > b.sektor;
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                    <span>{b.metrik}</span>
                    <span className="mono">Siz: <b style={{ color: kotu ? COLORS.brick : COLORS.pine }}>{b.firma}{b.birim}</b> · Sektör: {b.sektor}{b.birim}</span>
                  </div>
                  <div style={{ display: "flex", gap: 4, height: 6 }}>
                    <div style={{ width: `${Math.min(100, (b.firma / Math.max(b.firma, b.sektor)) * 100)}%`, background: kotu ? COLORS.brick : COLORS.pine, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* B1: Zorunlu Eğitim Takibi */}
        <SectionCard title="Zorunlu Eğitim Takibi" sub="Yangın, ilkyardım, iş güvenliği gibi periyodik yenileme gerektiren eğitimler" icon={<Flame size={15} color={COLORS.brick} />} style={{ marginTop: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...egitimTakibi].sort((a, b) => a.kalanGun - b.kalanGun).map((e, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: e.kalanGun < 0 ? "#FBF2EF" : COLORS.paperDeep, borderRadius: 4 }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{e.ad} <span style={{ color: "#9ca3af", fontWeight: 400 }}>· {e.dep}</span></div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>{e.egitim}</div>
                </div>
                <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: e.kalanGun < 0 ? COLORS.brick : e.kalanGun <= 14 ? COLORS.threadDeep : COLORS.pine }}>
                  {e.kalanGun < 0 ? `${Math.abs(e.kalanGun)} gün geçti` : `${e.kalanGun} gün kaldı`}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* B3: Basit Memnuniyet Anketi */}
        <SectionCard title="Çalışan Memnuniyeti (Aylık Nabız Anketi)" sub={`Anonim, 1-10 puanlama · Katılım oranı %${memnuniyetKatilim}`} icon={<Smile size={15} color={COLORS.thread} />} style={{ marginTop: 16 }}>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={memnuniyetTrend} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={COLORS.line} vertical={false} />
              <XAxis dataKey="ay" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: `1px solid ${COLORS.line}` }} />
              <Line type="monotone" dataKey="puan" name="Memnuniyet Puanı" stroke={COLORS.thread} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 10, padding: "10px 12px", background: "#FBF2EF", borderRadius: 4, fontSize: 12, lineHeight: 1.5 }}>
            Son 3 ayda puan düşüş eğiliminde (6.9 → 6.0 → 6.4) — çıkış mülakatı verileriyle birlikte okunduğunda erken uyarı sinyali olabilir.
          </div>
        </SectionCard>

        {/* C2: Otomatik Hatırlatma Ayarları */}
        <SectionCard title="Otomatik Hatırlatmalar" sub="Kritik tarihler yaklaşınca İK'ya otomatik e-posta gönderimi" icon={<BellRing size={15} color={COLORS.denim} />} style={{ marginTop: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {otomatikHatirlatmalar.map((h, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: COLORS.paperDeep, borderRadius: 4 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{h.tur}</div>
                  <div style={{ fontSize: 11.5, color: "#6b7280" }}>{h.kanal} · {h.ne_zaman}</div>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 10, background: h.aktif ? "#DCEADF" : "#e5e5e5", color: h.aktif ? COLORS.pine : "#888" }}>
                  {h.aktif ? "AKTİF" : "KAPALI"}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "#9ca3af" }}>E-posta gönderimi basit SMTP entegrasyonu gerektirir — kavramsal önizlemedir.</div>
        </SectionCard>

        {/* C3: Audit Log */}
        <SectionCard title="İşlem Geçmişi (Audit Log)" sub="Kim, ne zaman, hangi veriyi değiştirdi — KVKK/ISO denetimleri için" icon={<History size={15} color={COLORS.ink} />} style={{ marginTop: 16 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                  {["Kullanıcı", "İşlem", "Tarih"].map((h) => (
                    <th key={h} className="mono" style={{ textAlign: "left", padding: "7px 9px", fontSize: 10, color: "#6b7280", fontWeight: 700 }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {auditLog.map((a, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                    <td style={{ padding: "7px 9px", fontWeight: 600 }}>{a.kullanici}</td>
                    <td style={{ padding: "7px 9px", color: "#4b5563" }}>{a.islem}</td>
                    <td style={{ padding: "7px 9px" }} className="mono">{a.tarih}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="mono" style={{ marginTop: 28, fontSize: 10.5, color: "#9ca3af", textAlign: "center" }}>
          DEMO VERİ — GERÇEK ÇALIŞAN VERİLERİNİZLE BESLENDİĞİNDE OTOMATİK GÜNCELLENİR
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, sub, tone }) {
  const toneColor = tone === "brick" ? "#A8402E" : tone === "pine" ? "#3F6B4F" : tone === "thread" ? "#9C7418" : "#1B2333";
  return (
    <div className="card" style={{ padding: "16px 16px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7280", marginBottom: 10 }}>
        {icon}
        <span className="mono" style={{ fontSize: 10.5, letterSpacing: "0.05em", fontWeight: 700 }}>{label.toUpperCase()}</span>
      </div>
      <div className="disp" style={{ fontSize: 24, fontWeight: 800, color: toneColor, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function SectionCard({ title, sub, icon, children, style }) {
  return (
    <div className="card" style={{ padding: "18px 20px 20px", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
        {icon}
        <h3 className="disp" style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h3>
      </div>
      {sub && <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>{sub}</div>}
      {children}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{ background: "#F3F0E8", borderRadius: 4, padding: "12px 14px" }}>
      <div className="mono" style={{ fontSize: 10, color: "#6b7280", marginBottom: 4, letterSpacing: "0.04em" }}>{label.toUpperCase()}</div>
      <div className="disp" style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function ExecutiveSummary({
  onGeri, toplamKisi, isgucuMaliyeti, isgucuMaliyetOrani, toplamDevirMaliyet,
  arabuluculukToplamTasarruf, kidemEsigiYaklasan, kontenjanAcigi, cezaRiski,
}) {
  const riskler = [
    `${kidemEsigiYaklasan} çalışan dosyasında kıdem tazminatı eşiği kararı (1. yıl) 30 gün içinde/geçmiş durumda — gecikme tazminat riski doğurur.`,
    kontenjanAcigi > 0
      ? `Engelli çalışan kontenjanında ${kontenjanAcigi} kişilik açık — aylık tahmini idari para cezası riski ${fmtTL(cezaRiski)}.`
      : `Engelli çalışan kontenjanı dolu — idari para cezası riski yok.`,
    `Dokuma ve dokuma-teknisyenliği gibi 2 kritik üretim rolünde yedek (bench) personel bulunmuyor — ani bir ayrılış üretim durmasına yol açabilir.`,
  ];

  const kararlar = [
    "Mavi yaka vardiya/mesai planı yeniden dağıtılmalı: 2 çalışan yasal fazla mesai limitini aştı, işgücü/sağlık riski taşıyor.",
    "Kritik üretim rollerinde (Dokuma Usta Başı, Jakarlı Dokuma Teknisyeni) çapraz eğitim/yedekleme programı bu ay başlatılmalı.",
  ];

  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", color: COLORS.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        .disp { font-family: 'Archivo', ui-sans-serif, sans-serif; letter-spacing: -0.01em; }
        .mono { font-family: 'Space Mono', ui-monospace, monospace; }
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 32px", borderBottom: `1px solid ${COLORS.line}`, background: COLORS.paper }}>
        <button onClick={onGeri} className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", fontSize: 11.5, fontWeight: 700, background: "transparent", color: COLORS.ink, border: `1px solid ${COLORS.line}`, borderRadius: 3, cursor: "pointer" }}>
          <ArrowLeft size={13} /> Panele Dön
        </button>
        <button onClick={() => window.print()} className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", fontSize: 11.5, fontWeight: 700, background: COLORS.ink, color: COLORS.paper, border: "none", borderRadius: 3, cursor: "pointer" }}>
          <Printer size={13} /> Yazdır / PDF Kaydet
        </button>
      </div>

      <div style={{ padding: "36px 40px", maxWidth: 820, margin: "0 auto" }}>
        <div className="mono" style={{ fontSize: 11, color: COLORS.threadDeep, letterSpacing: "0.12em", marginBottom: 8 }}>
          ANADOLU TEKSTİL A.Ş. — YÖNETİM KURULU ÖZETİ
        </div>
        <h1 className="disp" style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px" }}>İK Aylık Özeti — Ağustos 2026</h1>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 28 }}>1 sayfalık yönetici özeti · {toplamKisi} çalışan</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 26 }}>
          <div style={{ border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "16px 18px" }}>
            <div className="mono" style={{ fontSize: 10, color: "#6b7280", marginBottom: 6, letterSpacing: "0.05em" }}>TOPLAM İŞGÜCÜ MALİYETİ (AYLIK)</div>
            <div className="disp" style={{ fontSize: 24, fontWeight: 800 }}>{fmtTL(isgucuMaliyeti)}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Cironun %{isgucuMaliyetOrani}'i</div>
          </div>
          <div style={{ border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: "16px 18px" }}>
            <div className="mono" style={{ fontSize: 10, color: "#6b7280", marginBottom: 6, letterSpacing: "0.05em" }}>ENGELLENEN TURNOVER + ARABULUCULUK TASARRUFU</div>
            <div className="disp" style={{ fontSize: 24, fontWeight: 800, color: COLORS.pine }}>{fmtTL(arabuluculukToplamTasarruf)}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Yıllık devir maliyeti ayrıca {fmtTL(toplamDevirMaliyet)}</div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3 className="disp" style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Önümüzdeki Ayın 3 Büyük Riski</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {riskler.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "#FBF2EF", borderRadius: 4, fontSize: 13, lineHeight: 1.5 }}>
                <AlertTriangle size={15} color={COLORS.brick} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="disp" style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Alınması Gereken 2 Kritik Yönetsel Karar</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {kararlar.map((k, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", background: COLORS.paperDeep, borderRadius: 4, fontSize: 13, lineHeight: 1.5 }}>
                <ShieldAlert size={15} color={COLORS.denim} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{k}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mono" style={{ marginTop: 32, fontSize: 10, color: "#9ca3af" }}>
          DEMO VERİ — GERÇEK VERİLERLE BESLENDİĞİNDE BU ÖZET OTOMATİK GÜNCELLENİR
        </div>
      </div>
    </div>
  );
}
