// ---------------------------------------------------------------------------
// /panel dashboard icin veri katmani (Yapim Sirasi adim 3, bkz. bellek notu
// "ik-komuta-merkezi-durum").
//
// Tasarim: agir agregasyonlar (aylik devir hizi, ISG/degerlendirme siralama,
// izin/mesai gruplama) BURADA, sunucuda, tek seferde hesaplanir. Departman/
// sube kirilimi GEREKMEYEN her sey burada bitirilir. Yaka/sube filtresine
// gore YENIDEN hesaplanmasi gereken tek sey - kadro kompozisyonu ve departman
// bazli devamsizlik - bu yuzden o ikisi icin ham veri (calisan bazinda, tek
// tek) dondurulur ve gruplama PanelDashboard (client) tarafinda useMemo ile
// yapilir (bkz. bellek notu "Mimari").
//
// Metodoloji varsayimlari (bellek notunda da kayitli):
//   - Aylik devir hizi = o ay basindaki kadro / o ay icindeki ayrilis sayisi.
//   - Devamsizlik/mesai "son 12 ay" penceresi kullanir (talimatta zaman
//     penceresi netlesmemisti - VARSAYIM).
//   - Departman bazli devamsizlik ORAN degil HAM GUN SAYISI olarak sunulur.
//   - Pazartesi/Cuma sinyali: attendance.dayCount <= 1 olan kayitlari "tek
//     gunluk" sayar (type serbest metin oldugu icin devamsizlik/rapor turu
//     ayrimi yapilamiyor). Gurultu olmamasi icin en az 3 tek gunluk kaydi
//     olan ve bunlarin >= %50'si Pzt/Cuma olan calisanlar listelenir.
//   - Isten cikis maliyeti hesaplayicisi: bos pozisyon maliyeti = ort. bos
//     pozisyon suresi (gun) x gunluk ucret varsayimi. Ayarlarda
//     yapilandirilmamis (null) kalemler 0 kabul edilir.
// ---------------------------------------------------------------------------

import { asc, desc, gte } from "drizzle-orm";
import { db } from "@/db";
import { attendance, branches, careerRecords, collectiveAgreements, criticalRoles, disciplinaryRecords, evaluations, exitInterviews, garnishments, healthScreenings, leaveBalances, mandatoryTrainings, mediationCases, recognitions, shiftsOvertime } from "@/db/schema";
import { computeGarnishmentBalance } from "@/lib/garnishments";
import { getDisabilityQuota, getRiskScoreWeights, getSettings } from "@/lib/settings";
import { computeRiskScores, type RiskScoreRow } from "@/lib/risk-score";

const DAY_MS = 86_400_000;
const TR_MONTHS_SHORT = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

// Pzt/Cuma sinyali icin gurultu esigi (VARSAYIM) - en az bu kadar "tek gunluk" kaydi olmayan calisan gosterilmez.
const MIN_SINGLE_DAY_RECORDS = 3;

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDate(d);
}

function diffDaysFromToday(iso: string, todayIso: string) {
  return Math.round((new Date(`${iso}T00:00:00Z`).getTime() - new Date(`${todayIso}T00:00:00Z`).getTime()) / DAY_MS);
}

function monthStartIso(reference: Date, offsetMonths: number) {
  const d = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() + offsetMonths, 1));
  return isoDate(d);
}

const STATUS_RANK: Record<string, number> = { gecikti: 0, acil: 1, bekliyor: 2, devam: 3, sonlandirildi: 4 };

export type EmployeeSummary = {
  id: number;
  fullName: string;
  departmentId: number;
  departmentName: string;
  branchId: number;
  branchName: string;
  collarType: "mavi" | "beyaz";
  attendanceDays: number; // son 12 ay toplam devamsizlik/rapor gun sayisi
};

export type TurnoverMonth = { month: string; blueRate: number; whiteRate: number; termBlueCount: number; termWhiteCount: number };

export type EvaluationRow = {
  id: number;
  employeeName: string;
  departmentName: string;
  reviewType: "ise_giris" | "periyodik";
  stage: "deneme" | "6_ay" | "1_yil" | "yillik" | "alti_aylik";
  dueDate: string;
  remainingDays: number;
  status: "bekliyor" | "acil" | "gecikti" | "devam" | "sonlandirildi";
  competencyScore: number | null;
  adaptationScore: number | null;
  performanceScore: number | null;
};

