"use client";

import { useActionState } from "react";
import { Input, Field, ErrorBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ThreadRule } from "@/components/ThreadRule";
import { loginAction, type LoginState } from "./actions";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, undefined);

  return (
    <div style={{ width: "100%", maxWidth: 380 }}>
      <div className="mono" style={{ fontSize: 11, color: "var(--thread)", letterSpacing: "0.12em", marginBottom: 8, textAlign: "center" }}>
        IK KOMUTA MERKEZI
      </div>
      <h1 className="disp" style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px", textAlign: "center" }}>
        Admin Girişi
      </h1>
      <ThreadRule style={{ maxWidth: 160, margin: "0 auto 20px" }} />
      <form
        action={formAction}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          background: "#fff",
          border: "1px solid var(--line)",
          borderRadius: 6,
          padding: 22,
        }}
      >
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <ErrorBanner message={state?.error} />
        <Field label="E-posta" htmlFor="email" required>
          <Input id="email" name="email" type="email" required autoComplete="username" autoFocus />
        </Field>
        <Field label="Şifre" htmlFor="password" required>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </Field>
        <SubmitButton>Giriş Yap</SubmitButton>
      </form>
    </div>
  );
}
