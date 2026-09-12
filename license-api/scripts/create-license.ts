// ---------------------------------------------------------------------------
// Yeni bir musteri icin lisans anahtari uretir (bkz. talimat Bolum 11: sabit
// 29.900 TL/yil, tum musteriler icin tek paket -> varsayilan sure 365 gun).
//
// Kullanim:
//   npm run license:create -- "Anadolu Tekstil A.S." 365
// (sure argumani opsiyonel, verilmezse 365 gun kullanilir)
// ---------------------------------------------------------------------------
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { db } from "../db";
import { licenses } from "../db/schema";

function generateLicenseKey(): string {
  const groups = Array.from({ length: 4 }, () => randomBytes(2).toString("hex").toUpperCase());
  return `IKKM-${groups.join("-")}`;
}

async function main() {
  const [customerName, daysArg] = process.argv.slice(2);
  if (!customerName) {
    console.error('Kullanim: npm run license:create -- "Musteri Adi" [gun_sayisi=365]');
    process.exit(1);
  }
  const days = daysArg ? Number(daysArg) : 365;
  if (!Number.isFinite(days) || days <= 0) {
    console.error("gun_sayisi pozitif bir sayi olmali.");
    process.exit(1);
  }

  const licenseKey = generateLicenseKey();
  const today = new Date();
  const activatedAt = today.toISOString().slice(0, 10);
  const expires = new Date(today);
  expires.setUTCDate(expires.getUTCDate() + days);
  const expiresAt = expires.toISOString().slice(0, 10);

  await db.insert(licenses).values({ licenseKey, customerName, status: "aktif", activatedAt, expiresAt });

  console.log(`Lisans olusturuldu: ${customerName}`);
  console.log(`  Anahtar     : ${licenseKey}`);
  console.log(`  Aktivasyon  : ${activatedAt}`);
  console.log(`  Gecerlilik  : ${expiresAt} (${days} gun)`);
  console.log(`\nBu anahtari musterinin .env dosyasina LICENSE_KEY olarak yazin.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
