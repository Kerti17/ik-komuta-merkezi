"use client";

import { useActionState } from "react";
import { refreshLicenseAction, type RefreshLicenseState } from "./actions";

export function RefreshLicenseButton() {
  const [state, formAction, pending] = useActionState<RefreshLicenseState, FormData>((_prev, _formData) => refreshLicenseAction(), undefined);

  return (
    <form action={formAction} style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button
        type="submit"
        disabled={pending}
        className="mono"
        style={{
          padding: "8px 14px",
          fontSize: 11.5,
          fontWeight: 700,
          background: "var(--thread)",
          color: "var(--ink)",
          boxShadow: pending ? "none" : "0 8px 18px -10px rgba(212,160,23,0.55)",
          border: "none",
          borderRadius: 4,
          cursor: pending ? "default" : "pointer",
          opacity: pending ? 0.6 : 1,
        }}
      >
        {pending ? "Kontrol Ediliyor..." : "Şimdi Kontrol Et"}
      </button>
      {state?.checkedAt && !pending && (
        <span style={{ fontSize: 11.5, color: "var(--pine)" }}>Kontrol edildi.</span>
      )}
    </form>
  );
}
