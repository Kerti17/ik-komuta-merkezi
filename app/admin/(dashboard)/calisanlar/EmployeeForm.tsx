"use client";

import { useActionState, useRef, useEffect } from "react";
import { Field, FormGrid, Input, Select, ErrorBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createEmployeeAction, type FormState } from "./actions";

type Option = { id: number; name: string };

export function EmployeeForm({ departments, branches }: { departments: Option[]; branches: Option[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(createEmployeeAction, undefined);
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
        <Field label="Şube" htmlFor="branchId" required>
          <Select id="branchId" name="branchId" required defaultValue="">
            <option value="" disabled>
              Seçin
            </option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Yaka Tipi" htmlFor="collarType" required>
          <Select id="collarType" name="collarType" required defaultValue="">
            <option value="" disabled>
              Seçin
            </option>
            <option value="mavi">Mavi Yaka</option>
            <option value="beyaz">Beyaz Yaka</option>
          </Select>
        </Field>
        <Field label="İşe Giriş Tarihi" htmlFor="hireDate" required>
          <Input id="hireDate" name="hireDate" type="date" required />
        </Field>
        <Field label="Aylık Maaş (TL, opsiyonel)" htmlFor="monthlySalary">
          <Input id="monthlySalary" name="monthlySalary" type="number" min={0} step={0.01} />
        </Field>
        <Field label="Doğum Tarihi (opsiyonel)" htmlFor="birthDate">
          <Input id="birthDate" name="birthDate" type="date" />
        </Field>
        <Field label="Cinsiyet (opsiyonel)" htmlFor="gender">
          <Select id="gender" name="gender" defaultValue="">
            <option value="">Belirtilmedi</option>
            <option value="kadin">Kadın</option>
            <option value="erkek">Erkek</option>
          </Select>
        </Field>
      </FormGrid>
      <div style={{ marginTop: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
          <input type="checkbox" name="isRetired" />
          Emekli
        </label>
      </div>
      <div style={{ marginTop: 12 }}>
        <SubmitButton>Çalışan Ekle</SubmitButton>
      </div>
    </form>
  );
}
