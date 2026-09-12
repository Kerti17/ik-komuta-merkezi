"use client";

import { useActionState } from "react";
import { processGarnishmentDeductionAction, type FormState } from "./actions";

export function DeductionForm({ garnishmentId, defaultAmount }: { garnishmentId: number; defaultAmount: number }) {
  const [state, formAction] = useActionState<FormState, FormData>(processGarnishmentDeductionAction, undefined);

  return (
    <form action={formAction} style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      <input type="hidden" name="id" value={garnishmentId} />
      {state?.error && <span style={{ color: "var(--brick)", fontSize: 11 }}>{state.error}</span>}
      <input
        type="number"
        name="amount"
        min={0.01}
        step={0.01}
        defaultValue={defaultAmount}
        required
        style={{ width: 100, padding: "5px 8px", fontSize: 11.5, borderRadius: 4, border: "1px solid var(--line)", fontFamily: "inherit" }}
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
        Kesinti İşle
      </button>
    </form>
  );
}
