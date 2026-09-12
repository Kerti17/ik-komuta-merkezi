"use client";

import { useActionState, useState } from "react";
import { Field, FormGrid, Input, Select, ErrorBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { updateEmployeeAction, type FormState } from "../actions";

type Option = { id: number; name: string };
type Employee = {
  id: number;
  fullName: string;
  departmentId: number;
  branchId: number;
  collarType: "mavi" | "beyaz";
  hireDate: string;
  terminationDate: string | null;
  monthlySalary: number | null;
  status: "aktif" | "ayrildi";
  birthDate: string | null;
  gender: "kadin" | "erkek" | null;
  isRetired: boolean;
};

export function EditEmployeeForm({ employee, departments, branches }: { employee: Employee; departments: Option[]; branches: Option[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(updateEmployeeAction, undefined);
  const [status, setStatus] = useState(employee.status);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={employee.id} />
      <ErrorBanner message={state?.error} />
      <FormGrid>
        <Field label="Ad Soyad" htmlFor="fullName" required>
          <Input id="fullName" name="fullName" defaultValue={employee.fullName} required />
        </Field>
        <Field label="Departman" htmlFor="departmentId" required>
          <Select id="departmentId" name="departmentId" defaultValue={employee.departmentId} required>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Şube" htmlFor="branchId" required>
          <Select id="branchId" name="branchId" defaultValue={employee.branchId} required>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Yaka Tipi" htmlFor="collarType" required>
          <Select id="collarType" name="collarType" defaultValue={employee.collarType} required>
            <option value="mavi">Mavi Yaka</option>
            <option value="beyaz">Beyaz Yaka</option>
          </Select>
        </Field>
        <Field label="İşe Giriş Tarihi" htmlFor="hireDate" required>
          <Input id="hireDate" name="hireDate" type="date" defaultValue={employee.hireDate} required />
        </Field>
        <Field label="Aylık Maaş (TL, opsiyonel)" htmlFor="monthlySalary">
          <Input id="monthlySalary" name="monthlySalary" type="number" min={0} step={0.01} defaultValue={employee.monthlySalary ?? ""} />
        </Field>
        <Field label="Doğum Tarihi (opsiyonel)" htmlFor="birthDate">
          <Input id="birthDate" name="birthDate" type="date" defaultValue={employee.birthDate ?? ""} />
        </Field>
        <Field label="Cinsiyet (opsiyonel)" htmlFor="gender">
          <Select id="gender" name="gender" defaultValue={employee.gender ?? ""}>
            <option value="">Belirtilmedi</option>
            <option value="kadin">Kadın</option>
            <option value="erkek">Erkek</option>
          </Select>
        </Field>
        <Field label="Durum" htmlFor="status" required>
          <Select id="status" name="status" defaultValue={employee.status} required onChange={(e) => setStatus(e.target.value as "aktif" | "ayrildi")}>
            <option value="aktif">Aktif</option>
            <option value="ayrildi">Ayrıldı</option>
          </Select>
        </Field>
        {status === "ayrildi" && (
          <Field label="Ayrılış Tarihi" htmlFor="terminationDate" required>
            <Input id="terminationDate" name="terminationDate" type="date" defaultValue={employee.terminationDate ?? ""} required />
          </Field>
        )}
      </FormGrid>
      <div style={{ marginTop: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
          <input type="checkbox" name="isRetired" defaultChecked={employee.isRetired} />
          Emekli
        </label>
      </div>
      <div style={{ marginTop: 12 }}>
        <SubmitButton>Kaydet</SubmitButton>
      </div>
    </form>
  );
}
