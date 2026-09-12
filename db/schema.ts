// ---------------------------------------------------------------------------
// IK Komuta Merkezi - Veritabani semasi (Supabase / Postgres, Drizzle ORM)
// Kaynak: claude-code-talimati.md Bolum 4 ("Veri Modeli - asgari tablolar")
//
// GECMIS NOT (bkz. hata.md): proje ilk basta Turso/libSQL uzerine kuruldu, ancak
// Turso'nun Windows'ta CLI kurulumu WSL gerektirdigi icin Supabase'e (Postgres)
// gecildi. Tablo/kolon adlari VE tum is mantigi (lib/*.ts, actions.ts) AYNI kaldi -
// sadece kolon tipleri Postgres'e uyarlandi (id: integer+autoIncrement -> serial,
// boolean alanlar: integer mode:"boolean" -> native boolean, real -> doublePrecision).
//
// Onemli tasarim kurallari (bkz. talimat Bolum 1):
//   - departments serbest/admin tanimli - sabit enum DEGIL.
//   - critical_roles alan adlari (competency_fields) admin tanimli - sabit enum DEGIL.
//   - collar_type (mavi/beyaz) talimat geregi sabit iki degerli kalabilir (Turkiye'de
//     genel kullanilan, sektore ozgu olmayan bir terim - Bolum 1).
//
// Bu dosyadaki tablolarin cogu talimat Bolum 4'te birebir listelenmistir. Listede
// OLMAYIP burada eklenen tablolar acikca isaretlenmistir (asagida "VARSAYIM" notlariyla):
//   - settings            : Bolum 6'daki "Ayarlar" ekraninin verisini tutacak yer olarak eklendi.
//   - admin_users          : Bolum 6'daki "sifreli giris" icin gerekli, Bolum 4 listesinde yok.
//   - competency_fields /
//     employee_competencies: critical_roles'un "ozellestirilebilir alan adli yetkinlik
//                             matrisi" gereksinimini (Bolum 1) normallestirilmis sekilde
//                             karsilamak icin critical_roles'tan ayristirildi.
// ---------------------------------------------------------------------------

import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { pgTable, text, integer, boolean, doublePrecision, serial, uniqueIndex, index } from "drizzle-orm/pg-core";

// updatedAt alanlari her guncellemede uygulama katmaninda elle set edilir (bkz.
// actions.ts dosyalarindaki "updatedAt: new Date().toISOString()"), DB varsayilani
// sadece INSERT anindaki ilk deger icindir. Metin (text) kolonu olarak tutulur -
// once() Postgres timestamptz donduren bir fonksiyon oldugundan text kolonuna
// yazilirken acikca ::text'e cevrilir.
const createdAt = () => text("created_at").notNull().default(sql`now()::text`);
const updatedAt = () => text("updated_at").notNull().default(sql`now()::text`);

