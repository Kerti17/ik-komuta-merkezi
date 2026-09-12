"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { disciplinaryRecords, employees } from "@/db/schema";
import { logAudit } from "@/lib/audit";

export type FormState = { error?: string } | undefined;

const schema = z.object({
  employeeId: z.string().transform(Number).pipe(z.number().int().positive("Çalışan seçin")),
  recordDate: z.string().min(1, "Tarih gerekli"),
  type: z.enum(["sozlu_uyari", "yazili_uyari", "devamsizlik_tutanagi", "diger"], { message: "Tür seçin" }),
  description: z.string().optional().transform((v) => (v && v.trim() !== "" ? v : null)),
});

export async function createDisciplinaryRecordAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  await db.insert(disciplinaryRecords).values(parsed.data);
  const [emp] = await db.select({ fullName: employees.fullName }).from(employees).where(eq(employees.id, parsed.data.employeeId)).limit(1);
  await logAudit(`"${emp?.fullName ?? "—"}" için tutanak eklendi (${parsed.data.type})`);
  revalidatePath("/admin/tutanaklar");
  return undefined;
}
