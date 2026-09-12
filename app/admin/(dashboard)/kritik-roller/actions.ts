"use server";

// Kritik Rol & Yedekleme (claude-code-talimati.md Bolum 5 Faz1.5 madde 18):
// admin kritik pozisyonlari + bu pozisyon icin yedek/capraz egitimli personeli
// tanimlar. backupCount <= 0 olan (ve bir calisana atanmis) satirlar
// lib/panel-data.ts'te dashboard uyari banner'ina donusur (bkz. PanelDashboard.tsx).
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { criticalRoles } from "@/db/schema";
import { logAudit } from "@/lib/audit";

export type FormState = { error?: string } | undefined;

const emptyToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

const baseSchema = {
  roleName: z.string().min(1, "Pozisyon adı gerekli"),
  currentEmployeeId: z.preprocess(emptyToNull, z.string().nullable().transform((v) => (v ? Number(v) : null))),
  backupCount: z.string().transform(Number).pipe(z.number().int("Tam sayı olmalı").min(0, "0 veya daha büyük olmalı")),
  backupStatus: z.preprocess(emptyToNull, z.string().nullable()),
  riskLevel: z.enum(["dusuk", "orta", "kritik"], { message: "Risk seviyesi seçin" }),
};

const createSchema = z.object(baseSchema);
const updateSchema = z.object({ id: z.string().transform(Number).pipe(z.number().int().positive()), ...baseSchema });

export async function createCriticalRoleAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = createSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  await db.insert(criticalRoles).values(parsed.data);
  await logAudit(`"${parsed.data.roleName}" kritik pozisyonu eklendi`);
  revalidatePath("/admin/kritik-roller");
  revalidatePath("/panel");
  return undefined;
}

export async function updateCriticalRoleAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = updateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  const { id, ...values } = parsed.data;
  await db.update(criticalRoles).set({ ...values, updatedAt: new Date().toISOString() }).where(eq(criticalRoles.id, id));
  await logAudit(`"${values.roleName}" kritik pozisyonu güncellendi`);
  revalidatePath("/admin/kritik-roller");
  revalidatePath("/panel");
  return undefined;
}

export async function deleteCriticalRoleAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await db.delete(criticalRoles).where(eq(criticalRoles.id, id));
  await logAudit(`Kritik pozisyon silindi (id: ${id})`);
  revalidatePath("/admin/kritik-roller");
  revalidatePath("/panel");
}