// ---------------------------------------------------------------------------
// Ayarlar (VARSAYIM - Bolum 6 "Ayarlar" ekrani icin, tek satirlik yapilandirma)
// Uygulama katmaninda daima id = 1 olan tek satir okunur/guncellenir.
// ---------------------------------------------------------------------------
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull().default("Sirketiniz"),

  // Bolum 5 Faz1 madde 4: deneme suresi degerlendirmesi, varsayilan 2 ay
  trialPeriodMonths: integer("trial_period_months").notNull().default(2),

  // Bolum 5 Faz1 madde 5: yasal fazla mesai limiti, varsayilan 270 saat/yil
  legalOvertimeLimitHours: integer("legal_overtime_limit_hours").notNull().default(270),

  // Bolum 5 Faz1 madde 14: birikmis izin esik degerleri (gun)
  leaveCriticalThresholdDays: integer("leave_critical_threshold_days").notNull().default(30),
  leaveWarningThresholdDays: integer("leave_warning_threshold_days").notNull().default(15),

  // Bolum 5 Faz1 madde 8: yasal engelli istihdam kontenjan orani (Is Kanunu m.30 -> %3)
  disabilityQuotaPercentage: doublePrecision("disability_quota_percentage").notNull().default(0.03),

  // Bolum 5 Faz1 madde 14: calisanda maas bilgisi yoksa kullanilacak varsayilan gunluk ucret
  defaultDailyWageBlueCollar: doublePrecision("default_daily_wage_blue_collar"),
  defaultDailyWageWhiteCollar: doublePrecision("default_daily_wage_white_collar"),

  // Bolum 5 Faz1 madde 10: devir maliyeti + isten cikis maliyeti hesaplayici varsayilanlari
  defaultHiringCostBlueCollar: doublePrecision("default_hiring_cost_blue_collar"),
  defaultHiringCostWhiteCollar: doublePrecision("default_hiring_cost_white_collar"),
  defaultPpeCostBlueCollar: doublePrecision("default_ppe_cost_blue_collar"), // KKD/kiyafet-ekipman (mavi yaka)
  defaultPpeCostWhiteCollar: doublePrecision("default_ppe_cost_white_collar"), // badge/ekipman (beyaz yaka)

  // Bolum 5 Faz1 madde 10 (VARSAYIM - adim3): isten cikis maliyeti hesaplayicisinin
  // "bos pozisyon suresi" ve "oryantasyon verim kaybi" kalemleri icin varsayilanlar.
  // Talimatta bu iki kalemin nasil hesaplanacagi netlesmedigi icin gun sayisi (bos
  // pozisyon) ve duz TL (verim kaybi) olarak sadelestirildi - diger maliyet
  // alanlariyla ayni pattern.
  avgVacancyDaysBlueCollar: integer("avg_vacancy_days_blue_collar"), // ort. bos pozisyon suresi, gun (mavi yaka)
  avgVacancyDaysWhiteCollar: integer("avg_vacancy_days_white_collar"), // ort. bos pozisyon suresi, gun (beyaz yaka)
  onboardingProductivityLossCostBlueCollar: doublePrecision("onboarding_productivity_loss_cost_blue_collar"), // oryantasyon verim kaybi, TL (mavi yaka)
  onboardingProductivityLossCostWhiteCollar: doublePrecision("onboarding_productivity_loss_cost_white_collar"), // oryantasyon verim kaybi, TL (beyaz yaka)

  // Bolum 5 Faz1 madde 11 / Bolum 8 (VARSAYIM - adim6): Patron Raporu'ndaki "toplam
  // isgucu maliyeti / ciro orani" basligi icin. Bu ikisi HR verisinden hesaplanamaz
  // (bordro+SGK+yan haklar toplami ve ciro, finans/muhasebe verisi) - admin elle girer,
  // bos birakilirsa Patron Raporu'nda bu basliklar gizlenir.
  monthlyWorkforceCost: doublePrecision("monthly_workforce_cost"), // aylik toplam isgucu maliyeti, TL
  monthlyRevenue: doublePrecision("monthly_revenue"), // aylik ciro, TL - orani hesaplamak icin

  // komut1.md Faz 1.6 madde 26: TIS bitis tarihine kac gun kala uyari
  // uretilecegi - kidem esigi (leaveCriticalThresholdDays vb.) ile ayni
  // "admin degistirebilir esik" deseni. Varsayilan 90 gun (talimatin kendi
  // ifadesi).
  collectiveAgreementWarningDays: integer("collective_agreement_warning_days").notNull().default(90),

  // /panel icin basit, paylasilan sifre (VARSAYIM - kullanici talebiyle eklendi,
  // Bolum 2/3'te sadece /admin icin giris isteniyordu). admin_users gibi ayri
  // hesaplar degil - tek bir hash, Ayarlar sayfasindan degistirilir. Null ise
  // panel sifresi henuz belirlenmemis demektir.
  panelPasswordHash: text("panel_password_hash"),

  updatedAt: updatedAt(),
});

// ---------------------------------------------------------------------------
// Sube/lokasyon listesi (Bolum 4) - coklu sube destegi icin
// ---------------------------------------------------------------------------
export const branches = pgTable(
  "branches",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    address: text("address"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("branches_name_idx").on(t.name)]
);

// ---------------------------------------------------------------------------
// Departmanlar (Bolum 4) - serbest, admin tarafindan yonetilir. Sabit liste DEGIL.
// ---------------------------------------------------------------------------
export const departments = pgTable(
  "departments",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("departments_name_idx").on(t.name)]
);

// ---------------------------------------------------------------------------
// Admin kullanicilari (VARSAYIM - Bolum 6 "sifreli giris" icin gerekli)
// /admin icin basit credentials-based giris; /panel icin Faz 2'de rol bazli
// gorunurluk (Bolum 5 Faz2 madde 20) genisletilebilir - departmentId o zaman kullanilir.
// ---------------------------------------------------------------------------
export const adminUsers = pgTable(
  "admin_users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    fullName: text("full_name"),
    role: text("role", { enum: ["ik_admin", "genel_mudur", "departman_muduru"] })
      .notNull()
      .default("ik_admin"),
    departmentId: integer("department_id").references(() => departments.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("admin_users_email_idx").on(t.email)]
);

// ---------------------------------------------------------------------------
// Calisanlar (Bolum 4): ad, departman, yaka tipi, sube, ise giris tarihi, maas bandi vb.
// ---------------------------------------------------------------------------
export const employees = pgTable(
  "employees",
  {
    id: serial("id").primaryKey(),
    fullName: text("full_name").notNull(),
    departmentId: integer("department_id")
      .notNull()
      .references(() => departments.id),
    branchId: integer("branch_id")
      .notNull()
      .references(() => branches.id),
    // Bolum 1: mavi/beyaz yaka ayrimi sabit kalabilir (sektore ozgu degil)
    collarType: text("collar_type", { enum: ["mavi", "beyaz"] }).notNull(),
    hireDate: text("hire_date").notNull(), // ISO yyyy-mm-dd
    terminationDate: text("termination_date"), // doluysa calisan ayrilmis demektir
    monthlySalary: doublePrecision("monthly_salary"), // maas bandi - opsiyonel, mali hesaplarda kullanilir
    status: text("status", { enum: ["aktif", "ayrildi"] })
      .notNull()
      .default("aktif"),
    // Bolum 5 Faz1.5 madde 22: SGK tesvik uygunluk hesaplamasi (madde 20) icin
    // gerekli - opsiyonel, mevcut calisanlarda bos olabilir. KVKK notu (madde
    // 22'de belirtildigi gibi): dogum tarihi/cinsiyet ozel nitelikli degil ama
    // kisisel veridir, bu yuzden bolum yoneticisi ekraninda (madde 21) GOSTERILMEZ.
    birthDate: text("birth_date"), // ISO yyyy-mm-dd, opsiyonel
    gender: text("gender", { enum: ["kadin", "erkek"] }), // opsiyonel
    isRetired: boolean("is_retired").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("employees_department_idx").on(t.departmentId),
    index("employees_branch_idx").on(t.branchId),
    index("employees_status_idx").on(t.status),
  ]
);

