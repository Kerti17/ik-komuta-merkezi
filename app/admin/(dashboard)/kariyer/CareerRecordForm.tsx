"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { Field, FormGrid, Input, Select, Textarea, ErrorBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createCareerRecordAction, type FormState } from "./actions";

export function CareerRecordForm({ employees }: { employees: { id: number; label: string }[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(createCareerRecordAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const [recordType, setRecordType] = useState<"gecmis" | "plan">("gecmis");

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
        <Field label="Kayıt Türü" htmlFor="recordType" required>
          <Select id="recordType" name="recordType" required value={recordType} onChange={(e) => setRecordType(e.target.value as "gecmis" | "plan")}>
            <option value="gecmis">Unvan / Terfi Geçmişi</option>
            <option value="plan">Gelecek Kariyer Planı</option>
          </Select>
        </Field>

        {recordType === "gecmis" ? (
          <>
            <Field label="Unvan" htmlFor="title" required>
              <Input id="title" name="title" placeholder="ör. Vardiya Amiri" required />
            </Field>
            <Field label="Tarih" htmlFor="effectiveDate" required>
              <Input id="effectiveDate" name="effectiveDate" type="date" required />
            </Field>
          </>
        ) : (
          <>
            <Field label="Hedef Unvan" htmlFor="targetTitle" required>
              <Input id="targetTitle" name="targetTitle" placeholder="ör. Bölüm Şefi" required />
            </Field>
            <Field label="Hedef Tarih" htmlFor="targetDate" required>
              <Input id="targetDate" name="targetDate" type="date" required />
            </Field>
          </>
        )}
      </FormGrid>
      {recordType === "plan" && (
        <div style={{ marginTop: 12 }}>
          <Field label="Gelişim Notu (opsiyonel)" htmlFor="developmentNote">
            <Textarea id="developmentNote" name="developmentNote" placeholder="Bu hedefe ulaşmak için gereken gelişim alanları, eğitimler vb." />
          </Field>
        </div>
      )}
      <div style={{ marginTop: 12 }}>
        <SubmitButton>Kayıt Ekle</SubmitButton>
      </div>
    </form>
  );
}
