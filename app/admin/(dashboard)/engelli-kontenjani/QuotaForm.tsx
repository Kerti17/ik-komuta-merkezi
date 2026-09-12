"use client";

import { useActionState } from "react";
import { Field, FormGrid, Input, ErrorBanner, SuccessBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { updateDisabilityQuotaAction, type FormState } from "./actions";

type Quota = {
  totalHeadcount: number;
  currentDisabledEmployeeCount: number;
  monthlyPenaltyRiskEstimate: number | null;
};

export function QuotaForm({ quota, quotaPercentage }: { quota: Quota; quotaPercentage: number }) {
  const [state, formAction] = useActionState<FormState, FormData>(updateDisabilityQuotaAction, undefined);
  const requiredCount = Math.round(quota.totalHeadcount * quotaPercentage);

  return (
    <form action={formAction}>
      <ErrorBanner message={state?.error} />
      <SuccessBanner message={state?.success ? "Kaydedildi." : null} />
      <FormGrid>
        <Field label="Toplam Kadro" htmlFor="totalHeadcount" required>
          <Input id="totalHeadcount" name="totalHeadcount" type="number" min={0} defaultValue={quota.totalHeadcount} required />
        </Field>
        <Field label="Mevcut Engelli Çalışan Sayısı" htmlFor="currentDisabledEmployeeCount" required>
          <Input id="currentDisabledEmployeeCount" name="currentDisabledEmployeeCount" type="number" min={0} defaultValue={quota.currentDisabledEmployeeCount} required />
        </Field>
        <Field label="Aylık Tahmini Ceza Riski (TL, opsiyonel)" htmlFor="monthlyPenaltyRiskEstimate">
          <Input id="monthlyPenaltyRiskEstimate" name="monthlyPenaltyRiskEstimate" type="number" min={0} defaultValue={quota.monthlyPenaltyRiskEstimate ?? ""} />
        </Field>
      </FormGrid>
      <p style={{ fontSize: 12, color: "#6b7280", marginTop: 10 }}>
        Yasal kontenjan (%{(quotaPercentage * 100).toFixed(1)}, Ayarlar&apos;dan değiştirilebilir): <b>{requiredCount} kişi</b>
      </p>
      <div style={{ marginTop: 12 }}>
        <SubmitButton>Kaydet</SubmitButton>
      </div>
    </form>
  );
}
