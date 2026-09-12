"use server";

// Kariyer Takibi (komut1.md Faz 1.6 madde 27b) - tek tabloda iki kayit turu,
// bkz. db/schema.ts careerRecords yorumu.
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { employees, careerRecords } from "@/db/schema";
import { logAudit } from "@/lib/audit";

export type FormState = { error?: string } | undefined;

// v === undefined olabilir - client'ta o an secili olmayan turun alanlari
// hic render edilmiyor, bu yuzden FormData'da o anahtar tamamen eksik kalir.
const emptyToNull = (v: unknown) => (v == null || (typeof v === "string" && v.trim() === "") ? null : v);

const baseSchema = z.object({
  employeeId: z.string().transform(Number).pipe(z.number().int().positive("Çalışan seçin")),
  recordType: z.enum(["gecmis", "plan"], { message: "Kayıt türü seçin" }),
  title: z.preprocess(emptyToNull, z.string().max(150).nullable()),
  effectiveDate: z.preprocess(emptyToNull, z.string().nullable()),
  targetTitle: z.preprocess(emptyToNull, z.string().max(150).nullable()),
  targetDate: z.preprocess(emptyToNull, z.string().nullable()),
  developmentNote: z.preprocess(emptyToNull, z.string().max(2000).nullable()),
});

export async function createCareerRecordAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = baseSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  const { recordType, title, effectiveDate, targetTitle, targetDate, developmentNote, employeeId } = parsed.data;

  if (recordType === "gecmis") {
    if (!title || !effectiveDate) return { error: "Unvan ve tarih gerekli." };
  } else {
    if (!targetTitle || !targetDate) return { error: "Hedef unvan ve hedef tarih gerekli." };
  }

  await db.insert(careerRecords).values({ employeeId, recordType, title, effectiveDate, targetTitle, targetDate, developmentNote });

  const [emp] = await db.select({ fullName: employees.fullName }).from(employees).where(eq(employees.id, employeeId)).limit(1);
  await logAudit(
    recordType === "gecmis"
      ? `"${emp?.fullName ?? "—"}" için unvan/terfi geçmişi kaydı eklendi (${title})`
      : `"${emp?.fullName ?? "—"}" için kariyer planı eklendi (hedef: ${targetTitle})`
  );
  revalidatePath("/admin/kariyer");
  revalidatePath("/panel");
  return undefined;
}

export async function deleteCareerRecordAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await db.delete(careerRecords).where(eq(careerRecords.id, id));
  await logAudit(`Kariyer kaydı silindi (id: ${id})`);
  revalidatePath("/admin/kariyer");
  revalidatePath("/panel");
}
