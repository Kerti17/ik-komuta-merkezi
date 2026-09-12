"use client";

import { useActionState, useRef, useEffect } from "react";
import { Field, FormGrid, Input, Select, ErrorBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { upsertLeaveBalanceAction, type FormState } from "./actions";

export function LeaveBalanceForm({ employees }: { employees: { id: number; label: string }[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(upsertLeaveBalanceAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const currentYear = new Date().getFullYear();

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
        <Field label="Yıl" htmlFor="asOfYear" required>
          <Input id="asOfYear" name="asOfYear" type="number" defaultValue={currentYear} required />
        </Field>
        <Field label="Bu Yıl Hak Edilen (gün)" htmlFor="earnedDays" required>
          <Input id="earnedDays" name="earnedDays" type="number" min={0} step={0.5} required />
        </Field>
        <Field label="Bu Yıl Kullanılan (gün)" htmlFor="usedDays" required>
          <Input id="usedDays" name="usedDays" type="number" min={0} step={0.5} required />
        </Field>
        <Field label="Toplam Kalan / Birikmiş (gün)" htmlFor="remainingDaysTotal" required>
          <Input id="remainingDaysTotal" name="remainingDaysTotal" type="number" min={0} step={0.5} required />
        </Field>
      </FormGrid>
      <div style={{ marginTop: 12 }}>
        <SubmitButton>Kaydet</SubmitButton>
      </div>
    </form>
  );
}
