"use client";

import { useActionState, useRef, useEffect } from "react";
import { Field, FormGrid, Input, Textarea, ErrorBanner } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createKvkkInventoryAction, type FormState } from "./actions";

export function KvkkInventoryForm({ existingCategories }: { existingCategories: string[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(createKvkkInventoryAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction}>
      <ErrorBanner message={state?.error} />
      <FormGrid>
        <Field label="Veri Kategorisi" htmlFor="dataCategory" required>
          <Input id="dataCategory" name="dataCategory" placeholder="ör. Kimlik Bilgileri, Sağlık Verisi..." list="kvkk-category-options" required />
          <datalist id="kvkk-category-options">
            {existingCategories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Hukuki Dayanak" htmlFor="legalBasis" required>
          <Input id="legalBasis" name="legalBasis" placeholder="ör. Açık rıza, Kanuni yükümlülük (KVKK m.5/2-ç)..." required />
        </Field>
        <Field label="Saklama Süresi" htmlFor="retentionPeriod" required>
          <Input id="retentionPeriod" name="retentionPeriod" placeholder="ör. 10 yıl, İş sözleşmesi sonu + 10 yıl..." required />
        </Field>
        <Field label="Aktarılan Taraf (opsiyonel)" htmlFor="transferredParty">
          <Input id="transferredParty" name="transferredParty" placeholder="ör. SGK, Bordro programı sağlayıcısı — aktarım yoksa boş bırakın" />
        </Field>
      </FormGrid>
      <div style={{ marginTop: 12 }}>
        <Field label="İşleme Amacı" htmlFor="processingPurpose" required>
          <Textarea id="processingPurpose" name="processingPurpose" placeholder="Bu veri kategorisi hangi amaçla işleniyor?" required />
        </Field>
      </div>
      <div style={{ marginTop: 12 }}>
        <SubmitButton>Envanter Kaydı Ekle</SubmitButton>
      </div>
    </form>
  );
}
