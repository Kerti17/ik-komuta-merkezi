"use server";

// Egitim ve Gelisim Modulu (komut1.md Faz 1.6 madde 25a/b) - IK tarafinda
// egitim kaydi CRUD'u. Egitime ozel "gelisim degerlendirmesi" (madde 25c) bu
// dosyada DEGIL, /yonetici tarafinda (managerNotes.trainingId ile) girilir -
// burasi sadece egitim kaydinin kendisini yonetir.
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { employees, trainings, managerNotes } from "@/db/schema";
import { logAudit } from "@/lib/audit";

export type FormState = { error?: string } | undefined;

const createSchema = z.object({
  employeeId: z.string().transform(Number).pipe(z.number().int().positive("Çalışan seçin")),
  trainingName: z.string().trim().min(1, "Eğitim adı gerekli").max(200),
  trainingField: z.string().trim().min(1, "Eğitim alanı/kategorisi gerekli").max(100),
});

export async function createTrainingAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = createSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  await db.insert(trainings).values(parsed.data);
  const [emp] = await db.select({ fullName: employees.fullName }).from(employees).where(eq(employees.id, parsed.data.employeeId)).limit(1);
  await logAudit(`"${emp?.fullName ?? "—"}" için eğitim kaydı eklendi (${parsed.data.trainingName})`);
  revalidatePath("/admin/egitimler");
  revalidatePath(`/admin/calisanlar/${parsed.data.employeeId}`);
  return undefined;
}

const completeSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive()),
  completedDate: z.string().min(1, "Tamamlanma tarihi gerekli"),
});

export async function markTrainingCompletedAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = completeSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  const [training] = await db.select().from(trainings).where(eq(trainings.id, parsed.data.id)).limit(1);
  if (!training) return { error: "Eğitim kaydı bulunamadı." };

  await db
    .update(trainings)
    .set({ status: "tamamlandi", completedDate: parsed.data.completedDate, updatedAt: new Date().toISOString() })
    .where(eq(trainings.id, parsed.data.id));
  await logAudit(`"${training.trainingName}" eğitimi tamamlandı olarak işaretlendi`);
  revalidatePath("/admin/egitimler");
  revalidatePath(`/admin/calisanlar/${training.employeeId}`);
  revalidatePath("/yonetici");
  return undefined;
}

export async function reopenTrainingAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  const [training] = await db.select().from(trainings).where(eq(trainings.id, id)).limit(1);
  if (!training) return;

  await db.update(trainings).set({ status: "tamamlanmadi", completedDate: null, updatedAt: new Date().toISOString() }).where(eq(trainings.id, id));
  await logAudit(`"${training.trainingName}" eğitimi yeniden "tamamlanmadı" durumuna alındı`);
  revalidatePath("/admin/egitimler");
  revalidatePath(`/admin/calisanlar/${training.employeeId}`);
  revalidatePath("/yonetici");
}

export async function deleteTrainingAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;

  const [training] = await db.select().from(trainings).where(eq(trainings.id, id)).limit(1);
  if (!training) return;

  // Bu egitime bagli bir gelisim degerlendirmesi varsa silme - degerlendirme
  // trainingId'si uzerinden bu kayda referans veriyor, sessizce "yetim"
  // kalmasindansa IK'ya once degerlendirmeyi gormesini/temizlemesini sagla.
  const linkedAssessmentCount = await db.$count(managerNotes, eq(managerNotes.trainingId, id));
  if (linkedAssessmentCount > 0) {
    console.error(`[egitimler] silme engellendi: eğitim #${id} için ${linkedAssessmentCount} yönetici değerlendirmesi var.`);
    return;
  }

  await db.delete(trainings).where(eq(trainings.id, id));
  await logAudit(`"${training.trainingName}" eğitim kaydı silindi`);
  revalidatePath("/admin/egitimler");
  revalidatePath(`/admin/calisanlar/${training.employeeId}`);
}
