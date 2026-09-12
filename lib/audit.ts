// ---------------------------------------------------------------------------
// Audit log (Bolum 4 + Bolum 5 Faz2 madde 29): admin panelde (ve bolum
// yoneticisi ekraninda) yapilan her degisiklik icin insan-okunur bir kayit.
// Oturumdaki admin_users kimligini auth()'tan otomatik okur - cagiran action
// fonksiyonlarinin ayrica kullanici id'si tasimasina gerek yok.
// ---------------------------------------------------------------------------
import { auth } from "@/auth";
import { db } from "@/db";
import { auditLog } from "@/db/schema";

/** action: kisa, insan-okunur bir aciklama - orn. "Ahmet Yilmaz icin degerlendirme puani girildi". */
export async function logAudit(action: string): Promise<void> {
  try {
    const session = await auth();
    const adminUserId = session?.user?.id ? Number(session.user.id) : null;
    await db.insert(auditLog).values({ adminUserId, action });
  } catch (err) {
    // Audit kaydi yazilamamasi ana islemi ASLA engellemez (orn. bir silme
    // islemi audit satiri basarisiz oldu diye geri alinmaz) - sadece loglanir.
    console.error("[audit] log yazılamadı:", err);
  }
}
