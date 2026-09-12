"use client";

import { useActionState, useRef, useEffect } from "react";
import { Field, FormGrid, Input, Select, ErrorBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createManagerAccountAction, type FormState } from "./actions";

export function ManagerAccountForm({ departments }: { departments: { id: number; name: string }[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(createManagerAccountAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction}>
      <ErrorBanner message={state?.error} />
      <FormGrid>
        <Field label="Ad Soyad" htmlFor="fullName" required>
          <Input id="fullName" name="fullName" required />
        </Field>
        <Field label="E-posta" htmlFor="email" required>
          <Input id="email" name="email" type="email" required />
        </Field>
        <Field label="Şifre (en az 8 karakter)" htmlFor="password" required>
          <Input id="password" name="password" type="password" minLength={8} required />
        </Field>
        <Field label="Departman" htmlFor="departmentId" required>
          <Select id="departmentId" name="departmentId" required defaultValue="">
            <option value="" disabled>
              Seçin
            </option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </Field>
      </FormGrid>
      <div style={{ marginTop: 12 }}>
        <SubmitButton>Yönetici Hesabı Oluştur</SubmitButton>
      </div>
    </form>
  );
}