// ---------------------------------------------------------------------------
// Devamsizlik kayitlari (Bolum 4): tarih, calisan, tur
// Departman bazli devamsizlik + Pazartesi/Cuma sinyali bu tablodan hesaplanir.
// ---------------------------------------------------------------------------
export const attendance = pgTable(
  "attendance",
  {
    id: serial("id").primaryKey(),
    employeeId: integer("employee_id")
      .notNull()
      .references(() => employees.id),
    date: text("date").notNull(), // ISO yyyy-mm-dd
    // orn: "devamsizlik", "raporlu" (tek gunluk rapor), "ucretsiz_izin" - serbest metin,
    // Excel sablonundaki degerlerle admin tarafindan doldurulur.
    type: text("type").notNull(),
    dayCount: doublePrecision("day_count").notNull().default(1),
    note: text("note"),
    createdAt: createdAt(),
  },
  (t) => [index("attendance_employee_date_idx").on(t.employeeId, t.date)]
);

// ---------------------------------------------------------------------------
// Vardiya & mesai yuku (Bolum 4): vardiya, gece vardiyasi, hafta sonu mesai,
// yillik fazla mesai saati. Aylik donem bazinda tutulur; yillik toplamlar
// sorgu ile (12 donemin SUM'i) hesaplanir.
// ---------------------------------------------------------------------------
export const shiftsOvertime = pgTable(
  "shifts_overtime",
  {
    id: serial("id").primaryKey(),
    employeeId: integer("employee_id")
      .notNull()
      .references(() => employees.id),
    period: text("period").notNull(), // "YYYY-MM" formatinda aylik puantaj donemi
    overtimeHours: doublePrecision("overtime_hours").notNull().default(0),
    nightShiftCount: integer("night_shift_count").notNull().default(0),
    weekendOvertimeCount: integer("weekend_overtime_count").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("shifts_overtime_employee_period_idx").on(t.employeeId, t.period)]
);

// ---------------------------------------------------------------------------
// Degerlendirmeler (Bolum 4): deneme/6 ay/1 yil; kriter bazli puanlar
// (Yetkinlik/Uyum/Performans), degerlendirme tarihi, durum.
// ---------------------------------------------------------------------------
export const evaluations = pgTable(
  "evaluations",
  {
    id: serial("id").primaryKey(),
    employeeId: integer("employee_id")
      .notNull()
      .references(() => employees.id),
    // komut1.md Faz 1.6 madde 27a: "sadece ise giris donemi degil, tum kadro
    // icin yillik/6 aylik" periyodik degerlendirme eklendi. reviewType bu
    // ikisini ayirir; stage her iki turde de kullanilir (ise_giris ->
    // deneme/6_ay/1_yil, periyodik -> yillik/alti_aylik). Puanlama sistemi
    // (competency/adaptation/performanceScore) AYNI - yeni bir sey icat
    // edilmedi, talimatin kendi istegi geregi.
    reviewType: text("review_type", { enum: ["ise_giris", "periyodik"] }).notNull().default("ise_giris"),
    stage: text("stage", { enum: ["deneme", "6_ay", "1_yil", "yillik", "alti_aylik"] }).notNull(),
    dueDate: text("due_date").notNull(), // karar/son tarih
    status: text("status", {
      enum: ["bekliyor", "acil", "gecikti", "devam", "sonlandirildi"],
    })
      .notNull()
      .default("bekliyor"),
    competencyScore: integer("competency_score"), // Yetkinlik (0-100)
    adaptationScore: integer("adaptation_score"), // Uyum (0-100)
    performanceScore: integer("performance_score"), // Performans (0-100)
    evaluatedAt: text("evaluated_at"),
    evaluatedBy: integer("evaluated_by").references(() => adminUsers.id),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("evaluations_employee_idx").on(t.employeeId), index("evaluations_status_idx").on(t.status)]
);

