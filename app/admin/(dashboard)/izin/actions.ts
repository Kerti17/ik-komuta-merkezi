"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { employees, leaveBalances } from "@/db/schema";
import { logAudit } from "@/lib/audit";

export type FormState = { error?: string } | undefined;

const schema = z.object({
  employeeId: z.string().transform(Number).pipe(z.number().int().positive("Çalışan seçin")),
  asOfYear: z.string().transform(Number).pipe(z.number().int().min(2000).max(2100)),
  earnedDays: z.string().transform(Number).pipe(z.number().min(0)),
  usedDays: z.string().transform(Number).pipe(z.number().min(0)),
  remainingDaysTotal: z.string().transform(Number).pipe(z.number().min(0)),
});

// Ayni calisan + yil kombinasyonu icin tek satir tutulur (bkz. db/schema.ts
// leave_balances_employee_year_idx) - var olan kayit varsa guncellenir.
export async function upsertLeaveBalanceAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  await db
    .insert(leaveBalances)
    .values(parsed.data)
    .onConflictDoUpdate({
      target: [leaveBalances.employeeId, leaveBalances.asOfYear],
      set: {
        earnedDays: parsed.data.earnedDays,
        usedDays: parsed.data.usedDays,
        remainingDaysTotal: parsed.data.remainingDaysTotal,
        updatedAt: new Date().toISOString(),
      },
    });

  const [emp] = await db.select({ fullName: employees.fullName }).from(employees).where(eq(employees.id, parsed.data.employeeId)).limit(1);
  await logAudit(`"${emp?.fullName ?? "—"}" için ${parsed.data.asOfYear} yılı izin bakiyesi girildi/güncellendi`);
  revalidatePath("/admin/izin");
  revalidatePath("/admin");
  return undefined;
}
