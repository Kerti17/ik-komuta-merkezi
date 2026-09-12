"use client";

import { useActionState, useRef, useEffect } from "react";
import { Field, FormGrid, Input, Select, Textarea, ErrorBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { EXIT_REASON_CATEGORIES } from "@/lib/exit-interviews";
import { createExitInterviewAction, type FormState } from "./actions";

export function ExitInterviewForm({ employees }: { employees: { id: number; label: string }[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(createExitInterviewAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction}>
      <ErrorBanner message={state?.error} />
      <FormGrid>
        <Field label="Ayrılan Çalışan" htmlFor="employeeId" required>
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
        <Field label="Ayrılış Tarihi" htmlFor="exitDate" required>
          <Input id="exitDate" name="exitDate" type="date" required />
        </Field>
        <Field label="Ayrılış Nedeni Kategorisi" htmlFor="reasonCategory" required>
          <Select id="reasonCategory" name="reasonCategory" required defaultValue="">
            <option value="" disabled>
              Seçin
            </option>
            {EXIT_REASON_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
      </FormGrid>
      <div style={{ marginTop: 12 }}>
        <Field label="Notlar (opsiyonel)" htmlFor="notes">
          <Textarea id="notes" name="notes" placeholder="Mülakatta öne çıkan detaylar..." />
        </Field>
      </div>
      <div style={{ marginTop: 12 }}>
        <SubmitButton>Çıkış Mülakatı Kaydet</SubmitButton>
      </div>
    </form>
  );
}
