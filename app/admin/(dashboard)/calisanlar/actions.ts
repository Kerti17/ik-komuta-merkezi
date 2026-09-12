"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { logAudit } from "@/lib/audit";

export type FormState = { error?: string } | undefined;

const optionalMoney = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? Number(v) : null))
  .pipe(z.number().min(0).nullable());

const optionalDate = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? v : null));

// Bolum 5 Faz1.5 madde 22: dogum tarihi/cinsiyet/emekli durumu - SGK tesvik
// uygunluk hesaplamasi (madde 20) icin gerekli, ikisi de opsiyonel (mevcut
// calisanlarda bos olabilir). KVKK notu: bu alanlar ozel nitelikli degil ama
// kisisel veridir, bolum yoneticisi ekraninda (madde 21) gosterilmez.
const optionalGender = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? v : null))
  .pipe(z.enum(["kadin", "erkek"]).nullable());
const checkboxField = z.preprocess((v) => v === "on" || v === "true", z.boolean());

const baseSchema = z.object({
  fullName: z.string().trim().min(1, "Ad soyad boş olamaz").max(150),
  departmentId: z.string().transform(Number).pipe(z.number().int().positive("Departman seçin")),
  branchId: z.string().transform(Number).pipe(z.number().int().positive("Şube seçin")),
  collarType: z.enum(["mavi", "beyaz"], { message: "Yaka tipi seçin" }),
  hireDate: z.string().min(1, "İşe giriş tarihi gerekli"),
  monthlySalary: optionalMoney,
  birthDate: optionalDate,
  gender: optionalGender,
  isRetired: checkboxField,
});

export async function createEmployeeAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = baseSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  await db.insert(employees).values({ ...parsed.data, status: "aktif" });
  await logAudit(`"${parsed.data.fullName}" adlı çalışan eklendi`);
  revalidatePath("/admin/calisanlar");
  revalidatePath("/admin");
  return undefined;
}

const updateSchema = baseSchema.extend({
  id: z.string().transform(Number).pipe(z.number().int().positive()),
  status: z.enum(["aktif", "ayrildi"]),
  terminationDate: optionalDate,
});

export async function updateEmployeeAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = updateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };
  const { id, ...rest } = parsed.data;

  if (rest.status === "ayrildi" && !rest.terminationDate) {
    return { error: "\"Ayrıldı\" durumu için ayrılış tarihi gerekli." };
  }
  if (rest.status === "aktif") rest.terminationDate = null;

  await db
    .update(employees)
    .set({ ...rest, updatedAt: new Date().toISOString() })
    .where(eq(employees.id, id));

  await logAudit(`"${rest.fullName}" adlı çalışan güncellendi${rest.status === "ayrildi" ? " (durum: ayrıldı)" : ""}`);
  revalidatePath("/admin/calisanlar");
  revalidatePath("/admin");
  return undefined;
}
