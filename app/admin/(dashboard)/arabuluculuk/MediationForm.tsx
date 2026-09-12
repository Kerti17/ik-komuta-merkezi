"use client";

import { useActionState, useRef, useEffect } from "react";
import { Field, FormGrid, Input, Select, Textarea, ErrorBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createMediationCaseAction, type FormState } from "./actions";

export function MediationForm({ employees }: { employees: { id: number; label: string }[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(createMediationCaseAction, undefined);
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
        <Field label="Anlaşma Tarihi" htmlFor="caseDate" required>
          <Input id="caseDate" name="caseDate" type="date" required />
        </Field>
        <Field label="Ödenen Tutar (TL)" htmlFor="paidAmount" required>
          <Input id="paidAmount" name="paidAmount" type="number" min={0} step={0.01} required />
        </Field>
        <Field label="Tahmini Dava Maliyeti (TL)" htmlFor="estimatedLawsuitCost" required>
          <Input id="estimatedLawsuitCost" name="estimatedLawsuitCost" type="number" min={0} step={0.01} required />
        </Field>
      </FormGrid>
      <div style={{ marginTop: 12 }}>
        <Field label="Not (opsiyonel)" htmlFor="notes">
          <Textarea id="notes" name="notes" />
        </Field>
      </div>
      <div style={{ marginTop: 12 }}>
        <SubmitButton>Dosya Ekle</SubmitButton>
      </div>
    </form>
  );
}
