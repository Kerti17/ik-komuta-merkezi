"use client";

import { useActionState } from "react";
import { Select, Input, Td, Badge } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { updateEvaluationAction, type FormState } from "./actions";

const STAGE_LABELS: Record<string, string> = {
  deneme: "Deneme Süresi",
  "6_ay": "İlk 6 Ay",
  "1_yil": "İlk 1 Yıl",
  yillik: "Yıllık",
  alti_aylik: "6 Aylık",
};

type EvaluationWithEmployee = {
  id: number;
  reviewType: "ise_giris" | "periyodik";
  stage: string;
  dueDate: string;
  status: "bekliyor" | "acil" | "gecikti" | "devam" | "sonlandirildi";
  competencyScore: number | null;
  adaptationScore: number | null;
  performanceScore: number | null;
  employee: { fullName: string; department: { name: string } | null } | null;
};

export function EvaluationRow({ evaluation: ev }: { evaluation: EvaluationWithEmployee }) {
  const [state, formAction] = useActionState<FormState, FormData>(updateEvaluationAction, undefined);

  return (
    <tr style={{ borderBottom: "1px solid var(--line)" }}>
      <Td>
        <b>{ev.employee?.fullName ?? "—"}</b>
        <div style={{ fontSize: 10.5, color: "#9ca3af" }}>{ev.employee?.department?.name}</div>
      </Td>
      <Td>
        {STAGE_LABELS[ev.stage] ?? ev.stage}
        {ev.reviewType === "periyodik" && (
          <div style={{ marginTop: 3 }}>
            <Badge tone="thread">Periyodik</Badge>
          </div>
        )}
      </Td>
      <Td mono>{ev.dueDate}</Td>
      <Td>
        <form action={formAction} style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <input type="hidden" name="id" value={ev.id} />
          <Select name="status" defaultValue={ev.status} style={{ fontSize: 11, padding: "5px 6px" }}>
            <option value="bekliyor">Bekliyor</option>
            <option value="acil">Acil</option>
            <option value="gecikti">Süre Geçti</option>
            <option value="devam">Devam — Onaylandı</option>
            <option value="sonlandirildi">Sonlandırıldı</option>
          </Select>
          <Input name="competencyScore" type="number" min={0} max={100} placeholder="Yetkinlik" defaultValue={ev.competencyScore ?? ""} style={{ width: 78, fontSize: 11, padding: "5px 6px" }} />
          <Input name="adaptationScore" type="number" min={0} max={100} placeholder="Uyum" defaultValue={ev.adaptationScore ?? ""} style={{ width: 68, fontSize: 11, padding: "5px 6px" }} />
          <Input name="performanceScore" type="number" min={0} max={100} placeholder="Performans" defaultValue={ev.performanceScore ?? ""} style={{ width: 84, fontSize: 11, padding: "5px 6px" }} />
          <SubmitButton>Kaydet</SubmitButton>
        </form>
        {state?.error && <div style={{ color: "var(--brick)", fontSize: 10.5, marginTop: 4 }}>{state.error}</div>}
      </Td>
    </tr>
  );
}
