"use server";

// Icra Takip (komut1.md Faz 1.6 madde 29).
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { employees, garnishments } from "@/db/schema";
import { computeGarnishmentBalance } from "@/lib/garnishments";
import { logAudit } from "@/lib/audit";

export type FormState = { error?: string } | undefined;

const createSchema = z.object({
  employeeId: z.string().transform(Number).pipe(z.number().int().positive("Çalışan seçin")),
  enforcementOffice: z.string().trim().min(1, "İcra dairesi gerekli").max(200),
  caseNumber: z.string().trim().min(1, "Dosya no gerekli").max(100),
  totalDebt: z.string().transform(Number).pipe(z.number().min(0.01, "Toplam borç 0'dan büyük olmalı")),
  monthlyDeductionAmount: z.string().transform(Number).pipe(z.number().min(0.01, "Aylık kesinti tutarı 0'dan büyük olmalı")),
});

export async function createGarnishmentAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = createSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  await db.insert(garnishments).values(parsed.data);
  const [emp] = await db.select({ fullName: employees.fullName }).from(employees).where(eq(employees.id, parsed.data.employeeId)).limit(1);
  await logAudit(`"${emp?.fullName ?? "—"}" için icra dosyası eklendi (${parsed.data.caseNumber})`);
  revalidatePath("/admin/icra-takip");
  revalidatePath("/panel");
  return undefined;
}

const deductionSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive()),
  amount: z.string().transform(Number).pipe(z.number().min(0.01, "Tutar 0'dan büyük olmalı")),
});

export async function processGarnishmentDeductionAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = deductionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  const [row] = await db.query.garnishments.findMany({ where: eq(garnishments.id, parsed.data.id), with: { employee: true }, limit: 1 });
  if (!row) return { error: "İcra dosyası bulunamadı." };

  const { status } = computeGarnishmentBalance(row.totalDebt, row.deductedAmount);
  if (status === "tamamlandi") return { error: "Bu icra dosyası zaten tamamlanmış." };

  // Kalan bakiyeden fazla kesinti islenemez - deductedAmount totalDebt'i asamaz.
  const newDeductedAmount = Math.min(row.totalDebt, row.deductedAmount + parsed.data.amount);

  await db.update(garnishments).set({ deductedAmount: newDeductedAmount, updatedAt: new Date().toISOString() }).where(eq(garnishments.id, row.id));
  await logAudit(`"${row.employee?.fullName ?? "—"}" için icra kesintisi işlendi (${parsed.data.amount} TL, dosya: ${row.caseNumber})`);
  revalidatePath("/admin/icra-takip");
  revalidatePath("/panel");
  return undefined;
}

export async function deleteGarnishmentAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await db.delete(garnishments).where(eq(garnishments.id, id));
  await logAudit(`İcra dosyası kaydı silindi (id: ${id})`);
  revalidatePath("/admin/icra-takip");
  revalidatePath("/panel");
}
