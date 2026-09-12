"use server";

// SGK Tesvik Motoru (claude-code-talimati.md Bolum 5 Faz1.5 madde 20) - kural
// CRUD islemleri. Otomatik uygunluk onerisi (lib/sgk-incentives.ts) BURADA
// DEGIL, sayfa render'inda salt-okunur hesaplanir - bu dosya sadece kural
// tanimini yazar/siler, hicbir calisan verisine dokunmaz.
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { sgkIncentiveRules } from "@/db/schema";
import { logAudit } from "@/lib/audit";

export type FormState = { error?: string } | undefined;

const emptyToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

const optionalIntField = z.preprocess(emptyToNull, z.string().nullable().transform((v) => (v != null ? Number(v) : null)).pipe(z.number().int().nullable()));
const optionalMoneyField = z.preprocess(emptyToNull, z.string().nullable().transform((v) => (v != null ? Number(v) : null)).pipe(z.number().min(0).nullable()));
const optionalGenderField = z.preprocess(emptyToNull, z.enum(["kadin", "erkek"]).nullable());

const baseSchema = {
  name: z.string().trim().min(1, "Teşvik adı gerekli").max(200),
  description: z.preprocess(emptyToNull, z.string().nullable()),
  ageMin: optionalIntField,
  ageMax: optionalIntField,
  gender: optionalGenderField,
  requiresDisability: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
  region: z.preprocess(emptyToNull, z.string().nullable()),
  estimatedAmount: optionalMoneyField,
  estimatedRatePercent: optionalMoneyField,
  isActive: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
};

const createSchema = z.object(baseSchema);
const updateSchema = z.object({ id: z.string().transform(Number).pipe(z.number().int().positive()), ...baseSchema });

function validateAgeRange(ageMin: number | null, ageMax: number | null): string | null {
  if (ageMin != null && ageMax != null && ageMin > ageMax) return "Minimum yaş, maksimum yaştan büyük olamaz.";
  return null;
}

export async function createSgkIncentiveRuleAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = createSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  const rangeError = validateAgeRange(parsed.data.ageMin, parsed.data.ageMax);
  if (rangeError) return { error: rangeError };

  await db.insert(sgkIncentiveRules).values(parsed.data);
  await logAudit(`"${parsed.data.name}" SGK teşvik kuralı eklendi`);
  revalidatePath("/admin/sgk-tesvikleri");
  return undefined;
}

export async function updateSgkIncentiveRuleAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = updateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };

  const rangeError = validateAgeRange(parsed.data.ageMin, parsed.data.ageMax);
  if (rangeError) return { error: rangeError };

  const { id, ...values } = parsed.data;
  await db.update(sgkIncentiveRules).set({ ...values, updatedAt: new Date().toISOString() }).where(eq(sgkIncentiveRules.id, id));
  await logAudit(`"${values.name}" SGK teşvik kuralı güncellendi`);
  revalidatePath("/admin/sgk-tesvikleri");
  revalidatePath(`/admin/sgk-tesvikleri/${id}`);
  return undefined;
}

export async function deleteSgkIncentiveRuleAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await db.delete(sgkIncentiveRules).where(eq(sgkIncentiveRules.id, id));
  await logAudit(`SGK teşvik kuralı silindi (id: ${id})`);
  revalidatePath("/admin/sgk-tesvikleri");
}

export async function toggleSgkIncentiveRuleActiveAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  const nextActive = formData.get("nextActive") === "true";
  if (!Number.isFinite(id)) return;
  await db.update(sgkIncentiveRules).set({ isActive: nextActive, updatedAt: new Date().toISOString() }).where(eq(sgkIncentiveRules.id, id));
  await logAudit(`SGK teşvik kuralı ${nextActive ? "aktifleştirildi" : "pasife alındı"} (id: ${id})`);
  revalidatePath("/admin/sgk-tesvikleri");
}
