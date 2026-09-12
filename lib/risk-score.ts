// ---------------------------------------------------------------------------
// Ayrilma Riski Skoru v1 (claude-code-talimati.md Bolum 5 Faz1.5 madde 19).
// 0-100 arasi agirlikli skor, bes sinyalden hesaplanir:
//   - Devamsizlik trendi   (%30 varsayilan agirlik)
//   - Fazla mesai yuku     (%20)
//   - Tutanak sayisi       (%20)
//   - Kidem <1 yil         (%15)
//   - Birikmis izin        (%15)
// Agirliklar db/schema.ts -> risk_score_weights tablosundan gelir (admin
// panelden degistirilebilir, burada SABITLENMEZ).
//
// Normalizasyon kurallari (VARSAYIM - talimat "0-100 arasinda normalize
// edilir" diyor ama esik degerlerini vermiyor, madde 19 metninde de "bu ilk
// versiyon, zamanla kalibre edilecek" deniyor):
//   - Devamsizlik trendi: (son 90 gun - onceki 90 gun) / onceki 90 gun * 100,
//     0-100 araligina sikistirilir. Onceki donem 0 ise: simdiki donem de 0'sa
//     skor 0, degilse (yeni ortaya cikan bir sorun) skor 100.
//   - Fazla mesai yuku: yillik fazla mesai / yasal limit * 100, tavan 100.
//   - Tutanak sayisi: son 12 aydaki tutanak sayisi / 3 * 100, tavan 100
//     (3+ tutanak = tavan skor).
//   - Kidem <1 yil: ikili - ise giris tarihinden bugune <365 gunse 100, degilse 0.
//   - Birikmis izin: kalan/birikmis gun / 30 * 100, tavan 100 (talimattaki
//     "30+ gun" esigi).
// ---------------------------------------------------------------------------

const DAY_MS = 86_400_000;

function diffDays(fromIso: string, toIso: string) {
  return Math.round((new Date(`${toIso}T00:00:00Z`).getTime() - new Date(`${fromIso}T00:00:00Z`).getTime()) / DAY_MS);
}

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function clamp01to100(n: number) {
  return Math.max(0, Math.min(100, n));
}

// Risk bandi esikleri (VARSAYIM - talimatta belirtilmemis).
const HIGH_THRESHOLD = 70;
const MEDIUM_THRESHOLD = 40;

export type RiskWeights = {
  attendanceTrendWeight: number;
  overtimeLoadWeight: number;
  disciplinaryCountWeight: number;
  lowSeniorityWeight: number;
  accruedLeaveWeight: number;
};

export type RiskScoreRow = {
  employeeId: number;
  employeeName: string;
  departmentName: string;
  score: number;
  band: "yuksek" | "orta" | "dusuk";
  signals: {
    attendanceTrend: number;
    overtimeLoad: number;
    disciplinaryCount: number;
    lowSeniority: number;
    accruedLeave: number;
  };
};

export function computeRiskScores(input: {
  employees: { id: number; fullName: string; departmentName: string; hireDate: string }[];
  attendanceRows: { employeeId: number; date: string; dayCount: number }[];
  overtimeHoursByEmployee: Map<number, number>; // yillik toplam fazla mesai saati (son 12 donem)
  disciplinaryRows: { employeeId: number; recordDate: string }[]; // filtrelenmemis, burada son 12 ayla sinirlanir
  leaveRemainingByEmployee: Map<number, number>;
  legalOvertimeLimitHours: number;
  weights: RiskWeights;
  todayIso: string;
}): RiskScoreRow[] {
  const { employees, attendanceRows, overtimeHoursByEmployee, disciplinaryRows, leaveRemainingByEmployee, legalOvertimeLimitHours, weights, todayIso } = input;

  const recentStart = addDays(todayIso, -90);
  const previousStart = addDays(todayIso, -180);
  const disciplinaryCutoff = addDays(todayIso, -365);

  const recentByEmployee = new Map<number, number>();
  const previousByEmployee = new Map<number, number>();
  for (const row of attendanceRows) {
    if (row.date >= recentStart) {
      recentByEmployee.set(row.employeeId, (recentByEmployee.get(row.employeeId) ?? 0) + row.dayCount);
    } else if (row.date >= previousStart) {
      previousByEmployee.set(row.employeeId, (previousByEmployee.get(row.employeeId) ?? 0) + row.dayCount);
    }
  }

  const disciplinaryCountByEmployee = new Map<number, number>();
  for (const row of disciplinaryRows) {
    if (row.recordDate < disciplinaryCutoff) continue;
    disciplinaryCountByEmployee.set(row.employeeId, (disciplinaryCountByEmployee.get(row.employeeId) ?? 0) + 1);
  }

  const totalWeight =
    weights.attendanceTrendWeight +
      weights.overtimeLoadWeight +
      weights.disciplinaryCountWeight +
      weights.lowSeniorityWeight +
      weights.accruedLeaveWeight || 1; // hepsi 0 olursa 0'a bolme yerine skor 0 doner

  const rows: RiskScoreRow[] = employees.map((e) => {
    const recent = recentByEmployee.get(e.id) ?? 0;
    const previous = previousByEmployee.get(e.id) ?? 0;
    const attendanceTrend = previous <= 0 ? (recent > 0 ? 100 : 0) : clamp01to100(((recent - previous) / previous) * 100);

    const annualOvertime = overtimeHoursByEmployee.get(e.id) ?? 0;
    const overtimeLoad = clamp01to100((annualOvertime / Math.max(1, legalOvertimeLimitHours)) * 100);

    const disciplinaryCount = disciplinaryCountByEmployee.get(e.id) ?? 0;
    const disciplinaryScore = clamp01to100((disciplinaryCount / 3) * 100);

    const tenureDays = diffDays(e.hireDate, todayIso);
    const lowSeniority = tenureDays < 365 ? 100 : 0;

    const remainingLeave = leaveRemainingByEmployee.get(e.id) ?? 0;
    const accruedLeave = clamp01to100((remainingLeave / 30) * 100);

    const score = Math.round(
      (attendanceTrend * weights.attendanceTrendWeight +
        overtimeLoad * weights.overtimeLoadWeight +
        disciplinaryScore * weights.disciplinaryCountWeight +
        lowSeniority * weights.lowSeniorityWeight +
        accruedLeave * weights.accruedLeaveWeight) /
        totalWeight
    );

    const band: RiskScoreRow["band"] = score >= HIGH_THRESHOLD ? "yuksek" : score >= MEDIUM_THRESHOLD ? "orta" : "dusuk";

    return {
      employeeId: e.id,
      employeeName: e.fullName,
      departmentName: e.departmentName,
      score,
      band,
      signals: {
        attendanceTrend: Math.round(attendanceTrend),
        overtimeLoad: Math.round(overtimeLoad),
        disciplinaryCount: Math.round(disciplinaryScore),
        lowSeniority,
        accruedLeave: Math.round(accruedLeave),
      },
    };
  });

  return rows.sort((a, b) => b.score - a.score);
}
