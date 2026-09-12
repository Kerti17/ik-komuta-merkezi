"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { employees, evaluations } from "@/db/schema";
import { logAudit } from "@/lib/audit";

export type FormState = { error?: string } | undefined;

// komut1.md Faz 1.6 madde 27a: reviewType, ise_giris (deneme/6_ay/1_yil,
// mevcut) ile periyodik (yillik/alti_aylik, TUM kadro icin - yeni) turlerini
// ayirir. stage'in reviewType'a uygun olup olmadigi asagida elle kontrol
// edilir (zod enum'u tek basina bu capraz kurali ifade edemez).
const createSchema = z.object({
  employeeId: z.string().transform(Number).pipe(z.number().int().positive("Çalışan seçin")),
  reviewType: z.enum(["ise_giris", "periyodik"], { message: "Değerlendirme türü seçin" }),
  stage: z.enum(["deneme", "6_ay", "1_yil", "yillik", "alti_aylik"], { message: "Aşama seçin" }),
  dueDate: z.string().min(1, "Son tarih gerekli"),
});

const STAGES_BY_REVIEW_TYPE: Record<string, string[]> = {
  ise_giris: ["deneme", "6_ay", "1_yil"],
  periyodik: ["yillik", "alti_aylik"],
};

export async function createEvaluationAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = createSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  if (!STAGES_BY_REVIEW_TYPE[parsed.data.reviewType].includes(parsed.data.stage)) {
    return { error: "Seçilen aşama, değerlendirme türüyle uyumlu değil." };
  }

  await db.insert(evaluations).values({ ...parsed.data, status: "bekliyor" });
  const [emp] = await db.select({ fullName: employees.fullName }).from(employees).where(eq(employees.id, parsed.data.employeeId)).limit(1);
  await logAudit(`"${emp?.fullName ?? "—"}" için ${parsed.data.stage} değerlendirmesi planlandı`);
  revalidatePath("/admin/degerlendirmeler");
  revalidatePath("/admin");
  revalidatePath("/panel");
  return undefined;
}

const scoreField = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? Number(v) : null))
  .pipe(z.number().min(0).max(100).nullable());

const updateSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive()),
  status: z.enum(["bekliyor", "acil", "gecikti", "devam", "sonlandirildi"]),
  competencyScore: scoreField,
  adaptationScore: scoreField,
  performanceScore: scoreField,
  notes: z.string().optional().transform((v) => (v && v.trim() !== "" ? v : null)),
});

export async function updateEvaluationAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = updateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };
  const { id, ...rest } = parsed.data;

  const hasAnyScore = rest.competencyScore !== null || rest.adaptationScore !== null || rest.performanceScore !== null;
  await db
    .update(evaluations)
    .set({
      ...rest,
      evaluatedAt: hasAnyScore ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(evaluations.id, id));

  const [row] = await db.query.evaluations.findMany({ where: eq(evaluations.id, id), with: { employee: true }, limit: 1 });
  await logAudit(`"${row?.employee?.fullName ?? "—"}" için değerlendirme güncellendi (durum: ${rest.status})`);
  revalidatePath("/admin/degerlendirmeler");
  revalidatePath("/admin");
  return undefined;
}
