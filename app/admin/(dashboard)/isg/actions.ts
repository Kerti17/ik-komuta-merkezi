"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { employees, healthScreenings } from "@/db/schema";
import { logAudit } from "@/lib/audit";

export type FormState = { error?: string } | undefined;

const schema = z.object({
  employeeId: z.string().transform(Number).pipe(z.number().int().positive("Çalışan seçin")),
  screeningType: z.string().trim().min(1, "Tarama türü gerekli").max(150),
  lastScreeningDate: z.string().optional().transform((v) => (v && v.trim() !== "" ? v : null)),
  dueDate: z.string().min(1, "Son tarih gerekli"),
});

export async function createHealthScreeningAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  await db.insert(healthScreenings).values(parsed.data);
  const [emp] = await db.select({ fullName: employees.fullName }).from(employees).where(eq(employees.id, parsed.data.employeeId)).limit(1);
  await logAudit(`"${emp?.fullName ?? "—"}" için ISG taraması eklendi (${parsed.data.screeningType})`);
  revalidatePath("/admin/isg");
  revalidatePath("/admin");
  return undefined;
}
