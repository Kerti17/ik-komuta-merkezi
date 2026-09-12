"use client";

import { useActionState } from "react";
import { Field, FormGrid, Input, ErrorBanner, SuccessBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { updateRiskWeightsAction, type SettingsState } from "./actions";
import type { InferSelectModel } from "drizzle-orm";
import type { riskScoreWeights } from "@/db/schema";

type WeightsRow = InferSelectModel<typeof riskScoreWeights>;

export function RiskWeightsForm({ weights: w }: { weights: WeightsRow }) {
  const [state, formAction] = useActionState<SettingsState, FormData>(updateRiskWeightsAction, undefined);

  return (
    <form action={formAction}>
      <ErrorBanner message={state?.error} />
      <SuccessBanner message={state?.success ? "Ağırlıklar kaydedildi." : null} />
      <FormGrid>
        <Field label="Devamsızlık Trendi" htmlFor="attendanceTrendWeight" required>
          <Input id="attendanceTrendWeight" name="attendanceTrendWeight" type="number" min={0} step={1} defaultValue={w.attendanceTrendWeight} required />
        </Field>
        <Field label="Fazla Mesai Yükü" htmlFor="overtimeLoadWeight" required>
          <Input id="overtimeLoadWeight" name="overtimeLoadWeight" type="number" min={0} step={1} defaultValue={w.overtimeLoadWeight} required />
        </Field>
        <Field label="Tutanak Sayısı" htmlFor="disciplinaryCountWeight" required>
          <Input id="disciplinaryCountWeight" name="disciplinaryCountWeight" type="number" min={0} step={1} defaultValue={w.disciplinaryCountWeight} required />
        </Field>
        <Field label="Kıdem <1 Yıl" htmlFor="lowSeniorityWeight" required>
          <Input id="lowSeniorityWeight" name="lowSeniorityWeight" type="number" min={0} step={1} defaultValue={w.lowSeniorityWeight} required />
        </Field>
        <Field label="Birikmiş İzin" htmlFor="accruedLeaveWeight" required>
          <Input id="accruedLeaveWeight" name="accruedLeaveWeight" type="number" min={0} step={1} defaultValue={w.accruedLeaveWeight} required />
        </Field>
      </FormGrid>
      <div style={{ marginTop: 12 }}>
        <SubmitButton>Ağırlıkları Kaydet</SubmitButton>
      </div>
    </form>
  );
}
