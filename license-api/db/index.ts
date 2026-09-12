// ---------------------------------------------------------------------------
// Bu servisin KENDI Turso baglantisi - musteri uygulamasinin db/index.ts'inden
// TAMAMEN AYRI bir veritabanidir (bkz. db/schema.ts basindaki not).
// ---------------------------------------------------------------------------
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// "??" degil "||" - bkz. ana uygulamadaki db/index.ts'teki ayni satirin yorumu.
const url = process.env.LICENSES_DATABASE_URL || "file:licenses.db";
const authToken = process.env.LICENSES_AUTH_TOKEN;

if (!process.env.LICENSES_DATABASE_URL && process.env.VERCEL) {
  // Vercel'de yerel dosyaya sessizce dusmek veri kaybina yol acar - erken uyar
  // (bkz. musteri uygulamasindaki db/index.ts ile ayni mantik).
  console.warn(
    "[license-db] UYARI: LICENSES_DATABASE_URL tanimli degil, Vercel ortaminda yerel dosya kullaniliyor. " +
      "Bu, deploy'lar arasi veri kaybina yol acar - .env dosyasini kontrol edin."
  );
}

const client = createClient(authToken ? { url, authToken } : { url });

export const db = drizzle(client, { schema });
