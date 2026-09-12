"use client";

import { useActionState, useRef, useEffect } from "react";
import { Field, FormGrid, Input, Select, Textarea, ErrorBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createSgkIncentiveRuleAction, type FormState } from "./actions";

export function SgkIncentiveRuleForm() {
  const [state, formAction] = useActionState<FormState, FormData>(createSgkIncentiveRuleAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction}>
      <ErrorBanner message={state?.error} />
      <FormGrid>
        <Field label="Teşvik Adı" htmlFor="name" required>
          <Input id="name" name="name" placeholder="ör. Genç İstihdam Teşviki (5510 sk. 4/a)" required />
        </Field>
        <Field label="Yaş Aralığı — Min (opsiyonel)" htmlFor="ageMin">
          <Input id="ageMin" name="ageMin" type="number" min={0} max={100} step={1} />
        </Field>
        <Field label="Yaş Aralığı — Max (opsiyonel)" htmlFor="ageMax">
          <Input id="ageMax" name="ageMax" type="number" min={0} max={100} step={1} />
        </Field>
        <Field label="Cinsiyet Şartı (opsiyonel)" htmlFor="gender">
          <Select id="gender" name="gender" defaultValue="">
            <option value="">Farketmez</option>
            <option value="kadin">Kadın</option>
            <option value="erkek">Erkek</option>
          </Select>
        </Field>
        <Field label="Bölge / Şube Adı (opsiyonel)" htmlFor="region">
          <Input id="region" name="region" placeholder="ör. Organize Sanayi Bölgesi" />
        </Field>
        <Field label="Tahmini Aylık Tutar (TL, opsiyonel)" htmlFor="estimatedAmount">
          <Input id="estimatedAmount" name="estimatedAmount" type="number" min={0} step={1} />
        </Field>
        <Field label="Tahmini Oran (%, opsiyonel)" htmlFor="estimatedRatePercent">
          <Input id="estimatedRatePercent" name="estimatedRatePercent" type="number" min={0} max={100} step={0.1} />
        </Field>
      </FormGrid>
      <div style={{ marginTop: 12 }}>
        <Field label="Açıklama (opsiyonel)" htmlFor="description">
          <Textarea id="description" name="description" placeholder="Yasal dayanak, uygunluk şartlarının özeti vb." />
        </Field>
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 20 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
          <input type="checkbox" name="requiresDisability" />
          Engellilik durumu gerektirir
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
          <input type="checkbox" name="isActive" defaultChecked />
          Aktif (uygunluk önerilerinde kullanılsın)
        </label>
      </div>
      <div style={{ marginTop: 12 }}>
        <SubmitButton>Teşvik Kuralı Ekle</SubmitButton>
      </div>
    </form>
  );
}
