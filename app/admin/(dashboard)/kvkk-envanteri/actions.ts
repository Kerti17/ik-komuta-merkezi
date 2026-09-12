"use server";

// KVKK Kisisel Veri Envanteri (komut1.md Faz 1.6 madde 28) - salt bir
// dokumantasyon araci, otomatik hukuki uygunluk denetimi YAPMAZ (bkz. page.tsx
// uyarisi).
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { kvkkInventory } from "@/db/schema";
import { logAudit } from "@/lib/audit";

export type FormState = { error?: string } | undefined;

const emptyToNull = (v: unknown) => (v == null || (typeof v === "string" && v.trim() === "") ? null : v);

const baseSchema = {
  dataCategory: z.string().trim().min(1, "Veri kategorisi gerekli").max(150),
  processingPurpose: z.string().trim().min(1, "İşleme amacı gerekli").max(500),
  legalBasis: z.string().trim().min(1, "Hukuki dayanak gerekli").max(300),
  retentionPeriod: z.string().trim().min(1, "Saklama süresi gerekli").max(100),
  transferredParty: z.preprocess(emptyToNull, z.string().max(300).nullable()),
};

const createSchema = z.object(baseSchema);
const updateSchema = z.object({ id: z.string().transform(Number).pipe(z.number().int().positive()), ...baseSchema });

export async function createKvkkInventoryAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = createSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  await db.insert(kvkkInventory).values(parsed.data);
  await logAudit(`"${parsed.data.dataCategory}" için KVKK envanter kaydı eklendi`);
  revalidatePath("/admin/kvkk-envanteri");
  return undefined;
}

export async function updateKvkkInventoryAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = updateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  const { id, ...values } = parsed.data;
  await db.update(kvkkInventory).set({ ...values, updatedAt: new Date().toISOString() }).where(eq(kvkkInventory.id, id));
  await logAudit(`"${values.dataCategory}" KVKK envanter kaydı güncellendi`);
  revalidatePath("/admin/kvkk-envanteri");
  revalidatePath(`/admin/kvkk-envanteri/${id}`);
  return undefined;
}

export async function deleteKvkkInventoryAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await db.delete(kvkkInventory).where(eq(kvkkInventory.id, id));
  await logAudit(`KVKK envanter kaydı silindi (id: ${id})`);
  revalidatePath("/admin/kvkk-envanteri");
}
