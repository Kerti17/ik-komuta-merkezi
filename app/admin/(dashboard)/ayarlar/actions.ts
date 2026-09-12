"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { settings, riskScoreWeights } from "@/db/schema";
import { getSettings, getRiskScoreWeights } from "@/lib/settings";
import { logAudit } from "@/lib/audit";

export type SettingsState = { error?: string; success?: boolean } | undefined;

const numberField = (min: number, max: number) =>
  z
    .string()
    .transform((v) => Number(v))
    .pipe(z.number().min(min).max(max));

const optionalMoneyField = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? Number(v) : null))
  .pipe(z.number().min(0).nullable());

const optionalDayCountField = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? Number(v) : null))
  .pipe(z.number().int().min(0).nullable());

const schema = z.object({
  companyName: z.string().trim().min(1, "Şirket adı boş olamaz").max(200),
  trialPeriodMonths: numberField(1, 24),
  legalOvertimeLimitHours: numberField(1, 2000),
  leaveCriticalThresholdDays: numberField(1, 365),
  leaveWarningThresholdDays: numberField(0, 365),
  collectiveAgreementWarningDays: numberField(1, 730),
  disabilityQuotaPercent: numberField(0, 100),
  defaultDailyWageBlueCollar: optionalMoneyField,
  defaultDailyWageWhiteCollar: optionalMoneyField,
  defaultHiringCostBlueCollar: optionalMoneyField,
  defaultHiringCostWhiteCollar: optionalMoneyField,
  defaultPpeCostBlueCollar: optionalMoneyField,
  defaultPpeCostWhiteCollar: optionalMoneyField,
  avgVacancyDaysBlueCollar: optionalDayCountField,
  avgVacancyDaysWhiteCollar: optionalDayCountField,
  onboardingProductivityLossCostBlueCollar: optionalMoneyField,
  onboardingProductivityLossCostWhiteCollar: optionalMoneyField,
  monthlyWorkforceCost: optionalMoneyField,
  monthlyRevenue: optionalMoneyField,
});

export async function updateSettingsAction(_prevState: SettingsState, formData: FormData): Promise<SettingsState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };
  }

  if (parsed.data.leaveWarningThresholdDays >= parsed.data.leaveCriticalThresholdDays) {
    return { error: "\"Dikkat\" eşiği, \"kritik\" eşiğinden küçük olmalı." };
  }

  const current = await getSettings();
  const { disabilityQuotaPercent, ...rest } = parsed.data;

  await db
    .update(settings)
    .set({
      ...rest,
      disabilityQuotaPercentage: disabilityQuotaPercent / 100,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(settings.id, current.id));

  await logAudit("Genel ayarlar güncellendi");
  revalidatePath("/admin/ayarlar");
  revalidatePath("/admin");
  revalidatePath("/panel");
  return { success: true };
}

// Ayrılma Riski Skoru v1 ağırlıkları (Bölüm 5 Faz1.5 madde 19) - risk_score_weights
// tablosu ayrı bir tablo, bu yüzden ayrı bir action/form (bkz. RiskWeightsForm.tsx).
const weightField = z
  .string()
  .transform((v) => Number(v))
  .pipe(z.number().min(0, "0 veya daha büyük olmalı").max(1000, "Çok büyük"));

const riskWeightsSchema = z.object({
  attendanceTrendWeight: weightField,
  overtimeLoadWeight: weightField,
  disciplinaryCountWeight: weightField,
  lowSeniorityWeight: weightField,
  accruedLeaveWeight: weightField,
});

export async function updateRiskWeightsAction(_prevState: SettingsState, formData: FormData): Promise<SettingsState> {
  const parsed = riskWeightsSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  const sumWeights = Object.values(parsed.data).reduce((a, b) => a + b, 0);
  if (sumWeights <= 0) return { error: "En az bir ağırlık 0'dan büyük olmalı." };

  const current = await getRiskScoreWeights();
  await db
    .update(riskScoreWeights)
    .set({ ...parsed.data, updatedAt: new Date().toISOString() })
    .where(eq(riskScoreWeights.id, current.id));

  await logAudit("Ayrılma riski skoru ağırlıkları güncellendi");
  revalidatePath("/admin/ayarlar");
  revalidatePath("/panel");
  return { success: true };
}
