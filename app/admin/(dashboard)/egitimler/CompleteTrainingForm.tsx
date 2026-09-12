"use client";

import { useActionState } from "react";
import { markTrainingCompletedAction, type FormState } from "./actions";

export function CompleteTrainingForm({ trainingId }: { trainingId: number }) {
  const [state, formAction] = useActionState<FormState, FormData>(markTrainingCompletedAction, undefined);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      <input type="hidden" name="id" value={trainingId} />
      {state?.error && <span style={{ color: "var(--brick)", fontSize: 11 }}>{state.error}</span>}
      <input
        type="date"
        name="completedDate"
        defaultValue={today}
        required
        style={{ padding: "5px 8px", fontSize: 11.5, borderRadius: 4, border: "1px solid var(--line)", fontFamily: "inherit" }}
      />
      <button
        type="submit"
        className="mono"
        style={{
          padding: "5px 10px",
          fontSize: 10.5,
          fontWeight: 700,
          background: "var(--pine)",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        Tamamlandı İşaretle
      </button>
    </form>
  );
}