export type OvertimeRow = {
  employeeId: number;
  employeeName: string;
  departmentName: string;
  overtimeHours: number;
  nightShiftCount: number;
  weekendOvertimeCount: number;
  overLimit: boolean;
};

export type ScreeningRow = {
  id: number;
  employeeName: string;
  departmentName: string;
  screeningType: string;
  dueDate: string;
  remainingDays: number;
};

// Bolum 5 Faz2 madde 26: ScreeningRow'un birebir yapisal kopyasi (talimat
// geregi "ISG modulueyle ayni mantik, farkli tur alani").
export type TrainingRow = {
  id: number;
  employeeName: string;
  departmentName: string;
  trainingType: string;
  dueDate: string;
  remainingDays: number;
};

export type MondayFridaySignal = {
  employeeId: number;
  employeeName: string;
  departmentName: string;
  totalSingleDay: number;
  mondayCount: number;
  fridayCount: number;
  ratioPercent: number;
};

export type LeaveRow = {
  employeeId: number;
  employeeName: string;
  departmentName: string;
  earnedDays: number;
  usedDays: number;
  remainingDays: number;
  estimatedLiability: number;
  severity: "kritik" | "dikkat";
};

export type DisciplinaryRow = { id: number; employeeName: string; departmentName: string; recordDate: string; type: string; description: string | null };
export type RecognitionRow = { id: number; employeeName: string; departmentName: string; awardName: string; awardDate: string };
export type MediationRow = { id: number; employeeName: string; departmentName: string; caseDate: string; paidAmount: number; estimatedLawsuitCost: number };

// Bolum 5 madde 18: yedegi olmayan (backupCount <= 0) VE bir calisana atanmis
// kritik pozisyonlar - dashboard'da gorunur uyari banner'i icin.
export type CriticalRoleWarning = { id: number; roleName: string; employeeName: string; backupStatus: string | null };

// komut1.md Faz 1.6 madde 26: TIS bitisine settings.collectiveAgreementWarningDays
// gun (varsayilan 90) kala uretilen uyari - kidem esigi takibindeki gibi
// gorunur (bkz. PanelDashboard.tsx "Kritik Rol & Yedekleme Uyarisi" ile ayni patern).
export type CollectiveAgreementWarning = {
  id: number;
  unionName: string;
  agreementEndDate: string;
  coveredEmployeeCount: number;
  remainingDays: number; // negatifse suresi zaten dolmus demektir
};

// komut1.md Faz 1.6 madde 27c: son 12 ayda TAMAMLANMIS periyodik (yillik/6
// aylik, ise_giris DEGIL) degerlendirmelerin performansScore ortalamasi.
// sampleCount 0 ise o ay icin veri yok - grafikte "veri yok" olarak gosterilir.
export type PerformanceTrendMonth = { month: string; avgPerformanceScore: number | null; sampleCount: number };

// komut1.md Faz 1.6 madde 29: aktif (devam_ediyor durumundaki) icra
// dosyalari - kalan bakiye/durum lib/garnishments.ts'ten otomatik hesaplanir.
export type GarnishmentRow = {
  id: number;
  employeeName: string;
  departmentName: string;
  enforcementOffice: string;
  caseNumber: string;
  totalDebt: number;
  remainingBalance: number;
  status: "devam_ediyor" | "tamamlandi";
};

// komut1.md Faz 1.6 madde 27b/c: careerRecords.recordType="plan" olan
// kayitlar - "kariyer plani olan/terfi bekleyen calisanlar" listesi.
export type CareerPlanRow = {
  id: number;
  employeeName: string;
  departmentName: string;
  targetTitle: string;
  targetDate: string;
  remainingDays: number;
  developmentNote: string | null;
};

// Bolum 5 Faz2 madde 23: Devir Maliyeti Ozeti - devir hizi trendi (yukaridaki
// TurnoverMonth) ile Faz1 isten cikis maliyeti hesaplayicisini (CollarCost)
// birlestirir. Ayri bir yeni "birim maliyet varsayimi" icat etmez - mevcut
// Ayarlar'daki kisi-basi maliyet varsayimlariyla ayin GERCEK ayrilis
// sayisini carpar.
export type TurnoverCostMonth = { month: string; cost: number };
export type DepartmentTurnoverCost = { departmentName: string; terminatedCount: number; totalCost: number };

