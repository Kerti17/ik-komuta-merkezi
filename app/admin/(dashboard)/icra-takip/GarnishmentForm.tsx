"use client";

import { useActionState, useRef, useEffect } from "react";
import { Field, FormGrid, Input, Select, ErrorBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createGarnishmentAction, type FormState } from "./actions";

export function GarnishmentForm({ employees }: { employees: { id: number; label: string }[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(createGarnishmentAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

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
        <Field label="İcra Dairesi" htmlFor="enforcementOffice" required>
          <Input id="enforcementOffice" name="enforcementOffice" placeholder="ör. İstanbul 12. İcra Dairesi" required />
        </Field>
        <Field label="Dosya No" htmlFor="caseNumber" required>
          <Input id="caseNumber" name="caseNumber" placeholder="ör. 2026/1234 E." required />
        </Field>
        <Field label="Toplam Borç (TL)" htmlFor="totalDebt" required>
          <Input id="totalDebt" name="totalDebt" type="number" min={0.01} step={0.01} required />
        </Field>
        <Field label="Aylık Kesinti Tutarı (TL)" htmlFor="monthlyDeductionAmount" required>
          <Input id="monthlyDeductionAmount" name="monthlyDeductionAmount" type="number" min={0.01} step={0.01} required />
        </Field>
      </FormGrid>
      <div style={{ marginTop: 12 }}>
        <SubmitButton>İcra Dosyası Ekle</SubmitButton>
      </div>
    </form>
  );
}
