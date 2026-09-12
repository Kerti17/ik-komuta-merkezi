"use client";

import { useActionState } from "react";
import { Card, Field, FormGrid, Input, ErrorBanner, SuccessBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { updateSettingsAction, type SettingsState } from "./actions";
import type { InferSelectModel } from "drizzle-orm";
import type { settings } from "@/db/schema";

type SettingsRow = InferSelectModel<typeof settings>;

export function SettingsForm({ settings: s }: { settings: SettingsRow }) {
  const [state, formAction] = useActionState<SettingsState, FormData>(updateSettingsAction, undefined);

  return (
    <form action={formAction}>
      <ErrorBanner message={state?.error} />
      <SuccessBanner message={state?.success ? "Ayarlar kaydedildi." : null} />

      <Card title="Genel" description="Şirket adı, raporlarda ve panelde görünür.">
        <FormGrid>
          <Field label="Şirket Adı" htmlFor="companyName" required>
            <Input id="companyName" name="companyName" defaultValue={s.companyName} required />
          </Field>
        </FormGrid>
      </Card>

      <Card
        title="Değerlendirme & Mesai Parametreleri"
        description="Bölüm 5 Faz1 madde 4 ve 5 — deneme süresi ve yasal fazla mesai limiti."
      >
        <FormGrid>
          <Field label="Deneme Süresi (ay)" htmlFor="trialPeriodMonths" required>
            <Input id="trialPeriodMonths" name="trialPeriodMonths" type="number" min={1} max={24} defaultValue={s.trialPeriodMonths} required />
          </Field>
          <Field label="Yasal Fazla Mesai Limiti (saat/yıl)" htmlFor="legalOvertimeLimitHours" required>
            <Input
              id="legalOvertimeLimitHours"
              name="legalOvertimeLimitHours"
              type="number"
              min={1}
              max={2000}
              defaultValue={s.legalOvertimeLimitHours}
              required
            />
          </Field>
        </FormGrid>
      </Card>

      <Card title="İzin Bakiyesi Eşikleri" description="Bölüm 5 Faz1 madde 14 — birikmiş izin uyarı eşikleri (gün).">
        <FormGrid>
          <Field label="Kritik Eşik (gün, ≥)" htmlFor="leaveCriticalThresholdDays" required>
            <Input
              id="leaveCriticalThresholdDays"
              name="leaveCriticalThresholdDays"
              type="number"
              min={1}
              max={365}
              defaultValue={s.leaveCriticalThresholdDays}
              required
            />
          </Field>
          <Field label="Dikkat Eşiği (gün, ≥)" htmlFor="leaveWarningThresholdDays" required>
            <Input
              id="leaveWarningThresholdDays"
              name="leaveWarningThresholdDays"
              type="number"
              min={0}
              max={365}
              defaultValue={s.leaveWarningThresholdDays}
              required
            />
          </Field>
        </FormGrid>
      </Card>

      <Card title="TİS ve Sendika Uyarı Eşiği" description="komut1.md Faz 1.6 madde 26 — TİS bitiş tarihine kaç gün kala panelde uyarı gösterileceği.">
        <FormGrid>
          <Field label="Uyarı Eşiği (gün)" htmlFor="collectiveAgreementWarningDays" required>
            <Input
              id="collectiveAgreementWarningDays"
              name="collectiveAgreementWarningDays"
              type="number"
              min={1}
              max={730}
              defaultValue={s.collectiveAgreementWarningDays}
              required
            />
          </Field>
        </FormGrid>
      </Card>

      <Card title="Zorunlu İstihdam (Engelli) Kontenjanı" description="Bölüm 5 Faz1 madde 8 — İş Kanunu m.30 kontenjan oranı.">
        <FormGrid>
          <Field label="Yasal Kontenjan Oranı (%)" htmlFor="disabilityQuotaPercent" required>
            <Input
              id="disabilityQuotaPercent"
              name="disabilityQuotaPercent"
              type="number"
              min={0}
              max={100}
              step={0.1}
              defaultValue={s.disabilityQuotaPercentage * 100}
              required
            />
          </Field>
        </FormGrid>
      </Card>

      <Card
        title="Varsayılan Maliyet Kalemleri"
        description="Bölüm 5 Faz1 madde 10 ve 14 — çalışan bazlı maaş/maliyet bilgisi yoksa ve işten çıkış maliyeti hesaplayıcısında bu varsayılanlar kullanılır. Boş bırakılabilir."
      >
        <FormGrid>
          <Field label="Günlük Ücret — Mavi Yaka (TL)" htmlFor="defaultDailyWageBlueCollar">
            <Input id="defaultDailyWageBlueCollar" name="defaultDailyWageBlueCollar" type="number" min={0} step={0.01} defaultValue={s.defaultDailyWageBlueCollar ?? ""} />
          </Field>
          <Field label="Günlük Ücret — Beyaz Yaka (TL)" htmlFor="defaultDailyWageWhiteCollar">
            <Input id="defaultDailyWageWhiteCollar" name="defaultDailyWageWhiteCollar" type="number" min={0} step={0.01} defaultValue={s.defaultDailyWageWhiteCollar ?? ""} />
          </Field>
          <Field label="İşe Alım Birim Maliyeti — Mavi Yaka (TL)" htmlFor="defaultHiringCostBlueCollar">
            <Input id="defaultHiringCostBlueCollar" name="defaultHiringCostBlueCollar" type="number" min={0} step={1} defaultValue={s.defaultHiringCostBlueCollar ?? ""} />
          </Field>
          <Field label="İşe Alım Birim Maliyeti — Beyaz Yaka (TL)" htmlFor="defaultHiringCostWhiteCollar">
            <Input id="defaultHiringCostWhiteCollar" name="defaultHiringCostWhiteCollar" type="number" min={0} step={1} defaultValue={s.defaultHiringCostWhiteCollar ?? ""} />
          </Field>
          <Field label="KKD / Kıyafet-Ekipman Maliyeti — Mavi Yaka (TL)" htmlFor="defaultPpeCostBlueCollar">
            <Input id="defaultPpeCostBlueCollar" name="defaultPpeCostBlueCollar" type="number" min={0} step={1} defaultValue={s.defaultPpeCostBlueCollar ?? ""} />
          </Field>
          <Field label="Badge / Ekipman Maliyeti — Beyaz Yaka (TL)" htmlFor="defaultPpeCostWhiteCollar">
            <Input id="defaultPpeCostWhiteCollar" name="defaultPpeCostWhiteCollar" type="number" min={0} step={1} defaultValue={s.defaultPpeCostWhiteCollar ?? ""} />
          </Field>
          <Field label="Ort. Boş Pozisyon Süresi — Mavi Yaka (gün)" htmlFor="avgVacancyDaysBlueCollar">
            <Input id="avgVacancyDaysBlueCollar" name="avgVacancyDaysBlueCollar" type="number" min={0} step={1} defaultValue={s.avgVacancyDaysBlueCollar ?? ""} />
          </Field>
          <Field label="Ort. Boş Pozisyon Süresi — Beyaz Yaka (gün)" htmlFor="avgVacancyDaysWhiteCollar">
            <Input id="avgVacancyDaysWhiteCollar" name="avgVacancyDaysWhiteCollar" type="number" min={0} step={1} defaultValue={s.avgVacancyDaysWhiteCollar ?? ""} />
          </Field>
          <Field label="Oryantasyon Verim Kaybı — Mavi Yaka (TL)" htmlFor="onboardingProductivityLossCostBlueCollar">
            <Input
              id="onboardingProductivityLossCostBlueCollar"
              name="onboardingProductivityLossCostBlueCollar"
              type="number"
              min={0}
              step={1}
              defaultValue={s.onboardingProductivityLossCostBlueCollar ?? ""}
            />
          </Field>
          <Field label="Oryantasyon Verim Kaybı — Beyaz Yaka (TL)" htmlFor="onboardingProductivityLossCostWhiteCollar">
            <Input
              id="onboardingProductivityLossCostWhiteCollar"
              name="onboardingProductivityLossCostWhiteCollar"
              type="number"
              min={0}
              step={1}
              defaultValue={s.onboardingProductivityLossCostWhiteCollar ?? ""}
            />
          </Field>
        </FormGrid>
      </Card>

      <Card
        title="Patron Raporu — Finansal Başlıklar"
        description="Bölüm 8 — bordro/SGK/yan haklar toplamı ve ciro İK verisinden hesaplanamaz, buradan elle girilir. Boş bırakılırsa raporda bu başlıklar gizlenir."
      >
        <FormGrid>
          <Field label="Aylık Toplam İşgücü Maliyeti (TL)" htmlFor="monthlyWorkforceCost">
            <Input id="monthlyWorkforceCost" name="monthlyWorkforceCost" type="number" min={0} step={1} defaultValue={s.monthlyWorkforceCost ?? ""} />
          </Field>
          <Field label="Aylık Ciro (TL)" htmlFor="monthlyRevenue">
            <Input id="monthlyRevenue" name="monthlyRevenue" type="number" min={0} step={1} defaultValue={s.monthlyRevenue ?? ""} />
          </Field>
        </FormGrid>
      </Card>

      <SubmitButton>Ayarları Kaydet</SubmitButton>
    </form>
  );
}
