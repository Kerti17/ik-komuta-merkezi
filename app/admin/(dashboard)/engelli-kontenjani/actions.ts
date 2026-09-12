"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { disabilityQuota } from "@/db/schema";
import { getDisabilityQuota } from "@/lib/settings";
import { logAudit } from "@/lib/audit";

export type FormState = { error?: string; success?: boolean } | undefined;

const schema = z.object({
  totalHeadcount: z.string().transform(Number).pipe(z.number().int().min(0)),
  currentDisabledEmployeeCount: z.string().transform(Number).pipe(z.number().int().min(0)),
  monthlyPenaltyRiskEstimate: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? Number(v) : null))
    .pipe(z.number().min(0).nullable()),
});

export async function updateDisabilityQuotaAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  const current = await getDisabilityQuota();
  await db
    .update(disabilityQuota)
    .set({ ...parsed.data, updatedAt: new Date().toISOString() })
    .where(eq(disabilityQuota.id, current.id));

  await logAudit(`Engelli kontenjanı bilgisi güncellendi (toplam kadro: ${parsed.data.totalHeadcount}, mevcut: ${parsed.data.currentDisabledEmployeeCount})`);
  revalidatePath("/admin/engelli-kontenjani");
  return { success: true };
}
