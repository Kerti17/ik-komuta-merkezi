"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { departments, branches } from "@/db/schema";
import { logAudit } from "@/lib/audit";

export type FormState = { error?: string } | undefined;

const nameSchema = z.string().trim().min(1, "Ad boş olamaz").max(120);

function friendlyDbError(err: unknown, inUseMessage: string): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("UNIQUE constraint")) return "Bu isimde bir kayıt zaten var.";
  if (msg.includes("FOREIGN KEY constraint")) return inUseMessage;
  return "Beklenmeyen bir hata oluştu.";
}

export async function createDepartmentAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    await db.insert(departments).values({ name: parsed.data });
  } catch (err) {
    return { error: friendlyDbError(err, "Bu departman kullanımda.") };
  }
  await logAudit(`"${parsed.data}" departmanı eklendi`);
  revalidatePath("/admin/departmanlar");
  return undefined;
}

export async function deleteDepartmentAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (!id) return;
  try {
    await db.delete(departments).where(eq(departments.id, id));
    await logAudit(`Departman silindi (id: ${id})`);
  } catch {
    // Departman calisanlar tarafindan kullaniliyorsa FK kisiti siler islemini engeller -
    // sessizce yok sayiliyor, liste degismeden kalir (bkz. UI notu).
  }
  revalidatePath("/admin/departmanlar");
}

export async function createBranchAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const address = formData.get("address");
  try {
    await db.insert(branches).values({ name: parsed.data, address: typeof address === "string" && address ? address : null });
  } catch (err) {
    return { error: friendlyDbError(err, "Bu şube kullanımda.") };
  }
  await logAudit(`"${parsed.data}" şubesi eklendi`);
  revalidatePath("/admin/departmanlar");
  return undefined;
}

export async function deleteBranchAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (!id) return;
  try {
    await db.delete(branches).where(eq(branches.id, id));
    await logAudit(`Şube silindi (id: ${id})`);
  } catch {
    // bkz. deleteDepartmentAction notu
  }
  revalidatePath("/admin/departmanlar");
}
