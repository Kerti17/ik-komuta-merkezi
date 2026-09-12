"use client";

import { useActionState } from "react";
import { Field, FormGrid, Input, Textarea, ErrorBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { updateKvkkInventoryAction, type FormState } from "../actions";

type Record_ = {
  id: number;
  dataCategory: string;
  processingPurpose: string;
  legalBasis: string;
  retentionPeriod: string;
  transferredParty: string | null;
};

export function EditKvkkInventoryForm({ record }: { record: Record_ }) {
  const [state, formAction] = useActionState<FormState, FormData>(updateKvkkInventoryAction, undefined);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={record.id} />
      <ErrorBanner message={state?.error} />
      <FormGrid>
        <Field label="Veri Kategorisi" htmlFor="dataCategory" required>
          <Input id="dataCategory" name="dataCategory" defaultValue={record.dataCategory} required />
        </Field>
        <Field label="Hukuki Dayanak" htmlFor="legalBasis" required>
          <Input id="legalBasis" name="legalBasis" defaultValue={record.legalBasis} required />
        </Field>
        <Field label="Saklama Süresi" htmlFor="retentionPeriod" required>
          <Input id="retentionPeriod" name="retentionPeriod" defaultValue={record.retentionPeriod} required />
        </Field>
        <Field label="Aktarılan Taraf (opsiyonel)" htmlFor="transferredParty">
          <Input id="transferredParty" name="transferredParty" defaultValue={record.transferredParty ?? ""} />
        </Field>
      </FormGrid>
      <div style={{ marginTop: 12 }}>
        <Field label="İşleme Amacı" htmlFor="processingPurpose" required>
          <Textarea id="processingPurpose" name="processingPurpose" defaultValue={record.processingPurpose} required />
        </Field>
      </div>
      <div style={{ marginTop: 12 }}>
        <SubmitButton>Kaydet</SubmitButton>
      </div>
    </form>
  );
}
