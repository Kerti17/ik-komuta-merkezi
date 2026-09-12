"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { employees, mediationCases } from "@/db/schema";
import { logAudit } from "@/lib/audit";

export type FormState = { error?: string } | undefined;

const schema = z.object({
  employeeId: z.string().transform(Number).pipe(z.number().int().positive("Çalışan seçin")),
  caseDate: z.string().min(1, "Tarih gerekli"),
  paidAmount: z.string().transform(Number).pipe(z.number().min(0, "Ödenen tutar 0 veya üzeri olmalı")),
  estimatedLawsuitCost: z.string().transform(Number).pipe(z.number().min(0, "Tahmini dava maliyeti 0 veya üzeri olmalı")),
  notes: z.string().optional().transform((v) => (v && v.trim() !== "" ? v : null)),
});

export async function createMediationCaseAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  await db.insert(mediationCases).values(parsed.data);
  const [emp] = await db.select({ fullName: employees.fullName }).from(employees).where(eq(employees.id, parsed.data.employeeId)).limit(1);
  await logAudit(`"${emp?.fullName ?? "—"}" için arabuluculuk dosyası eklendi`);
  revalidatePath("/admin/arabuluculuk");
  return undefined;
}
