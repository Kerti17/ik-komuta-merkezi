// ---------------------------------------------------------------------------
// Mevcut bir lisansi yeniler (odeme alindiginda calistirilir). Musterinin
// .env dosyasinda hicbir sey degismesine gerek yok - ayni LICENSE_KEY,
// bir sonraki periyodik kontrolde (bkz. musteri tarafi lib/license.ts,
// varsayilan 24 saatte bir) yeni gecerlilik tarihini otomatik alir.
//
// Kullanim:
//   npm run license:renew -- IKKM-XXXX-XXXX-XXXX-XXXX 365
// ---------------------------------------------------------------------------
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { licenses } from "../db/schema";

async function main() {
  const [licenseKey, daysArg] = process.argv.slice(2);
  if (!licenseKey) {
    console.error("Kullanim: npm run license:renew -- <licenseKey> [gun_sayisi=365]");
    process.exit(1);
  }
  const days = daysArg ? Number(daysArg) : 365;
  if (!Number.isFinite(days) || days <= 0) {
    console.error("gun_sayisi pozitif bir sayi olmali.");
    process.exit(1);
  }

  const [existing] = await db.select().from(licenses).where(eq(licenses.licenseKey, licenseKey)).limit(1);
  if (!existing) {
    console.error(`Lisans bulunamadi: ${licenseKey}`);
    process.exit(1);
  }

  // Yenileme, mevcut gecerlilik tarihinden mi yoksa bugunden mi baslar:
  // suresi zaten gecmisse bugunden, gecmemisse kalan sureye eklenerek uzatilir.
  const today = new Date();
  const currentExpiry = new Date(`${existing.expiresAt}T00:00:00Z`);
  const base = currentExpiry.getTime() > today.getTime() ? currentExpiry : today;
  const newExpiry = new Date(base);
  newExpiry.setUTCDate(newExpiry.getUTCDate() + days);
  const expiresAt = newExpiry.toISOString().slice(0, 10);

  await db
    .update(licenses)
    .set({ expiresAt, status: "aktif", updatedAt: new Date().toISOString() })
    .where(eq(licenses.id, existing.id));

  console.log(`Lisans yenilendi: ${existing.customerName} (${licenseKey})`);
  console.log(`  Yeni gecerlilik: ${expiresAt}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
