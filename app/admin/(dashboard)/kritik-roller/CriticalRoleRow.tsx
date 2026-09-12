"use client";

// Kritik pozisyon listesindeki tek satir - kendi ici duzenlenebilir (inline
// "Kaydet" formu) + ayri bir "Sil" formu. Iki <form> HTML'de ic ice olamaz,
// bu yuzden ikisi KARDES eleman olarak render edilir; duzenleme formu
// display:contents ile grid satirinin geri kalan hucrelerine "eriyip"
// katilir (bkz. asagidaki grid).
import { useActionState } from "react";
import { Input, Select } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { updateCriticalRoleAction, deleteCriticalRoleAction, type FormState } from "./actions";

const RISK_LABELS: Record<string, string> = { dusuk: "Düşük", orta: "Orta", kritik: "Kritik" };
const smallInput: React.CSSProperties = { fontSize: 12.5, padding: "6px 8px" };

type Row = {
  id: number;
  roleName: string;
  currentEmployeeId: number | null;
  backupCount: number;
  backupStatus: string | null;
  riskLevel: "dusuk" | "orta" | "kritik";
};

export function CriticalRoleRow({ row, employees }: { row: Row; employees: { id: number; label: string }[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(updateCriticalRoleAction, undefined);
  const noBackup = row.backupCount <= 0 && row.currentEmployeeId != null;

  return (
    <div style={{ borderBottom: "1px solid var(--line)", padding: "8px 0", background: noBackup ? "#FBF2EF" : "transparent" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1.3fr 0.7fr 1.2fr 0.8fr auto auto", gap: 8, alignItems: "center" }}>
        <form id={`crit-role-form-${row.id}`} action={formAction} style={{ display: "contents" }}>
          <input type="hidden" name="id" value={row.id} />
          <Input name="roleName" defaultValue={row.roleName} required style={smallInput} />
          <Select name="currentEmployeeId" defaultValue={row.currentEmployeeId ?? ""} style={smallInput}>
            <option value="">Atanmadı</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </Select>
          <Input name="backupCount" type="number" min={0} step={1} defaultValue={row.backupCount} required style={smallInput} />
          <Input name="backupStatus" defaultValue={row.backupStatus ?? ""} placeholder="—" style={smallInput} />
          <Select name="riskLevel" defaultValue={row.riskLevel} style={smallInput}>
            {Object.entries(RISK_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
          <SubmitButton>Kaydet</SubmitButton>
        </form>
        <form action={deleteCriticalRoleAction}>
          <input type="hidden" name="id" value={row.id} />
          <DeleteButton confirmText={`"${row.roleName}" kritik pozisyonunu silmek istediğinize emin misiniz?`} />
        </form>
      </div>
      {state?.error && <div style={{ color: "var(--brick)", fontSize: 11.5, marginTop: 4 }}>{state.error}</div>}
    </div>
  );
}
