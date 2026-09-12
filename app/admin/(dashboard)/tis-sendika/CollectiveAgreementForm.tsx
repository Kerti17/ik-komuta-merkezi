"use client";

import { useActionState, useRef, useEffect } from "react";
import { Field, FormGrid, Input, ErrorBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createCollectiveAgreementAction, type FormState } from "./actions";

export function CollectiveAgreementForm() {
  const [state, formAction] = useActionState<FormState, FormData>(createCollectiveAgreementAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction}>
      <ErrorBanner message={state?.error} />
      <FormGrid>
        <Field label="Sendika Adı" htmlFor="unionName" required>
          <Input id="unionName" name="unionName" placeholder="ör. Teksif Sendikası" required />
        </Field>
        <Field label="TİS Başlangıç Tarihi" htmlFor="agreementStartDate" required>
          <Input id="agreementStartDate" name="agreementStartDate" type="date" required />
        </Field>
        <Field label="TİS Bitiş Tarihi" htmlFor="agreementEndDate" required>
          <Input id="agreementEndDate" name="agreementEndDate" type="date" required />
        </Field>
        <Field label="Kapsanan Çalışan Sayısı" htmlFor="coveredEmployeeCount" required>
          <Input id="coveredEmployeeCount" name="coveredEmployeeCount" type="number" min={0} step={1} required />
        </Field>
      </FormGrid>
      <div style={{ marginTop: 12 }}>
        <SubmitButton>TİS Kaydı Ekle</SubmitButton>
      </div>
    </form>
  );
}