// Bolum 5 Faz2 madde 24: Cikis Mulakati Kok Neden Analizi
export type ExitReasonSummary = { category: string; count: number };

export type CollarCost = {
  vacancyDays: number | null;
  dailyWage: number | null;
  vacancyCost: number;
  hiringCost: number;
  onboardingLoss: number;
  ppeCost: number;
  totalPerHire: number;
  annualTurnoverCount: number;
  annualTotal: number;
};

export type PanelDashboardData = {
  companyName: string;
  branchNames: string[];
  employeeSummaries: EmployeeSummary[];
  totalActiveCount: number;
  blueCollarCount: number;
  whiteCollarCount: number;

  turnoverTrend: TurnoverMonth[];

  evaluations: EvaluationRow[];
  pendingEvaluationCount: number;
  upcomingSeniorityCount: number;

  overtime: OvertimeRow[];
  legalOvertimeLimitHours: number;

  healthScreenings: ScreeningRow[];
  mandatoryTrainings: TrainingRow[];

  mondayFridaySignals: MondayFridaySignal[];

  disabilityQuota: {
    totalHeadcount: number;
    quotaPercentage: number;
    requiredCount: number;
    currentDisabledCount: number;
    gap: number;
    monthlyPenaltyRiskEstimate: number | null;
  };

  leaveBalances: LeaveRow[];
  leaveCriticalThresholdDays: number;
  leaveWarningThresholdDays: number;

  disciplinaryRecords: DisciplinaryRow[];
  recognitions: RecognitionRow[];
  mediationCases: MediationRow[];
  mediationTotalSavings: number;

  exitCost: { mavi: CollarCost; beyaz: CollarCost };
  turnoverCostTrend: TurnoverCostMonth[];
  departmentTurnoverCosts: DepartmentTurnoverCost[];
  exitReasonAnalysis: ExitReasonSummary[];

  criticalRoleWarnings: CriticalRoleWarning[];
  collectiveAgreementWarnings: CollectiveAgreementWarning[];

  performanceTrend: PerformanceTrendMonth[];
  careerPlans: CareerPlanRow[];

  activeGarnishments: GarnishmentRow[];

  riskScores: RiskScoreRow[];
  highRiskCount: number;
};

