"use client";

import { useActionState, useRef, useEffect } from "react";
import { Field, FormGrid, Input, Select, ErrorBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createHealthScreeningAction, type FormState } from "./actions";

export function ScreeningForm({ employees }: { employees: { id: number; label: string }[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(createHealthScreeningAction, undefined);
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
        <Field label="Tarama Türü" htmlFor="screeningType" required>
          <Input id="screeningType" name="screeningType" placeholder="ör. Odyometri (İşitme), Akciğer Grafisi" required />
        </Field>
        <Field label="Son Yapılan Tarama Tarihi (opsiyonel)" htmlFor="lastScreeningDate">
          <Input id="lastScreeningDate" name="lastScreeningDate" type="date" />
        </Field>
        <Field label="Bir Sonraki Son Tarih" htmlFor="dueDate" required>
          <Input id="dueDate" name="dueDate" type="date" required />
        </Field>
      </FormGrid>
      <div style={{ marginTop: 12 }}>
        <SubmitButton>Tarama Ekle</SubmitButton>
      </div>
    </form>
  );
}
