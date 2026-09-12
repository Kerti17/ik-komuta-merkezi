// Cikis mulakati kok neden analizi (claude-code-talimati.md Bolum 5 Faz2
// madde 24 - "kategorize veri toplama mekanizmasiyla"). db/schema.ts'teki
// exit_interviews.reasonCategory serbest metin (enum DEGIL, Bolum 1'deki
// sektor-agnostik kural geregi hicbir alan koda sabit enum olarak
// kilitlenmiyor) ama "kategorize" toplama icin ADMIN EKRANINDA sabit bir
// secim listesi sunulur - boylece veri tutarli kalir ve agregasyon
// (kok neden analizi) anlamli olur.
//
// VARSAYIM: talimat "kategori listesi Faz 2'de netlesecek" diyordu, hala
// netlesmedi - burada genel-gecer, sektor-bagimsiz 10 kategorilik makul bir
// varsayilan liste tanimlandi. Ihtiyaca gore admin panelden DEGIL, sadece bu
// dosyadan (kod duzeyinde) genisletilebilir - Faz 2'nin geri kalaniyla ayni
// olgunlukta bir VARSAYIM.
export const EXIT_REASON_CATEGORIES = [
  "Ücret Yetersizliği",
  "Kariyer Gelişimi / Terfi Yokluğu",
  "Vardiya / Mesai Saatleri",
  "Yönetici / Ekip İlişkileri",
  "İş-Yaşam Dengesi",
  "Ulaşım / Lokasyon",
  "Sağlık",
  "Kişisel / Aile Nedenleri",
  "Başka Bir İş Teklifi",
  "Diğer",
] as const;

export type ExitReasonCategory = (typeof EXIT_REASON_CATEGORIES)[number];
