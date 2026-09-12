"use client";

import { useActionState, useRef, useEffect } from "react";
import { createTrainingAssessmentAction, type FormState } from "./actions";

export function TrainingAssessmentForm({ employeeId, trainingId }: { employeeId: number; trainingId: number }) {
  const [state, formAction] = useActionState<FormState, FormData>(createTrainingAssessmentAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!state) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
      <input type="hidden" name="employeeId" value={employeeId} />
      <input type="hidden" name="trainingId" value={trainingId} />
      {state?.error && <div style={{ color: "var(--brick)", fontSize: 11.5 }}>{state.error}</div>}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <input
          type="date"
          name="noteDate"
          defaultValue={today}
          required
          style={{ padding: "7px 9px", fontSize: 12.5, borderRadius: 4, border: "1px solid var(--line)", fontFamily: "inherit", flexShrink: 0 }}
        />
        <textarea
          name="note"
          placeholder="Eğitim sonrası gelişim değerlendirmeniz..."
          required
          style={{ flex: 1, padding: "7px 9px", fontSize: 12.5, borderRadius: 4, border: "1px solid var(--line)", fontFamily: "inherit", minHeight: 44, resize: "vertical" }}
        />
        <button
          type="submit"
          className="mono"
          style={{
            flexShrink: 0,
            padding: "8px 14px",
            fontSize: 11.5,
            fontWeight: 700,
            background: "var(--pine)",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Değerlendirme Ekle
        </button>
      </div>
    </form>
  );
}