// ---------------------------------------------------------------------------
// Bolum Yoneticisi notlari (Bolum 4 + Bolum 5 Faz1.5 madde 21): bolum
// yoneticisinin bir calisanla ilgili girdigi serbest metin not. Ik panelinde
// calisan detayinda ("/admin/calisanlar/[id]") salt-okunur gorunur.
//
// VARSAYIM (mimari sapma, acikca belirtiliyor): talimatin veri modeli
// bolumu ayri bir "managers" tablosu oneriyordu. Bunun yerine admin_users
// tablosu KULLANILDI - o tablo zaten role enum'unda "departman_muduru"yu VE
// departmentId FK'ini bariz sekilde bu senaryo icin barindiriyordu (bkz.
// admin_users tanimindaki eski yorum: "Faz 2'de rol bazli gorunurluk ...
// departmentId o zaman kullanilir"). Ayri bir tablo + ayri bir auth sistemi
// kurmak yerine mevcut NextAuth/admin_users altyapisi role bazli kisitlamayla
// (bkz. proxy.ts, types/next-auth.d.ts) genisletildi - ayni kimlik dogrulama
// mekanizmasini iki kere kurmamak icin.
// ---------------------------------------------------------------------------
export const managerNotes = pgTable("manager_notes", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id),
  authorId: integer("author_id")
    .notNull()
    .references(() => adminUsers.id), // hangi yonetici girdi (admin_users, role=departman_muduru)
  noteDate: text("note_date").notNull(), // ISO yyyy-mm-dd
  note: text("note").notNull(),
  // komut1.md Faz 1.6 madde 25c: doluysa bu not genel bir yonetici notu degil,
  // belirli bir egitimin "egitim sonrasi gelisim degerlendirmesi"dir - bkz.
  // trainings tablosu. Bossa (NULL) normal/genel yonetici notudur (madde 21).
  trainingId: integer("training_id").references(() => trainings.id),
  createdAt: createdAt(),
});

// ---------------------------------------------------------------------------
// Egitim ve Gelisim (komut1.md Faz 1.6 madde 25a/b): IK'nin calisan icin
// girdigi egitim kaydi - egitim adi + serbest/ozellestirilebilir egitim
// alani/kategorisi (sabit liste DEGIL, mandatoryTrainings/healthScreenings
// gibi zorunlu/tekrarlanan tarama DEGIL - tek seferlik, tamamlanma durumu
// takip edilen bir kayit). Tamamlaninca status "tamamlandi" olur ve
// completedDate girilir; o zaman yonetici bu egitime ozel bir degerlendirme
// girebilir (managerNotes.trainingId, bkz. yukarida).
// ---------------------------------------------------------------------------
export const trainings = pgTable(
  "trainings",
  {
    id: serial("id").primaryKey(),
    employeeId: integer("employee_id")
      .notNull()
      .references(() => employees.id),
    trainingName: text("training_name").notNull(),
    trainingField: text("training_field").notNull(), // serbest/ozellestirilebilir kategori, ör. "Teknik", "Liderlik"
    status: text("status", { enum: ["tamamlandi", "tamamlanmadi"] })
      .notNull()
      .default("tamamlanmadi"),
    completedDate: text("completed_date"), // ISO yyyy-mm-dd, sadece status=tamamlandi ise dolu
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("trainings_employee_idx").on(t.employeeId)]
);

// ---------------------------------------------------------------------------
// Kritik rol & yetkinlik matrisi (Bolum 4 + Bolum 1: ozellestirilebilir alan adlari)
// critical_roles: kritik pozisyonlarin kendisi (rol adi tamamen serbest metin).
// competency_fields: matristeki sutun basliklari (ör. "Jakarli Dokuma",
//   "Forklift Ehliyeti", "Yazilim Yetkinligi") - admin panelden tanimlanir.
// employee_competencies: calisan x yetkinlik alani eslesme tablosu (matrisin hucreleri).
// ---------------------------------------------------------------------------
export const criticalRoles = pgTable("critical_roles", {
  id: serial("id").primaryKey(),
  roleName: text("role_name").notNull(), // ör. "Dokuma Usta Basi" - serbest metin
  currentEmployeeId: integer("current_employee_id").references(() => employees.id),
  backupCount: integer("backup_count").notNull().default(0),
  backupStatus: text("backup_status"), // ör. "Yedek Yok", "Gelismekte (~6 ay)", "Hazir" - serbest metin
  riskLevel: text("risk_level", { enum: ["dusuk", "orta", "kritik"] })
    .notNull()
    .default("orta"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const competencyFields = pgTable("competency_fields", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // ör. "Jakarli Dokuma" - tamamen admin tanimli, sektore gore degisir
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
});

export const employeeCompetencies = pgTable(
  "employee_competencies",
  {
    id: serial("id").primaryKey(),
    employeeId: integer("employee_id")
      .notNull()
      .references(() => employees.id),
    competencyFieldId: integer("competency_field_id")
      .notNull()
      .references(() => competencyFields.id),
    isCompetent: boolean("is_competent").notNull().default(false),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("employee_competencies_employee_field_idx").on(t.employeeId, t.competencyFieldId)]
);

// ---------------------------------------------------------------------------
// Cikis mulakati (Bolum 4): kategorize kok neden
// ---------------------------------------------------------------------------
export const exitInterviews = pgTable("exit_interviews", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id),
  exitDate: text("exit_date").notNull(),
  // Bolum 5 Faz2 madde 24: kategori listesi artik netlesti - bkz. lib/exit-interviews.ts
  // (EXIT_REASON_CATEGORIES). Serbest metin kalir (DB seviyesinde enum degil) ama admin
  // ekrani sadece o sabit listeden secim sunar.
  reasonCategory: text("reason_category").notNull(),
  notes: text("notes"),
  createdAt: createdAt(),
});

