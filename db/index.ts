// ---------------------------------------------------------------------------
// Supabase (Postgres) veritabani baglantisi.
//
// GECMIS NOT (bkz. hata.md): proje ilk basta Turso/libSQL kullaniyordu; Turso'nun
// Windows'ta CLI kurulumu WSL gerektirdigi icin Supabase'e gecildi.
//
// TEK bir DATABASE_URL ortam degiskeni okunur - Supabase proje ayarlarindaki
// "Connection string" (URI formati) birebir buraya yapistirilir. Serverless
// (Vercel) ortamda Supabase'in "Transaction pooler" (port 6543) baglanti
// dizesinin kullanilmasi ONERILIR - postgres.js istemcisi bu yuzden
// `prepare: false` ile acilir (PgBouncer'in transaction modu prepared
// statement desteklemez; dogrudan baglantida da bu ayar zararsizdir).
//
// Not: SQLite'daki gibi "hesap yoksa yerel dosyaya otomatik dus" davranisi
// Postgres icin YOK - DATABASE_URL her zaman gereklidir (yerel gelistirmede de
// ayni Supabase projesinin baglanti dizesi .env'e konur, bkz. docs/kurulum-rehberi.md).
// ---------------------------------------------------------------------------

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "[db] DATABASE_URL tanimli degil. Supabase proje ayarlarindaki Connection string'i " +
      ".env dosyasina (yerelde) veya Vercel Environment Variables'a (production'da) ekleyin."
  );
}

const client = postgres(url, { prepare: false });

export const db = drizzle(client, { schema });
