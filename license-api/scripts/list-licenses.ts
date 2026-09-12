// ---------------------------------------------------------------------------
// Tum lisanslari listeler (kurucu icin basit bir gozden gecirme araci).
// Kullanim: npm run license:list
// ---------------------------------------------------------------------------
import "dotenv/config";
import { desc } from "drizzle-orm";
import { db } from "../db";
import { licenses } from "../db/schema";

async function main() {
  const rows = await db.select().from(licenses).orderBy(desc(licenses.expiresAt));
  if (rows.length === 0) {
    console.log("Henuz lisans yok.");
    process.exit(0);
  }

  const today = new Date().toISOString().slice(0, 10);
  for (const r of rows) {
    const effective = r.status === "iptal" ? "iptal" : r.expiresAt < today ? "suresi_doldu" : "aktif";
    console.log(`${r.customerName.padEnd(30)} ${r.licenseKey}  [${effective.padEnd(13)}]  bitis: ${r.expiresAt}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
