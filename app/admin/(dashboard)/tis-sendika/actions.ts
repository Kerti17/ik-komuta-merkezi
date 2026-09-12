"use server";

// TIS ve Sendika / Endustriyel Iliskiler (komut1.md Faz 1.6 madde 26).
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { collectiveAgreements } from "@/db/schema";
import { logAudit } from "@/lib/audit";

export type FormState = { error?: string } | undefined;

const schema = z.object({
  unionName: z.string().trim().min(1, "Sendika adı gerekli").max(200),
  agreementStartDate: z.string().min(1, "Başlangıç tarihi gerekli"),
  agreementEndDate: z.string().min(1, "Bitiş tarihi gerekli"),
  coveredEmployeeCount: z.string().transform(Number).pipe(z.number().int().min(0, "0 veya daha büyük olmalı")),
});

export async function createCollectiveAgreementAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  if (parsed.data.agreementEndDate < parsed.data.agreementStartDate) {
    return { error: "Bitiş tarihi, başlangıç tarihinden önce olamaz." };
  }

  await db.insert(collectiveAgreements).values(parsed.data);
  await logAudit(`"${parsed.data.unionName}" için TİS kaydı eklendi`);
  revalidatePath("/admin/tis-sendika");
  revalidatePath("/panel");
  return undefined;
}

export async function deleteCollectiveAgreementAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await db.delete(collectiveAgreements).where(eq(collectiveAgreements.id, id));
  await logAudit(`TİS kaydı silindi (id: ${id})`);
  revalidatePath("/admin/tis-sendika");
  revalidatePath("/panel");
}
