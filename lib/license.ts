// ---------------------------------------------------------------------------
// Lisans dogrulama alt sistemi - musteri uygulamasi tarafi (bkz. talimat
// Bolum 7). Merkezi dogrulama API'si AYRI bir kucuk servistir (bkz.
// license-api/ klasoru, kurucunun kendi hesabinda barinir) - bu dosya SADECE
// o servise "bu anahtar gecerli mi" diye sorar ve sonucu yerel `license`
// tablosunda (tek satirlik, id=1) onbelleğe alir.
//
// Tasarim kararlari (VARSAYIM, talimatta detaylandirilmamis):
//   - Lisans anahtari ENV DEGISKENINDEN (`LICENSE_KEY`) okunur, admin panelden
//     GIRILMEZ - .env.example'da zaten bu alan ayrilmisti (Turso/AUTH_SECRET
//     gibi kurulum-zamani degerlerle ayni pattern).
//   - Gating karari agdan BAGIMSIZ, sadece yerel onbellekten (status +
//     expiresAt) hesaplanir - "erisimi kilitle" karari her istekte merkezi
//     API'ye bagimli olursa, o kucuk/ucretsiz katmandaki API'nin gecici bir
//     kesintisi TUM musterileri kilitler, bu kabul edilemez. Onbellek
//     LICENSE_CHECK_INTERVAL_MS'ten eskiyse arka planda tazelenir; tazeleme
//     agsal olarak basarisiz olursa mevcut onbellek DEGISMEDEN kalir (grace
//     period), sert kilit sadece: (a) hic yapilandirilmamis, (b) merkezi
//     API'nin ACIKCA "gecersiz/suresi_doldu" dedigi, ya da (c) yerel
//     expiresAt tarihinin gecmis oldugu durumlarda devreye girer.
//   - Yerel gelistirmede (`NODE_ENV !== "production"`) LICENSE_KEY veya
//     LICENSE_API_URL tanimli degilse kilitlemeden gecilir (db/index.ts'teki
//     eski local.db fallback'iyle ayni ruhta - gelistirme akisini bloklamaz).
//
// PILOT TEST BYPASS (bkz. lisans.md, kullanici talebi): henuz gercek bir
// musteri yok, license-api servisi kurulmadan pilot testi acmak icin
// DISABLE_LICENSE_CHECK=true ortam degiskeni TUM lisans kontrolunu (DB
// sorgusu dahil) atlar. Gercek dogrulama mantigi (yukaridaki grace period,
// stale-check vb.) SILINMEDI - bu sadece onun onune gecen, sadece pilot test
// ortaminda set edilecek ayri bir anahtar. Gercek musteri kurulumlarinda bu
// degisken hic tanimlanmamali (docs/kurulum-rehberi.md'de gecmiyor - bilerek).
// ---------------------------------------------------------------------------

import { eq, type InferSelectModel } from "drizzle-orm";
import { db } from "@/db";
import { license } from "@/db/schema";

type LicenseRow = InferSelectModel<typeof license>;

const LICENSE_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 saat - VARSAYIM

export type LicenseGateReason = "not_configured" | "expired" | "invalid";
export type LicenseGateDecision = { locked: boolean; reason: LicenseGateReason | null; license: LicenseRow | null };

type VerifyResponse = { valid: boolean; status: "aktif" | "suresi_doldu" | "gecersiz"; expiresAt: string | null };

async function verifyWithCentralApi(apiUrl: string, licenseKey: string): Promise<VerifyResponse> {
  const res = await fetch(`${apiUrl.replace(/\/$/, "")}/api/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ licenseKey }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Lisans API'si ${res.status} dondurdu`);
  const data = (await res.json()) as Partial<VerifyResponse>;
  if (typeof data.valid !== "boolean" || !data.status) throw new Error("Lisans API'sinden beklenmeyen yanit");
  return { valid: data.valid, status: data.status, expiresAt: data.expiresAt ?? null };
}

function computeGate(row: LicenseRow | null, todayIso: string): LicenseGateDecision {
  if (!row) return { locked: true, reason: "not_configured", license: null };
  if (row.status === "gecersiz") return { locked: true, reason: "invalid", license: row };
  if (row.expiresAt && row.expiresAt < todayIso) return { locked: true, reason: "expired", license: row };
  return { locked: false, reason: null, license: row };
}

// Panel/admin layout'larindan cagrilir: gerekirse merkezi API'ye karsi
// tazeler, ardindan onbellekten kilit kararini dondurur. `force: true` admin
// "Şimdi Kontrol Et" butonu icin - staleness'i yok sayip her zaman tazeler.
export async function getLicenseGate(options?: { force?: boolean }): Promise<LicenseGateDecision> {
  if (process.env.DISABLE_LICENSE_CHECK === "true") {
    return { locked: false, reason: null, license: null };
  }

  const envKey = process.env.LICENSE_KEY?.trim();
  const apiUrl = process.env.LICENSE_API_URL?.trim();
  const isDev = process.env.NODE_ENV !== "production";
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);

  if (!envKey) {
    if (isDev) return { locked: false, reason: null, license: null };
    return { locked: true, reason: "not_configured", license: null };
  }

  const [row] = await db.select().from(license).limit(1);

  const stale =
    options?.force ||
    !row ||
    row.licenseKey !== envKey ||
    !row.lastCheckedAt ||
    now.getTime() - new Date(row.lastCheckedAt).getTime() > LICENSE_CHECK_INTERVAL_MS;

  if (!stale) return computeGate(row, todayIso);

  if (!apiUrl) {
    // Anahtar var ama dogrulanacak merkezi API adresi yok.
    if (isDev) return computeGate(row, todayIso); // onbellek varsa onu kullan, yoksa dev'de gec
    return { locked: true, reason: "not_configured", license: row ?? null };
  }

  try {
    const result = await verifyWithCentralApi(apiUrl, envKey);
    const values = {
      licenseKey: envKey,
      status: result.status,
      expiresAt: result.expiresAt,
      activatedAt: row?.activatedAt ?? todayIso,
      lastCheckedAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    let updated: LicenseRow;
    if (row) {
      [updated] = await db.update(license).set(values).where(eq(license.id, row.id)).returning();
    } else {
      [updated] = await db.insert(license).values(values).returning();
    }
    return computeGate(updated, todayIso);
  } catch (err) {
    console.warn("[license] Merkezi lisans API'sine ulaşılamadı, önbellekteki durum kullanılıyor:", err);
    return computeGate(row, todayIso); // grace period - agsal hata yuzunden kimseyi kilitleme
  }
}
