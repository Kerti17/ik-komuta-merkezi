// ---------------------------------------------------------------------------
// Patron Raporu (Bolum 5 Faz1 madde 11, Bolum 8) - tek sayfalik yonetici
// ozeti icin veri turetme mantigi. Referans ik-komuta-merkezi.jsx'teki
// ExecutiveSummary bileseni "3 buyuk risk" / "2 kritik karar" listelerini
// SABIT/demo metin olarak tutuyordu (kritik rol yedekleme gibi Faz2 verisine
// bile referans veriyordu). Burada BILINCLI olarak KURALA DAYALI, gercek
// panel verisinden (bkz. lib/panel-data.ts) turetilen bir tasarima gecildi -
// aksi halde "gercek verilerle otomatik guncellenir" iddiasi dogru olmazdi.
// VARSAYIM: kurallarin agirliklari/esikleri (ozellikle devir hizi esigi)
// keyfidir, gercek kullanimda ayarlanabilir hale getirilmesi Faz2'lik bir is.
// ---------------------------------------------------------------------------
import type { PanelDashboardData } from "./panel-data";

const fmtTL = (n: number) => n.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

type Candidate = { text: string; weight: number };

function buildRiskCandidates(data: PanelDashboardData): Candidate[] {
  const candidates: Candidate[] = [];

  if (data.upcomingSeniorityCount > 0) {
    candidates.push({
      weight: 100,
      text: `${data.upcomingSeniorityCount} çalışan dosyasında kıdem tazminatı eşiği kararı (1. yıl) 30 gün içinde ya da geçmiş durumda — gecikme tazminat riski doğurur.`,
    });
  }

  if (data.disabilityQuota.gap > 0) {
    const penaltyPart =
      data.disabilityQuota.monthlyPenaltyRiskEstimate != null
        ? ` — aylık tahmini idari para cezası riski ${fmtTL(data.disabilityQuota.monthlyPenaltyRiskEstimate)}.`
        : ".";
    candidates.push({ weight: 90, text: `Engelli çalışan kontenjanında ${data.disabilityQuota.gap} kişilik açık${penaltyPart}` });
  }

  const overLimitCount = data.overtime.filter((o) => o.overLimit).length;
  if (overLimitCount > 0) {
    candidates.push({
      weight: 80,
      text: `${overLimitCount} çalışan yasal yıllık fazla mesai limitini (${data.legalOvertimeLimitHours} saat) aştı — işgücü sağlığı ve iş hukuku riski taşıyor.`,
    });
  }

  const overdueScreeningCount = data.healthScreenings.filter((h) => h.remainingDays < 0).length;
  if (overdueScreeningCount > 0) {
    candidates.push({ weight: 70, text: `${overdueScreeningCount} zorunlu ISG taramasının süresi geçti — iş güvenliği ve idari risk taşıyor.` });
  }

  const criticalLeave = data.leaveBalances.filter((l) => l.severity === "kritik");
  if (criticalLeave.length > 0) {
    const totalLiability = criticalLeave.reduce((sum, l) => sum + l.estimatedLiability, 0);
    candidates.push({
      weight: 65,
      text: `${criticalLeave.length} çalışanın izin bakiyesi kritik eşiği aştı — ayrılık halinde toplam ${fmtTL(totalLiability)} nakit ödeme yükümlülüğü riski.`,
    });
  }

  if (data.mondayFridaySignals.length > 0) {
    candidates.push({
      weight: 50,
      text: `${data.mondayFridaySignals.length} çalışanda Pazartesi/Cuma devamsızlık örüntüsü tespit edildi — İK görüşmesi önerilir.`,
    });
  }

  const thisMonth = data.turnoverTrend[data.turnoverTrend.length - 1];
  if (thisMonth && thisMonth.blueRate >= 5) {
    // Esik VARSAYIM - "yuksek" devir hizi icin sabit bir kesim noktasi yok.
    candidates.push({ weight: 40, text: `Mavi yaka aylık devir hızı %${thisMonth.blueRate} ile yüksek seyrediyor — işe alım ve oryantasyon maliyetini artırıyor.` });
  }

  return candidates.sort((a, b) => b.weight - a.weight);
}

function buildDecisionCandidates(data: PanelDashboardData): Candidate[] {
  const candidates: Candidate[] = [];

  const overLimitCount = data.overtime.filter((o) => o.overLimit).length;
  if (overLimitCount > 0) {
    candidates.push({ weight: 90, text: `Vardiya/mesai planı gözden geçirilmeli: ${overLimitCount} çalışan yasal fazla mesai limitini aştı.` });
  }

  if (data.pendingEvaluationCount > 0) {
    candidates.push({ weight: 80, text: `${data.pendingEvaluationCount} bekleyen/geciken değerlendirme dosyası bu hafta karara bağlanmalı.` });
  }

  const criticalLeaveCount = data.leaveBalances.filter((l) => l.severity === "kritik").length;
  if (criticalLeaveCount > 0) {
    candidates.push({ weight: 70, text: `Kritik izin bakiyesi olan ${criticalLeaveCount} çalışan için kullandırma planı oluşturulmalı.` });
  }

  if (data.disabilityQuota.gap > 0) {
    candidates.push({ weight: 60, text: `Engelli istihdam kontenjanı açığını (${data.disabilityQuota.gap} kişi) kapatmak için işe alım süreci başlatılmalı.` });
  }

  const overdueScreeningCount = data.healthScreenings.filter((h) => h.remainingDays < 0).length;
  if (overdueScreeningCount > 0) {
    candidates.push({ weight: 50, text: `Süresi geçen ${overdueScreeningCount} ISG taraması bu ay içinde tamamlanmalı.` });
  }

  return candidates.sort((a, b) => b.weight - a.weight);
}

export type ExecutiveSummary = {
  totalActiveCount: number;
  monthlyWorkforceCost: number | null;
  monthlyRevenue: number | null;
  workforceCostRatioPercent: number | null;
  annualExitCostTotal: number;
  mediationTotalSavings: number;
  risks: string[];
  decisions: string[];
};

export function buildExecutiveSummary(
  data: PanelDashboardData,
  settings: { monthlyWorkforceCost: number | null; monthlyRevenue: number | null }
): ExecutiveSummary {
  const risks = buildRiskCandidates(data)
    .slice(0, 3)
    .map((c) => c.text);
  const decisions = buildDecisionCandidates(data)
    .slice(0, 2)
    .map((c) => c.text);

  const workforceCostRatioPercent =
    settings.monthlyWorkforceCost != null && settings.monthlyRevenue
      ? Math.round((settings.monthlyWorkforceCost / settings.monthlyRevenue) * 1000) / 10
      : null;

  return {
    totalActiveCount: data.totalActiveCount,
    monthlyWorkforceCost: settings.monthlyWorkforceCost,
    monthlyRevenue: settings.monthlyRevenue,
    workforceCostRatioPercent,
    annualExitCostTotal: data.exitCost.mavi.annualTotal + data.exitCost.beyaz.annualTotal,
    mediationTotalSavings: data.mediationTotalSavings,
    risks: risks.length > 0 ? risks : ["Bu ay öne çıkan majör bir risk tespit edilmedi."],
    decisions: decisions.length > 0 ? decisions : ["Bu ay acil bir yönetsel karar gerektiren durum tespit edilmedi."],
  };
}
