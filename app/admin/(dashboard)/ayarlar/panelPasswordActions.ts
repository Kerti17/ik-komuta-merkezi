"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { getSettings } from "@/lib/settings";
import { logAudit } from "@/lib/audit";

export type PanelPasswordState = { error?: string; success?: boolean } | undefined;

const schema = z.object({
  newPassword: z.string().min(6, "Şifre en az 6 karakter olmalı").max(200),
});

export async function updatePanelPasswordAction(_prevState: PanelPasswordState, formData: FormData): Promise<PanelPasswordState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değer geçersiz." };

  const current = await getSettings();
  const passwordHash = await hashPassword(parsed.data.newPassword);
  await db
    .update(settings)
    .set({ panelPasswordHash: passwordHash, updatedAt: new Date().toISOString() })
    .where(eq(settings.id, current.id));

  await logAudit("Panel (Genel Müdür) şifresi değiştirildi");
  revalidatePath("/admin/ayarlar");
  return { success: true };
}
