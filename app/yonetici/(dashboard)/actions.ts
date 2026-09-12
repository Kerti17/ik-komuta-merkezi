"use server";

// Bolum Yoneticisi not ekleme (Bolum 5 Faz1.5 madde 21). Yetki kontrolu
// SADECE proxy.ts'e (route seviyesi) birakilmaz - burada da savunmaci olarak
// calisanin GERCEKTEN oturumdaki yoneticinin departmaninda olup olmadigi
// kontrol edilir (aksi halde URL'den employeeId degistirilerek baska
// departmana not yazilabilirdi).
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { employees, managerNotes, trainings } from "@/db/schema";
import { logAudit } from "@/lib/audit";

export type FormState = { error?: string } | undefined;

const schema = z.object({
  employeeId: z.string().transform(Number).pipe(z.number().int().positive()),
  noteDate: z.string().min(1, "Tarih gerekli"),
  note: z.string().trim().min(1, "Not boş olamaz").max(2000),
});

export async function createManagerNoteAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "departman_muduru" || session.user.departmentId == null) {
    return { error: "Yetkisiz işlem." };
  }

  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  const [employee] = await db.select().from(employees).where(eq(employees.id, parsed.data.employeeId)).limit(1);
  if (!employee || employee.departmentId !== session.user.departmentId) {
    return { error: "Bu çalışan sizin departmanınızda değil." };
  }

  await db.insert(managerNotes).values({
    employeeId: parsed.data.employeeId,
    authorId: Number(session.user.id),
    noteDate: parsed.data.noteDate,
    note: parsed.data.note,
  });

  await logAudit(`"${employee.fullName}" için yönetici notu eklendi`);
  revalidatePath("/yonetici");
  return undefined;
}

// Egitim sonrasi gelisim degerlendirmesi (komut1.md Faz 1.6 madde 25c) - ayni
// managerNotes tablosuna yazar ama trainingId doldurulur, bu yuzden genel
// notlardan (madde 21) ayrilir. IK panelinde bu deger /admin/egitimler ve
// calisan detayinda gorunur.
const trainingAssessmentSchema = z.object({
  employeeId: z.string().transform(Number).pipe(z.number().int().positive()),
  trainingId: z.string().transform(Number).pipe(z.number().int().positive()),
  noteDate: z.string().min(1, "Tarih gerekli"),
  note: z.string().trim().min(1, "Değerlendirme boş olamaz").max(2000),
});

export async function createTrainingAssessmentAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "departman_muduru" || session.user.departmentId == null) {
    return { error: "Yetkisiz işlem." };
  }

  const parsed = trainingAssessmentSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  const [employee] = await db.select().from(employees).where(eq(employees.id, parsed.data.employeeId)).limit(1);
  if (!employee || employee.departmentId !== session.user.departmentId) {
    return { error: "Bu çalışan sizin departmanınızda değil." };
  }

  const [training] = await db.select().from(trainings).where(eq(trainings.id, parsed.data.trainingId)).limit(1);
  if (!training || training.employeeId !== parsed.data.employeeId) {
    return { error: "Bu eğitim, seçilen çalışana ait değil." };
  }
  if (training.status !== "tamamlandi") {
    return { error: "Sadece tamamlanmış eğitimler için değerlendirme girilebilir." };
  }

  await db.insert(managerNotes).values({
    employeeId: parsed.data.employeeId,
    authorId: Number(session.user.id),
    noteDate: parsed.data.noteDate,
    note: parsed.data.note,
    trainingId: parsed.data.trainingId,
  });

  await logAudit(`"${employee.fullName}" için "${training.trainingName}" eğitimine gelişim değerlendirmesi girildi`);
  revalidatePath("/yonetici");
  revalidatePath("/admin/egitimler");
  revalidatePath(`/admin/calisanlar/${parsed.data.employeeId}`);
  return undefined;
}
