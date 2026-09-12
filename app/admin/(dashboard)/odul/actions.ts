"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { employees, recognitions } from "@/db/schema";
import { logAudit } from "@/lib/audit";

export type FormState = { error?: string } | undefined;

const schema = z.object({
  employeeId: z.string().transform(Number).pipe(z.number().int().positive("Çalışan seçin")),
  awardName: z.string().trim().min(1, "Ödül adı gerekli").max(150),
  awardDate: z.string().min(1, "Tarih gerekli"),
});

export async function createRecognitionAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  await db.insert(recognitions).values(parsed.data);
  const [emp] = await db.select({ fullName: employees.fullName }).from(employees).where(eq(employees.id, parsed.data.employeeId)).limit(1);
  await logAudit(`"${emp?.fullName ?? "—"}" için ödül eklendi (${parsed.data.awardName})`);
  revalidatePath("/admin/odul");
  return undefined;
}