// ---------------------------------------------------------------------------
// ISG tarama takvimi (Bolum 4): tur, tarih
// ---------------------------------------------------------------------------
export const healthScreenings = pgTable(
  "health_screenings",
  {
    id: serial("id").primaryKey(),
    employeeId: integer("employee_id")
      .notNull()
      .references(() => employees.id),
    screeningType: text("screening_type").notNull(), // ör. "Odyometri (Isitme)", "Akciger Grafisi" - serbest
    lastScreeningDate: text("last_screening_date"),
    dueDate: text("due_date").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("health_screenings_due_date_idx").on(t.dueDate)]
);

// ---------------------------------------------------------------------------
// Zorunlu egitim takibi (Bolum 5 Faz2 madde 26) - "ISG modulueyle ayni mantik,
// farkli tur alani" talimati geregi health_screenings'in BIREBIR ayni
// yapisinin kopyasi (tur alani egitim turu, orn. "Is Sagligi ve Guvenligi
// Egitimi", "Yangin Egitimi" - serbest metin).
// ---------------------------------------------------------------------------
export const mandatoryTrainings = pgTable(
  "mandatory_trainings",
  {
    id: serial("id").primaryKey(),
    employeeId: integer("employee_id")
      .notNull()
      .references(() => employees.id),
    trainingType: text("training_type").notNull(), // ör. "İş Sağlığı ve Güvenliği Eğitimi", "Yangın Eğitimi" - serbest
    lastCompletedDate: text("last_completed_date"),
    dueDate: text("due_date").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("mandatory_trainings_due_date_idx").on(t.dueDate)]
);

// ---------------------------------------------------------------------------
// Arabuluculuk dosyalari (Bolum 4): odenen tutar, tahmini dava maliyeti, tarih
// ---------------------------------------------------------------------------
export const mediationCases = pgTable("mediation_cases", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id),
  caseDate: text("case_date").notNull(),
  paidAmount: doublePrecision("paid_amount").notNull(),
  estimatedLawsuitCost: doublePrecision("estimated_lawsuit_cost").notNull(),
  notes: text("notes"),
  createdAt: createdAt(),
});

// ---------------------------------------------------------------------------
// Tutanak kayitlari (Bolum 4): calisan, tarih, tur, aciklama
// Ayrilma riski analizinde calisanla iliskilendirilir.
// ---------------------------------------------------------------------------
export const disciplinaryRecords = pgTable("disciplinary_records", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id),
  recordDate: text("record_date").notNull(),
  type: text("type", {
    enum: ["sozlu_uyari", "yazili_uyari", "devamsizlik_tutanagi", "diger"],
  }).notNull(),
  description: text("description"),
  createdAt: createdAt(),
});

// ---------------------------------------------------------------------------
// Odul/takdir kayitlari (Bolum 4): calisan, odul adi, tarih
// Risk analizinde capraz referans icin kullanilir.
// ---------------------------------------------------------------------------
export const recognitions = pgTable("recognitions", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id),
  awardName: text("award_name").notNull(),
  awardDate: text("award_date").notNull(),
  createdAt: createdAt(),
});

// ---------------------------------------------------------------------------
// Birikmis yillik izin bakiyesi (Bolum 4): hak edilen/kullanilan/kalan gun.
// remainingDaysTotal, onceki yillardan devreden bakiyeyi de icerir - bu yuzden
// earnedDays - usedDays'ten BUYUK olabilir (birikmis toplam).
// ---------------------------------------------------------------------------
export const leaveBalances = pgTable(
  "leave_balances",
  {
    id: serial("id").primaryKey(),
    employeeId: integer("employee_id")
      .notNull()
      .references(() => employees.id),
    asOfYear: integer("as_of_year").notNull(),
    earnedDays: doublePrecision("earned_days").notNull().default(0), // bu yil hak edilen
    usedDays: doublePrecision("used_days").notNull().default(0), // bu yil kullanilan
    remainingDaysTotal: doublePrecision("remaining_days_total").notNull().default(0), // birikmis toplam kalan
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("leave_balances_employee_year_idx").on(t.employeeId, t.asOfYear)]
);

// ---------------------------------------------------------------------------
// Zorunlu istihdam / engelli kontenjani (Bolum 4): toplam kadro, mevcut engelli
// calisan sayisi. Yasal %3 orani settings.disabilityQuotaPercentage'dan okunur.
// Tek satirlik anlik durum (snapshot); admin panelden guncellenir.
// ---------------------------------------------------------------------------
export const disabilityQuota = pgTable("disability_quota", {
  id: serial("id").primaryKey(),
  totalHeadcount: integer("total_headcount").notNull(),
  currentDisabledEmployeeCount: integer("current_disabled_employee_count").notNull().default(0),
  monthlyPenaltyRiskEstimate: doublePrecision("monthly_penalty_risk_estimate"), // opsiyonel, admin tahmini
  updatedAt: updatedAt(),
});

