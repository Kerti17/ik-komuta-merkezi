"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { Field, FormGrid, Input, Select, ErrorBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createEvaluationAction, type FormState } from "./actions";

const STAGE_LABELS: Record<string, string> = {
  deneme: "Deneme Süresi",
  "6_ay": "İlk 6 Ay",
  "1_yil": "İlk 1 Yıl (Kıdem Eşiği)",
  yillik: "Yıllık",
  alti_aylik: "6 Aylık",
};

// komut1.md Faz 1.6 madde 27a: her deger turunun kendi asama secenekleri var.
const STAGES_BY_REVIEW_TYPE: Record<string, string[]> = {
  ise_giris: ["deneme", "6_ay", "1_yil"],
  periyodik: ["yillik", "alti_aylik"],
};

export function CreateEvaluationForm({ employees }: { employees: { id: number; label: string }[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(createEvaluationAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const [reviewType, setReviewType] = useState<"ise_giris" | "periyodik">("ise_giris");

  useEffect(() => {
    if (!state) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction}>
      <ErrorBanner message={state?.error} />
      <FormGrid>
        <Field label="Çalışan" htmlFor="employeeId" required>
          <Select id="employeeId" name="employeeId" required defaultValue="">
            <option value="" disabled>
              Seçin
            </option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Değerlendirme Türü" htmlFor="reviewType" required>
          <Select
            id="reviewType"
            name="reviewType"
            required
            value={reviewType}
            onChange={(e) => setReviewType(e.target.value as "ise_giris" | "periyodik")}
          >
            <option value="ise_giris">İşe Giriş Süreci (deneme/6 ay/1 yıl)</option>
            <option value="periyodik">Periyodik (tüm kadro — yıllık/6 aylık)</option>
          </Select>
        </Field>
        <Field label="Aşama" htmlFor="stage" required>
          <Select id="stage" name="stage" required defaultValue="" key={reviewType}>
            <option value="" disabled>
              Seçin
            </option>
            {STAGES_BY_REVIEW_TYPE[reviewType].map((v) => (
              <option key={v} value={v}>
                {STAGE_LABELS[v]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Son Tarih (Karar Tarihi)" htmlFor="dueDate" required>
          <Input id="dueDate" name="dueDate" type="date" required />
        </Field>
      </FormGrid>
      <div style={{ marginTop: 12 }}>
        <SubmitButton>Değerlendirme Planla</SubmitButton>
      </div>
    </form>
  );
}
