import { db } from "@/db";
import { settings, disabilityQuota, riskScoreWeights } from "@/db/schema";

// settings, disability_quota ve risk_score_weights tek satirlik tablolardir
// (bkz. db/schema.ts). Ilk erisimde satir yoksa DB varsayilanlariyla otomatik
// olusturulur.

export async function getSettings() {
  const [row] = await db.select().from(settings).limit(1);
  if (row) return row;
  const [created] = await db.insert(settings).values({}).returning();
  return created;
}

export async function getDisabilityQuota() {
  const [row] = await db.select().from(disabilityQuota).limit(1);
  if (row) return row;
  const [created] = await db.insert(disabilityQuota).values({ totalHeadcount: 0 }).returning();
  return created;
}

// Ayrilma riski skoru agirliklari (Bolum 5 Faz1.5 madde 19) - v1 formulunun
// bes sinyaline karsilik gelir, admin panelden degistirilebilir.
export async function getRiskScoreWeights() {
  const [row] = await db.select().from(riskScoreWeights).limit(1);
  if (row) return row;
  const [created] = await db.insert(riskScoreWeights).values({}).returning();
  return created;
}
