"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { employees, exitInterviews } from "@/db/schema";
import { EXIT_REASON_CATEGORIES } from "@/lib/exit-interviews";
import { logAudit } from "@/lib/audit";

export type FormState = { error?: string } | undefined;

const schema = z.object({
  employeeId: z.string().transform(Number).pipe(z.number().int().positive("Çalışan seçin")),
  exitDate: z.string().min(1, "Ayrılış tarihi gerekli"),
  reasonCategory: z.enum(EXIT_REASON_CATEGORIES, { message: "Kategori seçin" }),
  notes: z.string().optional().transform((v) => (v && v.trim() !== "" ? v : null)),
});

export async function createExitInterviewAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  await db.insert(exitInterviews).values(parsed.data);
  const [emp] = await db.select({ fullName: employees.fullName }).from(employees).where(eq(employees.id, parsed.data.employeeId)).limit(1);
  await logAudit(`"${emp?.fullName ?? "—"}" için çıkış mülakatı kaydedildi (${parsed.data.reasonCategory})`);
  revalidatePath("/admin/cikis-mulakati");
  revalidatePath("/panel");
  return undefined;
}
