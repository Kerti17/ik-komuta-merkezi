// Sablon + parse asamasi ortak basliklari kullanir - biri degisirse diger
// bozulmaz diye tek yerden tanimlanir.
export const EMPLOYEE_IMPORT_HEADERS = [
  "Ad Soyad",
  "Departman",
  "Şube",
  "Yaka Tipi (Mavi/Beyaz)",
  "İşe Giriş Tarihi (GG.AA.YYYY)",
  "Aylık Maaş (opsiyonel)",
  // Bolum 5 Faz1.5 madde 22 (SGK tesvik uygunlugu icin, madde 20) - opsiyonel,
  // bos birakilabilir. Tekil ekleme formundaki alanlarla ayni.
  "Doğum Tarihi (opsiyonel, GG.AA.YYYY)",
  "Cinsiyet (opsiyonel, Kadın/Erkek)",
  "Emekli (opsiyonel, Evet/Hayır)",
];
