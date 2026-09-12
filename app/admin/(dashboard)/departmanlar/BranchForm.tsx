"use client";

import { useActionState, useRef, useEffect } from "react";
import { Field, Input, ErrorBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createBranchAction, type FormState } from "./actions";

export function BranchForm() {
  const [state, formAction] = useActionState<FormState, FormData>(createBranchAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction}>
      <ErrorBanner message={state?.error} />
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Field label="Yeni Şube Adı" htmlFor="branch-name">
          <Input id="branch-name" name="name" placeholder="ör. Çorlu Fabrika" required style={{ minWidth: 200 }} />
        </Field>
        <Field label="Adres (opsiyonel)" htmlFor="branch-address">
          <Input id="branch-address" name="address" placeholder="ör. OSB, Çorlu/Tekirdağ" style={{ minWidth: 240 }} />
        </Field>
        <SubmitButton>Ekle</SubmitButton>
      </div>
    </form>
  );
}
