"use client";

import { useActionState, useRef, useEffect } from "react";
import { Field, Input, ErrorBanner, SuccessBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { updatePanelPasswordAction, type PanelPasswordState } from "./panelPasswordActions";

export function PanelPasswordForm({ isSet }: { isSet: boolean }) {
  const [state, formAction] = useActionState<PanelPasswordState, FormData>(updatePanelPasswordAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <div>
      <p style={{ fontSize: 12.5, color: isSet ? "var(--pine)" : "var(--brick)", marginBottom: 12 }}>
        {isSet ? "Şu an bir panel şifresi tanımlı." : "Henüz panel şifresi tanımlanmadı — /panel şu an erişilemiyor."}
      </p>
      <form ref={formRef} action={formAction}>
        <ErrorBanner message={state?.error} />
        <SuccessBanner message={state?.success ? "Panel şifresi kaydedildi." : null} />
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
          <Field label={isSet ? "Yeni Panel Şifresi" : "Panel Şifresi"} htmlFor="newPassword" required>
            <Input id="newPassword" name="newPassword" type="password" minLength={6} required style={{ minWidth: 220 }} />
          </Field>
          <SubmitButton>{isSet ? "Şifreyi Değiştir" : "Şifreyi Belirle"}</SubmitButton>
        </div>
      </form>
    </div>
  );
}
