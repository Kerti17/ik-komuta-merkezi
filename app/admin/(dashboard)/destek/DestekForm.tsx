"use client";

import { useActionState } from "react";
import { Field, Input, Textarea, ErrorBanner, SuccessBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { sendSupportMessageAction, type SupportFormState } from "./actions";

export function DestekForm() {
  const [state, formAction] = useActionState<SupportFormState, FormData>(sendSupportMessageAction, undefined);

  return (
    <form action={formAction} key={state?.success ? "sent" : "form"}>
      <ErrorBanner message={state?.error} />
      <SuccessBanner message={state?.success ? "Mesajınız gönderildi. En kısa sürede size dönüş yapılacaktır." : null} />

      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 520 }}>
        <Field label="Konu" htmlFor="subject" required>
          <Input id="subject" name="subject" maxLength={150} required placeholder="Ör. Excel içe aktarmada hata alıyorum" />
        </Field>
        <Field label="Mesaj" htmlFor="message" required>
          <Textarea id="message" name="message" maxLength={5000} required rows={8} placeholder="Sorununuzu veya sorunuzu detaylıca yazın." />
        </Field>
      </div>

      <div style={{ marginTop: 14 }}>
        <SubmitButton>Gönder</SubmitButton>
      </div>
    </form>
  );
}
