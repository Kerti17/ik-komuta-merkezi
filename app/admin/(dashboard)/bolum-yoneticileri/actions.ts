"use server";

// Bolum Yoneticisi hesap yonetimi (Bolum 5 Faz1.5 madde 21). Bu hesaplar
// admin_users tablosunda role="departman_muduru" olarak tutulur (bkz.
// db/schema.ts manager_notes yorumundaki mimari karar). /admin/login ile
// giris yapar, proxy.ts onlari otomatik /yonetici'ye yonlendirir.
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { logAudit } from "@/lib/audit";

export type FormState = { error?: string } | undefined;

const createSchema = z.object({
  fullName: z.string().trim().min(1, "Ad soyad gerekli").max(150),
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta girin"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
  departmentId: z.string().transform(Number).pipe(z.number().int().positive("Departman seçin")),
});

export async function createManagerAccountAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = createSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  const [existing] = await db.select().from(adminUsers).where(eq(adminUsers.email, parsed.data.email)).limit(1);
  if (existing) return { error: "Bu e-posta ile zaten bir hesap var." };

  const passwordHash = await hashPassword(parsed.data.password);
  await db.insert(adminUsers).values({
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    passwordHash,
    departmentId: parsed.data.departmentId,
    role: "departman_muduru",
  });

  await logAudit(`"${parsed.data.fullName}" bölüm yöneticisi hesabı oluşturuldu`);
  revalidatePath("/admin/bolum-yoneticileri");
  return undefined;
}

export async function deleteManagerAccountAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  // Guvenlik: sadece departman_muduru rolundeki hesaplar bu ekrandan silinebilir
  // - yanlislikla ik_admin/genel_mudur hesabi silinmesini engeller.
  await db.delete(adminUsers).where(and(eq(adminUsers.id, id), eq(adminUsers.role, "departman_muduru")));
  await logAudit(`Bölüm yöneticisi hesabı silindi (id: ${id})`);
  revalidatePath("/admin/bolum-yoneticileri");
}
