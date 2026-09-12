// /panel icin basit, paylasilan sifre oturumu (VARSAYIM - kullanici talebiyle
// eklendi). admin_users'daki gibi kisisel hesaplar degil: tek bir sifre,
// dogru girildiginde imzali bir cerez verilir. Kimlik dogrulama degil, tek bir
// "erisim izni var" onayi - bkz. proxy.ts.
import { SignJWT, jwtVerify } from "jose";

export const PANEL_COOKIE_NAME = "panel_session";
export const PANEL_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 gun

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET tanımlı değil - .env dosyasını kontrol edin.");
    }
    console.warn("[panel-session] AUTH_SECRET tanımlı değil, sadece yerel geliştirme için sabit bir değer kullanılıyor.");
    return new TextEncoder().encode("dev-only-insecure-secret-do-not-use-in-prod");
  }
  return new TextEncoder().encode(secret);
}

export async function createPanelSessionToken(): Promise<string> {
  return new SignJWT({ purpose: "panel-access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${PANEL_SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function verifyPanelSessionToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.purpose === "panel-access";
  } catch {
    return false;
  }
}
