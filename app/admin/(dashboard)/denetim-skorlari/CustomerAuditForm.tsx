"use client";

import { useActionState, useRef, useEffect } from "react";
import { Field, FormGrid, Input, Textarea, ErrorBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createCustomerAuditAction, type FormState } from "./actions";

export function CustomerAuditForm() {
  const [state, formAction] = useActionState<FormState, FormData>(createCustomerAuditAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction}>
      <ErrorBanner message={state?.error} />
      <FormGrid>
        <Field label="Müşteri Adı" htmlFor="customerName" required>
          <Input id="customerName" name="customerName" placeholder="ör. ABC Tekstil A.Ş." required />
        </Field>
        <Field label="Denetim Tarihi" htmlFor="auditDate" required>
          <Input id="auditDate" name="auditDate" type="date" required />
        </Field>
        <Field label="Skor (0-100)" htmlFor="score" required>
          <Input id="score" name="score" type="number" min={0} max={100} step={1} required />
        </Field>
      </FormGrid>
      <div style={{ marginTop: 12 }}>
        <Field label="Açıklama (opsiyonel)" htmlFor="description">
          <Textarea id="description" name="description" placeholder="Denetimde tespit edilen bulgular, notlar vb." />
        </Field>
      </div>
      <div style={{ marginTop: 12 }}>
        <SubmitButton>Denetim Kaydı Ekle</SubmitButton>
      </div>
    </form>
  );
}
