// ---------------------------------------------------------------------------
// Ilk admin kullanicisini olusturur (kurulum sirasinda bir kez calistirilir).
// Kaynak: talimat Kurulum Rehberi PDF'i akisinin bir parcasi (Bolum 11).
//
// Kullanim:
//   $env:SEED_ADMIN_EMAIL="ik@sirket.com"; $env:SEED_ADMIN_PASSWORD="..."; npm run db:seed-admin
// veya .env dosyasina SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_NAME ekleyip calistirin.
// Ayni e-posta zaten varsa sifre gucellenir (yeniden calistirmak guvenlidir).
// ---------------------------------------------------------------------------
import "dotenv/config";
import { eq } from "drizzle-orm";

import { db } from "../db";
import { adminUsers } from "../db/schema";
import { hashPassword } from "../lib/password";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || "IK Admin";

  if (!email || !password) {
    console.error(
      "SEED_ADMIN_EMAIL ve SEED_ADMIN_PASSWORD ortam degiskenleri gerekli.\n" +
        'Ornek: $env:SEED_ADMIN_EMAIL="ik@sirket.com"; $env:SEED_ADMIN_PASSWORD="GucluBirSifre123!"; npm run db:seed-admin'
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("SEED_ADMIN_PASSWORD en az 8 karakter olmali.");
    process.exit(1);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const passwordHash = await hashPassword(password);

  const [existing] = await db.select().from(adminUsers).where(eq(adminUsers.email, normalizedEmail)).limit(1);

  if (existing) {
    await db
      .update(adminUsers)
      .set({ passwordHash, fullName: name, updatedAt: new Date().toISOString() })
      .where(eq(adminUsers.id, existing.id));
    console.log(`Mevcut admin guncellendi: ${normalizedEmail}`);
  } else {
    await db.insert(adminUsers).values({
      email: normalizedEmail,
      passwordHash,
      fullName: name,
      role: "ik_admin",
    });
    console.log(`Yeni admin olusturuldu: ${normalizedEmail}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
