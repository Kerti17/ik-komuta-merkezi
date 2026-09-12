// ---------------------------------------------------------------------------
// POST /api/verify - musteri uygulamalarinin (bkz. ../lib/license.ts) lisans
// anahtari dogrulamak icin cagirdigi TEK uctan nokta. Vercel Edge Function
// (bkz. claude-code-talimati.md Bolum 7: "Vercel Edge Function + kucuk bir
// Turso tablosu"). Girdi olarak sadece licenseKey alir - ek bir gizli/API
// anahtarina gerek yok, licenseKey'in kendisi zaten musteriye ozel bir sirdir
// ve musteri uygulamasindan sunucu-sunucu cagrilir (tarayicidan degil).
//
// Yanit sozlesmesi musteri tarafindaki `license` tablosunun status enum'uyla
// BIREBIR ayni ("aktif" | "suresi_doldu" | "gecersiz") - musteri tarafi
// ceviri yapmadan direkt onbelleğe yazabilsin diye.
// ---------------------------------------------------------------------------
import { eq } from "drizzle-orm";
import { db } from "../db";
import { licenses } from "../db/schema";

export const config = { runtime: "edge" };

type VerifyBody = { licenseKey?: unknown };
type Status = "aktif" | "suresi_doldu" | "gecersiz";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  let body: VerifyBody;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400);
  }

  const licenseKey = body.licenseKey;
  if (typeof licenseKey !== "string" || !licenseKey.trim()) {
    return jsonResponse({ error: "license_key_required" }, 400);
  }

  const [row] = await db.select().from(licenses).where(eq(licenses.licenseKey, licenseKey.trim())).limit(1);

  if (!row) {
    const notFound: Status = "gecersiz";
    return jsonResponse({ valid: false, status: notFound, expiresAt: null });
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  let status: Status;
  if (row.status === "iptal") status = "gecersiz";
  else if (row.expiresAt < todayIso) status = "suresi_doldu";
  else status = "aktif";

  return jsonResponse({ valid: status === "aktif", status, expiresAt: row.expiresAt });
}
