"use client";

import { useActionState, useRef, useEffect } from "react";
import { Field, Input, ErrorBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createDepartmentAction, type FormState } from "./actions";

export function DepartmentForm() {
  const [state, formAction] = useActionState<FormState, FormData>(createDepartmentAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction}>
      <ErrorBanner message={state?.error} />
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Field label="Yeni Departman Adı" htmlFor="dep-name">
          <Input id="dep-name" name="name" placeholder="ör. Kalite Kontrol" required style={{ minWidth: 220 }} />
        </Field>
        <SubmitButton>Ekle</SubmitButton>
      </div>
    </form>
  );
}
