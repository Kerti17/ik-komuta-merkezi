"use client";

import { useActionState, useRef, useEffect } from "react";
import { Field, FormGrid, Input, Select, ErrorBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createTrainingAction, type FormState } from "./actions";

export function TrainingForm({ employees, existingFields }: { employees: { id: number; label: string }[]; existingFields: string[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(createTrainingAction, undefined);
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
        <Field label="Eğitim Adı" htmlFor="trainingName" required>
          <Input id="trainingName" name="trainingName" placeholder="ör. İleri Excel Eğitimi" required />
        </Field>
        <Field label="Eğitim Alanı / Kategorisi" htmlFor="trainingField" required>
          <Input id="trainingField" name="trainingField" placeholder="ör. Teknik, Liderlik, Satış..." list="training-field-options" required />
          <datalist id="training-field-options">
            {existingFields.map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>
        </Field>
      </FormGrid>
      <div style={{ marginTop: 12 }}>
        <SubmitButton>Eğitim Kaydı Ekle</SubmitButton>
      </div>
    </form>
  );
}
