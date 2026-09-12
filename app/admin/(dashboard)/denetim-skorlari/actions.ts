"use server";

// Musteri Denetim Skorlari (komut1.md Faz 1.6 madde 23). DIKKAT: bu, sistemin
// otomatik tuttugu audit_log (lib/audit.ts) ile KARISTIRILMAMALI - burasi
// musterinin sirketi denetlemeye geldigi ziyaretlerin IK tarafindan elle
// girilen sonuc kaydidir.
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { customerAudits } from "@/db/schema";
import { logAudit } from "@/lib/audit";

export type FormState = { error?: string } | undefined;

const emptyToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

const schema = z.object({
  customerName: z.string().trim().min(1, "Müşteri adı gerekli").max(200),
  auditDate: z.string().min(1, "Tarih gerekli"),
  score: z.string().transform(Number).pipe(z.number().min(0, "Skor 0-100 arasında olmalı").max(100, "Skor 0-100 arasında olmalı")),
  description: z.preprocess(emptyToNull, z.string().nullable()),
});

export async function createCustomerAuditAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  await db.insert(customerAudits).values(parsed.data);
  await logAudit(`"${parsed.data.customerName}" için müşteri denetim skoru eklendi (${parsed.data.score})`);
  revalidatePath("/admin/denetim-skorlari");
  return undefined;
}

export async function deleteCustomerAuditAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await db.delete(customerAudits).where(eq(customerAudits.id, id));
  await logAudit(`Müşteri denetim skoru kaydı silindi (id: ${id})`);
  revalidatePath("/admin/denetim-skorlari");
}
