"use client";

import { useActionState } from "react";
import { Field, FormGrid, Input, Select, Textarea, ErrorBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { updateSgkIncentiveRuleAction, type FormState } from "../actions";

type Rule = {
  id: number;
  name: string;
  description: string | null;
  ageMin: number | null;
  ageMax: number | null;
  gender: "kadin" | "erkek" | null;
  requiresDisability: boolean;
  region: string | null;
  estimatedAmount: number | null;
  estimatedRatePercent: number | null;
  isActive: boolean;
};

export function EditSgkIncentiveRuleForm({ rule }: { rule: Rule }) {
  const [state, formAction] = useActionState<FormState, FormData>(updateSgkIncentiveRuleAction, undefined);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={rule.id} />
      <ErrorBanner message={state?.error} />
      <FormGrid>
        <Field label="Teşvik Adı" htmlFor="name" required>
          <Input id="name" name="name" defaultValue={rule.name} required />
        </Field>
        <Field label="Yaş Aralığı — Min (opsiyonel)" htmlFor="ageMin">
          <Input id="ageMin" name="ageMin" type="number" min={0} max={100} step={1} defaultValue={rule.ageMin ?? ""} />
        </Field>
        <Field label="Yaş Aralığı — Max (opsiyonel)" htmlFor="ageMax">
          <Input id="ageMax" name="ageMax" type="number" min={0} max={100} step={1} defaultValue={rule.ageMax ?? ""} />
        </Field>
        <Field label="Cinsiyet Şartı (opsiyonel)" htmlFor="gender">
          <Select id="gender" name="gender" defaultValue={rule.gender ?? ""}>
            <option value="">Farketmez</option>
            <option value="kadin">Kadın</option>
            <option value="erkek">Erkek</option>
          </Select>
        </Field>
        <Field label="Bölge / Şube Adı (opsiyonel)" htmlFor="region">
          <Input id="region" name="region" defaultValue={rule.region ?? ""} />
        </Field>
        <Field label="Tahmini Aylık Tutar (TL, opsiyonel)" htmlFor="estimatedAmount">
          <Input id="estimatedAmount" name="estimatedAmount" type="number" min={0} step={1} defaultValue={rule.estimatedAmount ?? ""} />
        </Field>
        <Field label="Tahmini Oran (%, opsiyonel)" htmlFor="estimatedRatePercent">
          <Input id="estimatedRatePercent" name="estimatedRatePercent" type="number" min={0} max={100} step={0.1} defaultValue={rule.estimatedRatePercent ?? ""} />
        </Field>
      </FormGrid>
      <div style={{ marginTop: 12 }}>
        <Field label="Açıklama (opsiyonel)" htmlFor="description">
          <Textarea id="description" name="description" defaultValue={rule.description ?? ""} />
        </Field>
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 20 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
          <input type="checkbox" name="requiresDisability" defaultChecked={rule.requiresDisability} />
          Engellilik durumu gerektirir
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
          <input type="checkbox" name="isActive" defaultChecked={rule.isActive} />
          Aktif (uygunluk önerilerinde kullanılsın)
        </label>
      </div>
      <div style={{ marginTop: 12 }}>
        <SubmitButton>Kaydet</SubmitButton>
      </div>
    </form>
  );
}
