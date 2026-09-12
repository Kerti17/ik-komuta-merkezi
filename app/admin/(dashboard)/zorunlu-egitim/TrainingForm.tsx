"use client";

import { useActionState, useRef, useEffect } from "react";
import { Field, FormGrid, Input, Select, ErrorBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createMandatoryTrainingAction, type FormState } from "./actions";

export function TrainingForm({ employees }: { employees: { id: number; label: string }[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(createMandatoryTrainingAction, undefined);
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
        <Field label="Eğitim Türü" htmlFor="trainingType" required>
          <Input id="trainingType" name="trainingType" placeholder="ör. İş Sağlığı ve Güvenliği Eğitimi, Yangın Eğitimi" required />
        </Field>
        <Field label="Son Tamamlanma Tarihi (opsiyonel)" htmlFor="lastCompletedDate">
          <Input id="lastCompletedDate" name="lastCompletedDate" type="date" />
        </Field>
        <Field label="Bir Sonraki Son Tarih" htmlFor="dueDate" required>
          <Input id="dueDate" name="dueDate" type="date" required />
        </Field>
      </FormGrid>
      <div style={{ marginTop: 12 }}>
        <SubmitButton>Eğitim Kaydı Ekle</SubmitButton>
      </div>
    </form>
  );
}
