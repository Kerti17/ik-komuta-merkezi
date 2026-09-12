// ---------------------------------------------------------------------------
// Turso (libSQL) veritabani baglantisi.
//
// TURSO_DATABASE_URL/TURSO_AUTH_TOKEN tanimliysa uzak Turso veritabanina baglanir
// (prod - her musteri kendi Turso hesabinda, bkz. talimat Bolum 2). Tanimli
// degilse yerel bir libSQL dosyasina ("local.db") baglanir, boylece Turso hesabi
// olmadan da `npm run dev` ile gelistirme yapilabilir.
// ---------------------------------------------------------------------------

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// "??" degil "||" - .env.example'i kopyalayip Turso alanlarini BOS BIRAKMAK
// (dokumante edilen yerel-gelistirme akisi) TURSO_DATABASE_URL'i "" (bos
// string) yapar, undefined degil - "??" bu durumda fallback'e DUSMEZ.
const url = process.env.TURSO_DATABASE_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!process.env.TURSO_DATABASE_URL && process.env.NODE_ENV === "production") {
  // Prod'da yerel dosyaya sessizce dusmek veri kaybina yol acar (bkz. talimat
  // Bolum 3/12 - Vercel'de ham SQLite dosyasi kalici degildir). Erken uyar.
  console.warn(
    "[db] UYARI: TURSO_DATABASE_URL tanimli degil, production ortaminda yerel dosya kullaniliyor. " +
      "Bu Vercel gibi serverless ortamlarda veri kaybina yol acar - .env dosyasini kontrol edin."
  );
}

const client = createClient(
  authToken ? { url, authToken } : { url }
);

export const db = drizzle(client, { schema });
