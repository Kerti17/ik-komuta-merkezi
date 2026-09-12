"use client";

import { useActionState, useRef, useEffect } from "react";
import { Field, FormGrid, Input, Select, Textarea, ErrorBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createDisciplinaryRecordAction, type FormState } from "./actions";

const TYPE_LABELS: Record<string, string> = {
  sozlu_uyari: "Sözlü Uyarı",
  yazili_uyari: "Yazılı Uyarı",
  devamsizlik_tutanagi: "Devamsızlık Tutanağı",
  diger: "Diğer",
};

export function RecordForm({ employees }: { employees: { id: number; label: string }[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(createDisciplinaryRecordAction, undefined);
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
        <Field label="Tarih" htmlFor="recordDate" required>
          <Input id="recordDate" name="recordDate" type="date" required />
        </Field>
        <Field label="Tür" htmlFor="type" required>
          <Select id="type" name="type" required defaultValue="">
            <option value="" disabled>
              Seçin
            </option>
            {Object.entries(TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
      </FormGrid>
      <div style={{ marginTop: 12 }}>
        <Field label="Açıklama (opsiyonel)" htmlFor="description">
          <Textarea id="description" name="description" />
        </Field>
      </div>
      <div style={{ marginTop: 12 }}>
        <SubmitButton>Tutanak Ekle</SubmitButton>
      </div>
    </form>
  );
}
