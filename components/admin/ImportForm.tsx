"use client";

import { useActionState } from "react";
import { SubmitButton } from "./SubmitButton";
import { ErrorBanner } from "./ui";

export type ImportState =
  | {
      error?: string;
      result?: { inserted: number; rowErrors: { row: number; message: string }[] };
    }
  | undefined;

export function ImportForm({
  action,
  templateHref,
}: {
  action: (prevState: ImportState, formData: FormData) => Promise<ImportState>;
  templateHref: string;
}) {
  const [state, formAction] = useActionState<ImportState, FormData>(action, undefined);

  return (
    <div>
      <a href={templateHref} className="mono" style={{ fontSize: 11.5, fontWeight: 700, color: "var(--denim)", textDecoration: "none" }}>
        ↓ Şablonu İndir (.xlsx)
      </a>

      <form action={formAction} style={{ marginTop: 14 }}>
        <ErrorBanner message={state?.error} />
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input type="file" name="file" accept=".xlsx" required style={{ fontSize: 13 }} />
          <SubmitButton>Yükle ve İçe Aktar</SubmitButton>
        </div>
      </form>

      {state?.result && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--pine)" }}>{state.result.inserted} satır başarıyla eklendi.</div>
          {state.result.rowErrors.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--brick)", marginBottom: 6 }}>
                {state.result.rowErrors.length} satır hatalı, atlandı:
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#4b5563", lineHeight: 1.6 }}>
                {state.result.rowErrors.map((e, i) => (
                  <li key={i}>
                    Satır {e.row}: {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