export async function getPanelDashboardData(): Promise<PanelDashboardData> {
  const now = new Date();
  const todayIso = isoDate(now);
  const cutoff12MoIso = addDays(todayIso, -365);

  const [s, quota, riskWeights, allEmployees, branchRows, attendanceRows, shiftRows, evalRaw, screeningRaw, leaveRaw, disciplinaryRaw, recognitionRaw, mediationRaw, criticalRoleRaw, exitInterviewRaw, trainingRaw, collectiveAgreementRaw, careerPlanRaw, garnishmentRaw] =
    await Promise.all([
      getSettings(),
      getDisabilityQuota(),
      getRiskScoreWeights(),
      db.query.employees.findMany({ with: { department: true, branch: true } }),
      db.select().from(branches).orderBy(asc(branches.name)),
      db.select().from(attendance).where(gte(attendance.date, cutoff12MoIso)),
      db.select().from(shiftsOvertime),
      db.query.evaluations.findMany({ with: { employee: { with: { department: true } } } }),
      db.query.healthScreenings.findMany({ with: { employee: { with: { department: true } } } }),
      db.query.leaveBalances.findMany({ with: { employee: { with: { department: true } } } }),
      db.query.disciplinaryRecords.findMany({ with: { employee: { with: { department: true } } }, orderBy: [desc(disciplinaryRecords.recordDate)] }),
      db.query.recognitions.findMany({ with: { employee: { with: { department: true } } }, orderBy: [desc(recognitions.awardDate)] }),
      db.query.mediationCases.findMany({ with: { employee: { with: { department: true } } }, orderBy: [desc(mediationCases.caseDate)] }),
      db.query.criticalRoles.findMany({ with: { currentEmployee: true } }),
      db.select().from(exitInterviews),
      db.query.mandatoryTrainings.findMany({ with: { employee: { with: { department: true } } } }),
      db.select().from(collectiveAgreements),
      db.query.careerRecords.findMany({
        where: (r, { eq: eqOp }) => eqOp(r.recordType, "plan"),
        with: { employee: { with: { department: true } } },
      }),
      db.query.garnishments.findMany({ with: { employee: { with: { department: true } } } }),
    ]);

  const employeeById = new Map(allEmployees.map((e) => [e.id, e]));

  // ---- Kadro genel gorunum + departman bazli devamsizlik icin ham veri ----
  const attendanceDaysByEmployee = new Map<number, number>();
  const singleDayByEmployee = new Map<number, { total: number; monday: number; friday: number }>();
  for (const row of attendanceRows) {
    attendanceDaysByEmployee.set(row.employeeId, (attendanceDaysByEmployee.get(row.employeeId) ?? 0) + row.dayCount);
    if (row.dayCount <= 1) {
      const day = new Date(`${row.date}T00:00:00Z`).getUTCDay(); // 1 = Pazartesi, 5 = Cuma
      const bucket = singleDayByEmployee.get(row.employeeId) ?? { total: 0, monday: 0, friday: 0 };
      bucket.total += 1;
      if (day === 1) bucket.monday += 1;
      if (day === 5) bucket.friday += 1;
      singleDayByEmployee.set(row.employeeId, bucket);
    }
  }

  const activeEmployees = allEmployees.filter((e) => e.status === "aktif");
  const employeeSummaries: EmployeeSummary[] = activeEmployees
    .map((e) => ({
      id: e.id,
      fullName: e.fullName,
      departmentId: e.departmentId,
      departmentName: e.department?.name ?? "—",
      branchId: e.branchId,
      branchName: e.branch?.name ?? "—",
      collarType: e.collarType,
      attendanceDays: Math.round((attendanceDaysByEmployee.get(e.id) ?? 0) * 10) / 10,
    }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName, "tr"));

  const blueCollarCount = employeeSummaries.filter((e) => e.collarType === "mavi").length;
  const whiteCollarCount = employeeSummaries.length - blueCollarCount;

  const mondayFridaySignals: MondayFridaySignal[] = [...singleDayByEmployee.entries()]
    .filter(([, v]) => v.total >= MIN_SINGLE_DAY_RECORDS && (v.monday + v.friday) / v.total >= 0.5)
    .map(([employeeId, v]) => {
      const emp = employeeById.get(employeeId);
      return {
        employeeId,
        employeeName: emp?.fullName ?? "—",
        departmentName: emp?.department?.name ?? "—",
        totalSingleDay: v.total,
        mondayCount: v.monday,
        fridayCount: v.friday,
        ratioPercent: Math.round(((v.monday + v.friday) / v.total) * 1000) / 10,
      };
    })
    .sort((a, b) => b.ratioPercent - a.ratioPercent);

  // ---- Aylik devir hizi trendi (son 12 ay) ----
  const turnoverTrend: TurnoverMonth[] = [];
  let annualBlueTerminations = 0;
  let annualWhiteTerminations = 0;
  for (let i = 11; i >= 0; i--) {
    const start = monthStartIso(now, -i);
    const end = monthStartIso(now, -i + 1);
    const label = TR_MONTHS_SHORT[new Date(`${start}T00:00:00Z`).getUTCMonth()];

    const headcountBlue = allEmployees.filter((e) => e.collarType === "mavi" && e.hireDate <= start && (!e.terminationDate || e.terminationDate > start)).length;
    const headcountWhite = allEmployees.filter((e) => e.collarType === "beyaz" && e.hireDate <= start && (!e.terminationDate || e.terminationDate > start)).length;
    const termBlue = allEmployees.filter((e) => e.collarType === "mavi" && e.terminationDate && e.terminationDate >= start && e.terminationDate < end).length;
    const termWhite = allEmployees.filter((e) => e.collarType === "beyaz" && e.terminationDate && e.terminationDate >= start && e.terminationDate < end).length;
    annualBlueTerminations += termBlue;
    annualWhiteTerminations += termWhite;

    turnoverTrend.push({
      month: label,
      blueRate: Math.round((termBlue / Math.max(1, headcountBlue)) * 1000) / 10,
      whiteRate: Math.round((termWhite / Math.max(1, headcountWhite)) * 1000) / 10,
      termBlueCount: termBlue,
      termWhiteCount: termWhite,
    });
  }

  // ---- Degerlendirme takibi ----
  const evaluationRows: EvaluationRow[] = evalRaw
    .map((ev) => ({
      id: ev.id,
      employeeName: ev.employee?.fullName ?? "—",
      departmentName: ev.employee?.department?.name ?? "—",
      reviewType: ev.reviewType,
      stage: ev.stage,
      dueDate: ev.dueDate,
      remainingDays: diffDaysFromToday(ev.dueDate, todayIso),
      status: ev.status,
      competencyScore: ev.competencyScore,
      adaptationScore: ev.adaptationScore,
      performanceScore: ev.performanceScore,
    }))
    .sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || a.dueDate.localeCompare(b.dueDate));

  const pendingEvaluationCount = evaluationRows.filter((e) => e.status === "bekliyor" || e.status === "acil" || e.status === "gecikti").length;
  const upcomingSeniorityCount = evaluationRows.filter(
    (e) => e.stage === "1_yil" && (e.status === "acil" || e.status === "gecikti" || e.remainingDays <= 30)
  ).length;

  // ---- Performans trendi (komut1.md Faz 1.6 madde 27c, son 12 ay) ----
  // Sadece PERIYODIK (tum kadro) degerlendirmeler dahil edilir - ise_giris
  // (deneme/6 ay/1 yil) tek seferlik oldugu icin bir "trend" ifade etmez.
  // Puanlanmis (performanceScore dolu) ve "evaluatedAt"i olan kayitlar
  // kullanilir, bucketlama evaluatedAt ayina gore yapilir.
  const periodicScoredEvals = evalRaw.filter((ev) => ev.reviewType === "periyodik" && ev.performanceScore != null && ev.evaluatedAt);
  const performanceTrend: PerformanceTrendMonth[] = [];
  for (let i = 11; i >= 0; i--) {
    const start = monthStartIso(now, -i);
    const end = monthStartIso(now, -i + 1);
    const label = TR_MONTHS_SHORT[new Date(`${start}T00:00:00Z`).getUTCMonth()];
    const scoresInMonth = periodicScoredEvals
      .filter((ev) => ev.evaluatedAt!.slice(0, 10) >= start && ev.evaluatedAt!.slice(0, 10) < end)
      .map((ev) => ev.performanceScore as number);
    performanceTrend.push({
      month: label,
      avgPerformanceScore: scoresInMonth.length > 0 ? Math.round((scoresInMonth.reduce((a, b) => a + b, 0) / scoresInMonth.length) * 10) / 10 : null,
      sampleCount: scoresInMonth.length,
    });
  }

  // ---- Kariyer plani olan / terfi bekleyen calisanlar (madde 27b/c) ----
  const careerPlans: CareerPlanRow[] = careerPlanRaw
    .filter((r) => r.targetTitle && r.targetDate)
    .map((r) => ({
      id: r.id,
      employeeName: r.employee?.fullName ?? "—",
      departmentName: r.employee?.department?.name ?? "—",
      targetTitle: r.targetTitle!,
      targetDate: r.targetDate!,
      remainingDays: diffDaysFromToday(r.targetDate!, todayIso),
      developmentNote: r.developmentNote,
    }))
    .sort((a, b) => a.targetDate.localeCompare(b.targetDate));

  // ---- Icra Takip (komut1.md Faz 1.6 madde 29) ----
  // Sadece HALA DEVAM EDEN (kalan bakiye > 0) dosyalar dashboard'da gosterilir
  // ("aktif icra dosyasi olan calisanlar listesi") - tamamlanmis olanlar
  // /admin/icra-takip'te kayit olarak durmaya devam eder ama panelde gurultu
  // yaratmasin diye burada filtrelenir.
  const activeGarnishments: GarnishmentRow[] = garnishmentRaw
    .map((g) => {
      const { remainingBalance, status } = computeGarnishmentBalance(g.totalDebt, g.deductedAmount);
      return {
        id: g.id,
        employeeName: g.employee?.fullName ?? "—",
        departmentName: g.employee?.department?.name ?? "—",
        enforcementOffice: g.enforcementOffice,
        caseNumber: g.caseNumber,
        totalDebt: g.totalDebt,
        remainingBalance,
        status,
      };
    })
    .filter((g) => g.status === "devam_ediyor")
    .sort((a, b) => b.remainingBalance - a.remainingBalance);

  // ---- Vardiya & mesai yuku (son 12 puantaj donemi) ----
  const last12Periods = new Set<string>();
  for (let i = 0; i < 12; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    last12Periods.add(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  const overtimeAgg = new Map<number, { overtimeHours: number; nightShiftCount: number; weekendOvertimeCount: number }>();
  for (const row of shiftRows) {
    if (!last12Periods.has(row.period)) continue;
    const bucket = overtimeAgg.get(row.employeeId) ?? { overtimeHours: 0, nightShiftCount: 0, weekendOvertimeCount: 0 };
    bucket.overtimeHours += row.overtimeHours;
    bucket.nightShiftCount += row.nightShiftCount;
    bucket.weekendOvertimeCount += row.weekendOvertimeCount;
    overtimeAgg.set(row.employeeId, bucket);
  }
  const overtime: OvertimeRow[] = [...overtimeAgg.entries()]
    .map(([employeeId, v]) => {
      const emp = employeeById.get(employeeId);
      return {
        employeeId,
        employeeName: emp?.fullName ?? "—",
        departmentName: emp?.department?.name ?? "—",
        overtimeHours: Math.round(v.overtimeHours * 10) / 10,
        nightShiftCount: v.nightShiftCount,
        weekendOvertimeCount: v.weekendOvertimeCount,
        overLimit: v.overtimeHours > s.legalOvertimeLimitHours,
      };
    })
    .sort((a, b) => b.overtimeHours - a.overtimeHours);

  // ---- ISG tarama takibi ----
  const healthScreeningRows: ScreeningRow[] = screeningRaw
    .map((row) => ({
      id: row.id,
      employeeName: row.employee?.fullName ?? "—",
      departmentName: row.employee?.department?.name ?? "—",
      screeningType: row.screeningType,
      dueDate: row.dueDate,
      remainingDays: diffDaysFromToday(row.dueDate, todayIso),
    }))
    .sort((a, b) => a.remainingDays - b.remainingDays);

  // ---- Zorunlu egitim takibi (Bolum 5 Faz2 madde 26 - ISG'nin birebir kopyasi) ----
  const mandatoryTrainingRows: TrainingRow[] = trainingRaw
    .map((row) => ({
      id: row.id,
      employeeName: row.employee?.fullName ?? "—",
      departmentName: row.employee?.department?.name ?? "—",
      trainingType: row.trainingType,
      dueDate: row.dueDate,
      remainingDays: diffDaysFromToday(row.dueDate, todayIso),
    }))
    .sort((a, b) => a.remainingDays - b.remainingDays);

  // ---- Birikmis yillik izin bakiyesi (her calisan icin en guncel yil) ----
  const leaveByEmployee = new Map<number, (typeof leaveRaw)[number]>();
  for (const row of leaveRaw) {
    const existing = leaveByEmployee.get(row.employeeId);
    if (!existing || row.asOfYear > existing.asOfYear) leaveByEmployee.set(row.employeeId, row);
  }
  const leaveBalanceRows: LeaveRow[] = [...leaveByEmployee.values()]
    .filter((row) => row.remainingDaysTotal >= s.leaveWarningThresholdDays)
    .sort((a, b) => b.remainingDaysTotal - a.remainingDaysTotal)
    .map((row) => {
      const emp = row.employee;
      const fallbackDailyWage = emp?.collarType === "mavi" ? s.defaultDailyWageBlueCollar : s.defaultDailyWageWhiteCollar;
      const dailyWage = (emp?.monthlySalary != null ? emp.monthlySalary / 30 : fallbackDailyWage) ?? 0;
      return {
        employeeId: row.employeeId,
        employeeName: emp?.fullName ?? "—",
        departmentName: emp?.department?.name ?? "—",
        earnedDays: row.earnedDays,
        usedDays: row.usedDays,
        remainingDays: row.remainingDaysTotal,
        estimatedLiability: Math.round(row.remainingDaysTotal * dailyWage),
        severity: row.remainingDaysTotal >= s.leaveCriticalThresholdDays ? "kritik" : "dikkat",
      };
    });

  // ---- Ayrilma Riski Skoru v1 (Bolum 5 Faz1.5 madde 19) ----
  const overtimeHoursByEmployee = new Map<number, number>([...overtimeAgg.entries()].map(([id, v]) => [id, v.overtimeHours]));
  const leaveRemainingByEmployee = new Map<number, number>([...leaveByEmployee.entries()].map(([id, row]) => [id, row.remainingDaysTotal]));
  const riskScores = computeRiskScores({
    employees: activeEmployees.map((e) => ({ id: e.id, fullName: e.fullName, departmentName: e.department?.name ?? "—", hireDate: e.hireDate })),
    attendanceRows,
    overtimeHoursByEmployee,
    disciplinaryRows: disciplinaryRaw,
    leaveRemainingByEmployee,
    legalOvertimeLimitHours: s.legalOvertimeLimitHours,
    weights: riskWeights,
    todayIso,
  });
  const highRiskCount = riskScores.filter((r) => r.band === "yuksek").length;

  // ---- Tutanak / odul / arabuluculuk ----
  const disciplinaryRows: DisciplinaryRow[] = disciplinaryRaw.map((row) => ({
    id: row.id,
    employeeName: row.employee?.fullName ?? "—",
    departmentName: row.employee?.department?.name ?? "—",
    recordDate: row.recordDate,
    type: row.type,
    description: row.description,
  }));

  const recognitionRows: RecognitionRow[] = recognitionRaw.map((row) => ({
    id: row.id,
    employeeName: row.employee?.fullName ?? "—",
    departmentName: row.employee?.department?.name ?? "—",
    awardName: row.awardName,
    awardDate: row.awardDate,
  }));

  // ---- Kritik Rol & Yedekleme uyarisi (Bolum 5 madde 18) ----
  // Sadece SU AN bir calisana atanmis (currentEmployeeId doluysa) VE yedegi
  // olmayan (backupCount <= 0) pozisyonlar uyari uretir - bos/atanmamis
  // pozisyonlar icin "[Ad Soyad] ayrilirsa" cumlesi kurulamaz.
  const criticalRoleWarnings: CriticalRoleWarning[] = criticalRoleRaw
    .filter((row) => row.backupCount <= 0 && row.currentEmployeeId != null)
    .map((row) => ({
      id: row.id,
      roleName: row.roleName,
      employeeName: row.currentEmployee?.fullName ?? "—",
      backupStatus: row.backupStatus,
    }));

  // ---- TIS ve Sendika uyarisi (komut1.md Faz 1.6 madde 26) ----
  // Kidem esigi (leaveCriticalThresholdDays) ile ayni "esik gun sayisi kadar
  // kala uyar" deseni - admin panelden degistirilebilir esik ayarlarda.
  const collectiveAgreementWarnings: CollectiveAgreementWarning[] = collectiveAgreementRaw
    .map((row) => ({
      id: row.id,
      unionName: row.unionName,
      agreementEndDate: row.agreementEndDate,
      coveredEmployeeCount: row.coveredEmployeeCount,
      remainingDays: diffDaysFromToday(row.agreementEndDate, todayIso),
    }))
    .filter((w) => w.remainingDays <= s.collectiveAgreementWarningDays)
    .sort((a, b) => a.remainingDays - b.remainingDays);

  const mediationRows: MediationRow[] = mediationRaw.map((row) => ({
    id: row.id,
    employeeName: row.employee?.fullName ?? "—",
    departmentName: row.employee?.department?.name ?? "—",
    caseDate: row.caseDate,
    paidAmount: row.paidAmount,
    estimatedLawsuitCost: row.estimatedLawsuitCost,
  }));
  const mediationTotalSavings = mediationRows.reduce((sum, m) => sum + (m.estimatedLawsuitCost - m.paidAmount), 0);

  // ---- Zorunlu istihdam (engelli) ----
  const requiredCount = Math.round(quota.totalHeadcount * s.disabilityQuotaPercentage);
  const disabilityQuotaData = {
    totalHeadcount: quota.totalHeadcount,
    quotaPercentage: s.disabilityQuotaPercentage,
    requiredCount,
    currentDisabledCount: quota.currentDisabledEmployeeCount,
    gap: Math.max(0, requiredCount - quota.currentDisabledEmployeeCount),
    monthlyPenaltyRiskEstimate: quota.monthlyPenaltyRiskEstimate,
  };

  // ---- Isten cikis maliyeti hesaplayici (4 kalem x mavi/beyaz) ----
  function collarCost(collar: "mavi" | "beyaz"): CollarCost {
    const vacancyDays = collar === "mavi" ? s.avgVacancyDaysBlueCollar : s.avgVacancyDaysWhiteCollar;
    const dailyWage = collar === "mavi" ? s.defaultDailyWageBlueCollar : s.defaultDailyWageWhiteCollar;
    const hiringCost = (collar === "mavi" ? s.defaultHiringCostBlueCollar : s.defaultHiringCostWhiteCollar) ?? 0;
    const onboardingLoss = (collar === "mavi" ? s.onboardingProductivityLossCostBlueCollar : s.onboardingProductivityLossCostWhiteCollar) ?? 0;
    const ppeCost = (collar === "mavi" ? s.defaultPpeCostBlueCollar : s.defaultPpeCostWhiteCollar) ?? 0;
    const vacancyCost = (vacancyDays ?? 0) * (dailyWage ?? 0);
    const totalPerHire = vacancyCost + hiringCost + onboardingLoss + ppeCost;
    const annualTurnoverCount = collar === "mavi" ? annualBlueTerminations : annualWhiteTerminations;
    return {
      vacancyDays,
      dailyWage,
      vacancyCost: Math.round(vacancyCost),
      hiringCost,
      onboardingLoss,
      ppeCost,
      totalPerHire: Math.round(totalPerHire),
      annualTurnoverCount,
      annualTotal: Math.round(totalPerHire * annualTurnoverCount),
    };
  }

  const maviCost = collarCost("mavi");
  const beyazCost = collarCost("beyaz");

  // ---- Devir Maliyeti Ozeti (Bolum 5 Faz2 madde 23) ----
  const turnoverCostTrend: TurnoverCostMonth[] = turnoverTrend.map((m) => ({
    month: m.month,
    cost: Math.round(m.termBlueCount * maviCost.totalPerHire + m.termWhiteCount * beyazCost.totalPerHire),
  }));

  const departmentTurnoverCostMap = new Map<string, { terminatedCount: number; totalCost: number }>();
  for (const e of allEmployees) {
    if (!e.terminationDate || e.terminationDate < cutoff12MoIso) continue;
    const deptName = e.department?.name ?? "—";
    const perHireCost = e.collarType === "mavi" ? maviCost.totalPerHire : beyazCost.totalPerHire;
    const existing = departmentTurnoverCostMap.get(deptName) ?? { terminatedCount: 0, totalCost: 0 };
    existing.terminatedCount += 1;
    existing.totalCost += perHireCost;
    departmentTurnoverCostMap.set(deptName, existing);
  }
  const departmentTurnoverCosts: DepartmentTurnoverCost[] = [...departmentTurnoverCostMap.entries()]
    .map(([departmentName, v]) => ({ departmentName, terminatedCount: v.terminatedCount, totalCost: Math.round(v.totalCost) }))
    .sort((a, b) => b.totalCost - a.totalCost);

  // ---- Cikis mulakati kok neden analizi (Bolum 5 Faz2 madde 24) ----
  // VARSAYIM: zaman penceresi YOK (son 12 ay degil) - cikis mulakati seyrek
  // bir olay, kok neden orunutusunun anlamli olmasi icin elde ne varsa
  // kullanilir. Kategori listesi lib/exit-interviews.ts'te sabit.
  const exitReasonCounts = new Map<string, number>();
  for (const row of exitInterviewRaw) {
    exitReasonCounts.set(row.reasonCategory, (exitReasonCounts.get(row.reasonCategory) ?? 0) + 1);
  }
  const exitReasonAnalysis: ExitReasonSummary[] = [...exitReasonCounts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return {
    companyName: s.companyName,
    branchNames: branchRows.map((b) => b.name),
    employeeSummaries,
    totalActiveCount: employeeSummaries.length,
    blueCollarCount,
    whiteCollarCount,

    turnoverTrend,

    evaluations: evaluationRows,
    pendingEvaluationCount,
    upcomingSeniorityCount,

    overtime,
    legalOvertimeLimitHours: s.legalOvertimeLimitHours,

    healthScreenings: healthScreeningRows,
    mandatoryTrainings: mandatoryTrainingRows,

    mondayFridaySignals,

    disabilityQuota: disabilityQuotaData,

    leaveBalances: leaveBalanceRows,
    leaveCriticalThresholdDays: s.leaveCriticalThresholdDays,
    leaveWarningThresholdDays: s.leaveWarningThresholdDays,

    disciplinaryRecords: disciplinaryRows,
    recognitions: recognitionRows,
    mediationCases: mediationRows,
    mediationTotalSavings,

    exitCost: { mavi: maviCost, beyaz: beyazCost },
    turnoverCostTrend,
    departmentTurnoverCosts,
    exitReasonAnalysis,

    criticalRoleWarnings,
    collectiveAgreementWarnings,

    performanceTrend,
    careerPlans,

    activeGarnishments,

    riskScores,
    highRiskCount,
  };
}
