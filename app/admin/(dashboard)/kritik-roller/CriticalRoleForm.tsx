"use client";

import { useActionState, useRef, useEffect } from "react";
import { Field, FormGrid, Input, Select, ErrorBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createCriticalRoleAction, type FormState } from "./actions";

const RISK_LABELS: Record<string, string> = { dusuk: "Düşük", orta: "Orta", kritik: "Kritik" };

export function CriticalRoleForm({ employees }: { employees: { id: number; label: string }[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(createCriticalRoleAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction}>
      <ErrorBanner message={state?.error} />
      <FormGrid>
        <Field label="Pozisyon Adı" htmlFor="roleName" required>
          <Input id="roleName" name="roleName" placeholder="ör. Dokuma Usta Başı, Forklift Operatörü" required />
        </Field>
        <Field label="Mevcut Çalışan" htmlFor="currentEmployeeId">
          <Select id="currentEmployeeId" name="currentEmployeeId" defaultValue="">
            <option value="">Atanmadı</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Yedek Sayısı" htmlFor="backupCount" required>
          <Input id="backupCount" name="backupCount" type="number" min={0} step={1} defaultValue={0} required />
        </Field>
        <Field label="Yedek Durumu (opsiyonel)" htmlFor="backupStatus">
          <Input id="backupStatus" name="backupStatus" placeholder="ör. Gelişmekte (~6 ay), Hazır" />
        </Field>
        <Field label="Risk Seviyesi" htmlFor="riskLevel" required>
          <Select id="riskLevel" name="riskLevel" defaultValue="orta" required>
            {Object.entries(RISK_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
      </FormGrid>
      <div style={{ marginTop: 12 }}>
        <SubmitButton>Kritik Pozisyon Ekle</SubmitButton>
      </div>
    </form>
  );
}