// ---------------------------------------------------------------------------
// Ayrilma riski skoru agirliklari (Bolum 4 + Bolum 5 Faz1.5 madde 19): tek
// satirlik yapilandirma (settings/disability_quota ile ayni "ilk erisimde
// otomatik olusturulur" pattern - bkz. lib/settings.ts). v1 formulunun
// varsayilan agirliklari talimattaki degerler (%30/%20/%20/%15/%15) - admin
// panelden degistirilebilir, koda sabitlenmez.
// ---------------------------------------------------------------------------
export const riskScoreWeights = pgTable("risk_score_weights", {
  id: serial("id").primaryKey(),
  attendanceTrendWeight: doublePrecision("attendance_trend_weight").notNull().default(30), // devamsizlik trendi
  overtimeLoadWeight: doublePrecision("overtime_load_weight").notNull().default(20), // fazla mesai yuku
  disciplinaryCountWeight: doublePrecision("disciplinary_count_weight").notNull().default(20), // tutanak sayisi
  lowSeniorityWeight: doublePrecision("low_seniority_weight").notNull().default(15), // kidem <1 yil
  accruedLeaveWeight: doublePrecision("accrued_leave_weight").notNull().default(15), // birikmis izin
  updatedAt: updatedAt(),
});

// ---------------------------------------------------------------------------
// SGK tesvik KURALLARI (Bolum 4 + Bolum 5 Faz1.5 madde 20): statik liste
// DEGIL - Ik'nin kendi ekleyip/duzenleyip/pasife alabildigi kural tablosu.
// Onceki "sgk_incentives" (statik liste) tablosunun yerini alir - o tablo hic
// kullanilmiyordu (UI yoktu), bu yuzden dogrudan degistirildi.
// Uygunluk kriterleri (yas araligi/cinsiyet/engellilik/bolge) SERBEST/OPSIYONEL
// alanlardir - hicbiri girilmezse kural "herkese uygun olabilir" sayilir.
// Otomatik uygunluk onerisi lib/sgk-incentives.ts'te employees.birthDate/
// gender (madde 22) ile eslestirilir; engellilik VE bolge calisan bazinda
// tutulmadigindan (Faz2 kapsami disi) bu iki kriter icin sistem HER ZAMAN
// "elle dogrulama gerekli" der, otomatik onaylamaz.
// ---------------------------------------------------------------------------
export const sgkIncentiveRules = pgTable("sgk_incentive_rules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // tesvik adi, serbest metin
  description: text("description"),
  ageMin: integer("age_min"), // opsiyonel yas araligi
  ageMax: integer("age_max"),
  gender: text("gender", { enum: ["kadin", "erkek"] }), // opsiyonel - bossa cinsiyet sarti yok
  requiresDisability: boolean("requires_disability").notNull().default(false),
  region: text("region"), // serbest metin, opsiyonel (il/bolge/sube adi vb.)
  estimatedAmount: doublePrecision("estimated_amount"), // tahmini aylik tutar (TL), opsiyonel
  estimatedRatePercent: doublePrecision("estimated_rate_percent"), // tahmini oran (%), opsiyonel
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// ---------------------------------------------------------------------------
// Lisans (Bolum 4 + Bolum 7): lisans anahtari, aktivasyon tarihi, son gecerlilik
// tarihi. Bu, kurulumun kendi yerel kopyasidir - dogrulama, ayri/kucuk merkezi
// bir API'ye (Bolum 7) karsi yapilir; sonuc burada onbelleklenir.
// ---------------------------------------------------------------------------
export const license = pgTable("license", {
  id: serial("id").primaryKey(),
  licenseKey: text("license_key").notNull(),
  activatedAt: text("activated_at"),
  expiresAt: text("expires_at"),
  lastCheckedAt: text("last_checked_at"),
  status: text("status", { enum: ["aktif", "suresi_doldu", "gecersiz"] })
    .notNull()
    .default("aktif"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// ---------------------------------------------------------------------------
// Kariyer Takibi (komut1.md Faz 1.6 madde 27b): tek tabloda IKI kayit turu -
// "gecmis" (unvan/terfi gecmisi - ne zaman hangi unvana gecti) ve "plan"
// (gelecek kariyer plani - hedef unvan, hedef tarih, gelisim notu). Ayri
// tablolar yerine tek tablo + recordType secildi cunku ikisi de ayni
// "calisan + unvan + tarih" seklini paylasiyor, sadece hangi alanlarin
// dolu oldugu degisiyor (bkz. asagidaki alan yorumlari).
// ---------------------------------------------------------------------------
export const careerRecords = pgTable(
  "career_records",
  {
    id: serial("id").primaryKey(),
    employeeId: integer("employee_id")
      .notNull()
      .references(() => employees.id),
    recordType: text("record_type", { enum: ["gecmis", "plan"] }).notNull(),
    // recordType="gecmis" icin doldurulur: hangi unvana ne zaman gecti.
    title: text("title"), // ör. "Kıdemli Uzman", "Vardiya Amiri"
    effectiveDate: text("effective_date"), // ISO yyyy-mm-dd, unvan/terfi tarihi
    // recordType="plan" icin doldurulur: gelecek kariyer plani.
    targetTitle: text("target_title"), // hedef unvan
    targetDate: text("target_date"), // ISO yyyy-mm-dd, hedeflenen tarih
    developmentNote: text("development_note"), // gelisim notu
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("career_records_employee_idx").on(t.employeeId)]
);

// ---------------------------------------------------------------------------
// TIS ve Sendika / Endustriyel Iliskiler (komut1.md Faz 1.6 madde 26):
// sendika adi, TIS baslangic/bitis tarihi, kapsanan calisan sayisi. Belirli
// bir calisana baglanmaz (bir TIS genelde bir birimi/sendikali kadroyu
// kapsar, tek tek calisan iliskisi tutulmuyor - "kapsanan calisan sayisi"
// duz sayi olarak girilir). Bitis tarihine settings.collectiveAgreementWarningDays
// kala /panel'de kidem esigi takibindeki gibi gorunur bir uyari uretilir
// (bkz. lib/panel-data.ts).
// ---------------------------------------------------------------------------
export const collectiveAgreements = pgTable("collective_agreements", {
  id: serial("id").primaryKey(),
  unionName: text("union_name").notNull(), // sendika adi
  agreementStartDate: text("agreement_start_date").notNull(), // ISO yyyy-mm-dd
  agreementEndDate: text("agreement_end_date").notNull(), // ISO yyyy-mm-dd
  coveredEmployeeCount: integer("covered_employee_count").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// ---------------------------------------------------------------------------
// KVKK Kisisel Veri Envanteri (komut1.md Faz 1.6 madde 28): veri kategorisi
// (serbest/ozellestirilebilir), isleme amaci, hukuki dayanak, saklama suresi,
// aktarilan taraf. Admin ekranindan IK doldurur/duzenler.
//
// ONEMLI: bu bir DOKUMANTASYON aracidir - sistem hicbir veriyi/alani/tabloyu
// tarayip "KVKK'ya uygun mu" diye otomatik denetlemez, sadece IK'nin elle
// girdigi envanteri saklar/gosterir. Bu sinirlama admin ekraninda da acikca
// belirtilir (bkz. app/admin/(dashboard)/kvkk-envanteri/page.tsx).
// ---------------------------------------------------------------------------
export const kvkkInventory = pgTable("kvkk_inventory", {
  id: serial("id").primaryKey(),
  dataCategory: text("data_category").notNull(), // ör. "Kimlik Bilgileri", "Sağlık Verisi" - serbest/ozellestirilebilir
  processingPurpose: text("processing_purpose").notNull(), // isleme amaci
  legalBasis: text("legal_basis").notNull(), // hukuki dayanak, ör. "Açık rıza", "Kanuni yükümlülük (KVKK m.5/2-ç)"
  retentionPeriod: text("retention_period").notNull(), // saklama suresi, serbest metin (ör. "10 yıl")
  transferredParty: text("transferred_party"), // aktarilan taraf, opsiyonel (aktarim yoksa bos)
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// ---------------------------------------------------------------------------
// Icra Takip (komut1.md Faz 1.6 madde 29): calisan, icra dairesi, dosya no,
// toplam borc, aylik kesinti tutari. Kalan bakiye ve durum (devam ediyor/
// tamamlandi) tablo alani DEGIL - totalDebt - deductedAmount uzerinden HER
// ZAMAN otomatik hesaplanir (bkz. lib/garnishments.ts), boylece manuel
// girisle senkron kaybi (yanlis "tamamlandi" isaretleme gibi) mumkun olmaz.
// deductedAmount, admin her ay kesintiyi isledikce (bkz. actions.ts
// processGarnishmentDeductionAction) birikerek artan bir toplamdir.
// ---------------------------------------------------------------------------
export const garnishments = pgTable(
  "garnishments",
  {
    id: serial("id").primaryKey(),
    employeeId: integer("employee_id")
      .notNull()
      .references(() => employees.id),
    enforcementOffice: text("enforcement_office").notNull(), // icra dairesi
    caseNumber: text("case_number").notNull(), // dosya no
    totalDebt: doublePrecision("total_debt").notNull(), // toplam borc (TL)
    monthlyDeductionAmount: doublePrecision("monthly_deduction_amount").notNull(), // aylik kesinti tutari (TL)
    deductedAmount: doublePrecision("deducted_amount").notNull().default(0), // su ana kadar kesilen toplam (TL)
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("garnishments_employee_idx").on(t.employeeId)]
);

// ---------------------------------------------------------------------------
// Musteri denetim skorlari (komut1.md Faz 1.6 madde 23): musteri denetim
// ziyaretlerinin kaydi - musteri adi, tarih, skor (0-100), aciklama.
//
// DIKKAT - bu tablo `audit_log` ile KARISTIRILMAMALI: audit_log admin panelde
// KULLANICININ yaptigi degisikliklerin sistem tarafindan otomatik tuttugu
// teknik islem kaydidir (bkz. lib/audit.ts). customer_audits ise IK'nin elle
// girdigi, MUSTERININ sirketi denetlemeye geldigi ziyaretlerin sonucudur -
// hicbir calisan/departmana baglanmaz, bagimsiz bir kayittir.
// ---------------------------------------------------------------------------
export const customerAudits = pgTable("customer_audits", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  auditDate: text("audit_date").notNull(), // ISO yyyy-mm-dd
  score: doublePrecision("score").notNull(), // 0-100
  description: text("description"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// ---------------------------------------------------------------------------
// Audit log (Bolum 4, Faz 2): admin panelde yapilan her degisiklik
// ---------------------------------------------------------------------------
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  adminUserId: integer("admin_user_id").references(() => adminUsers.id),
  action: text("action").notNull(), // insan-okunur aciklama, ör. "T. Aksoy icin degerlendirme puani girildi"
  createdAt: createdAt(),
});

// ---------------------------------------------------------------------------
// Iliskiler (relations) - sorgu tarafinda employees.with({...}) gibi kullanim icin.
// DDL uretmez, sadece Drizzle query API'sini kolaylastirir.
// ---------------------------------------------------------------------------
export const departmentsRelations = relations(departments, ({ many }) => ({
  employees: many(employees),
}));

export const branchesRelations = relations(branches, ({ many }) => ({
  employees: many(employees),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  department: one(departments, { fields: [employees.departmentId], references: [departments.id] }),
  branch: one(branches, { fields: [employees.branchId], references: [branches.id] }),
  attendanceRecords: many(attendance),
  shiftsOvertime: many(shiftsOvertime),
  evaluations: many(evaluations),
  exitInterviews: many(exitInterviews),
  healthScreenings: many(healthScreenings),
  mandatoryTrainings: many(mandatoryTrainings),
  mediationCases: many(mediationCases),
  disciplinaryRecords: many(disciplinaryRecords),
  recognitions: many(recognitions),
  leaveBalances: many(leaveBalances),
  competencies: many(employeeCompetencies),
  managerNotes: many(managerNotes),
  trainings: many(trainings),
  careerRecords: many(careerRecords),
  garnishments: many(garnishments),
}));

export const careerRecordsRelations = relations(careerRecords, ({ one }) => ({
  employee: one(employees, { fields: [careerRecords.employeeId], references: [employees.id] }),
}));

export const garnishmentsRelations = relations(garnishments, ({ one }) => ({
  employee: one(employees, { fields: [garnishments.employeeId], references: [employees.id] }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  employee: one(employees, { fields: [attendance.employeeId], references: [employees.id] }),
}));

export const shiftsOvertimeRelations = relations(shiftsOvertime, ({ one }) => ({
  employee: one(employees, { fields: [shiftsOvertime.employeeId], references: [employees.id] }),
}));

export const evaluationsRelations = relations(evaluations, ({ one }) => ({
  employee: one(employees, { fields: [evaluations.employeeId], references: [employees.id] }),
  evaluator: one(adminUsers, { fields: [evaluations.evaluatedBy], references: [adminUsers.id] }),
}));

export const criticalRolesRelations = relations(criticalRoles, ({ one }) => ({
  currentEmployee: one(employees, { fields: [criticalRoles.currentEmployeeId], references: [employees.id] }),
}));

export const managerNotesRelations = relations(managerNotes, ({ one }) => ({
  employee: one(employees, { fields: [managerNotes.employeeId], references: [employees.id] }),
  author: one(adminUsers, { fields: [managerNotes.authorId], references: [adminUsers.id] }),
  training: one(trainings, { fields: [managerNotes.trainingId], references: [trainings.id] }),
}));

export const trainingsRelations = relations(trainings, ({ one, many }) => ({
  employee: one(employees, { fields: [trainings.employeeId], references: [employees.id] }),
  // Bu egitime ozel "egitim sonrasi gelisim degerlendirmeleri" (madde 25c/d)
  managerAssessments: many(managerNotes),
}));

export const competencyFieldsRelations = relations(competencyFields, ({ many }) => ({
  employeeCompetencies: many(employeeCompetencies),
}));

export const employeeCompetenciesRelations = relations(employeeCompetencies, ({ one }) => ({
  employee: one(employees, { fields: [employeeCompetencies.employeeId], references: [employees.id] }),
  competencyField: one(competencyFields, {
    fields: [employeeCompetencies.competencyFieldId],
    references: [competencyFields.id],
  }),
}));

export const exitInterviewsRelations = relations(exitInterviews, ({ one }) => ({
  employee: one(employees, { fields: [exitInterviews.employeeId], references: [employees.id] }),
}));

export const healthScreeningsRelations = relations(healthScreenings, ({ one }) => ({
  employee: one(employees, { fields: [healthScreenings.employeeId], references: [employees.id] }),
}));

export const mandatoryTrainingsRelations = relations(mandatoryTrainings, ({ one }) => ({
  employee: one(employees, { fields: [mandatoryTrainings.employeeId], references: [employees.id] }),
}));

export const mediationCasesRelations = relations(mediationCases, ({ one }) => ({
  employee: one(employees, { fields: [mediationCases.employeeId], references: [employees.id] }),
}));

export const disciplinaryRecordsRelations = relations(disciplinaryRecords, ({ one }) => ({
  employee: one(employees, { fields: [disciplinaryRecords.employeeId], references: [employees.id] }),
}));

export const recognitionsRelations = relations(recognitions, ({ one }) => ({
  employee: one(employees, { fields: [recognitions.employeeId], references: [employees.id] }),
}));

export const leaveBalancesRelations = relations(leaveBalances, ({ one }) => ({
  employee: one(employees, { fields: [leaveBalances.employeeId], references: [employees.id] }),
}));

export const adminUsersRelations = relations(adminUsers, ({ one, many }) => ({
  department: one(departments, { fields: [adminUsers.departmentId], references: [departments.id] }),
  auditLogEntries: many(auditLog),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  adminUser: one(adminUsers, { fields: [auditLog.adminUserId], references: [adminUsers.id] }),
}));
