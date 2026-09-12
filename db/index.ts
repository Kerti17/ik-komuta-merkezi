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
//
// vercellog.md: production'da Vercel Runtime Timeout (300s) hatasi alindi -
// DB'ye dokunan her istek sonsuza kadar asili kaliyordu. Bilinen kok neden:
// Node.js bazi serverless ortamlarda DNS cozumlemesinde IPv6 adresini once
// deniyor, Vercel'den Supabase'in pooler'ina IPv6 rotasi olmayabiliyor ve
// baglanti hicbir hata vermeden asili kalip 300s sonra Vercel tarafindan
// zorla kesiliyor (Supabase+Vercel+postgres.js icin dokumante edilmis bilinen
// sorun). Fix: DNS cozumlemesinde IPv4'u onceliklendir - client olusturulmadan
// ONCE, bu dosyanin en basinda calismali.
// ---------------------------------------------------------------------------

import dns from "node:dns";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

dns.setDefaultResultOrder("ipv4first");

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "[db] DATABASE_URL tanimli degil. Supabase proje ayarlarindaki Connection string'i " +
      ".env dosyasina (yerelde) veya Vercel Environment Variables'a (production'da) ekleyin."
  );
}

// max: 1 / idle_timeout - IPv4 fix'ten sonra hala ARALIKLI (bazen hizli, bazen
// asili kalan) istekler gozlendi - klasik "serverless + harici pooler" sorunu:
// postgres.js varsayilan olarak HER istemci ornegi (=HER Vercel fonksiyon
// invocation'i) icin kendi basina 10'a kadar baglanti acmaya calisiyor, ama
// Supabase'in Transaction pooler'i (Supavisor/PgBouncer) zaten kendi
// havuzunu tutuyor - cok sayida cakisan fonksiyon cagrisi bu ikinci-katman
// havuzu doldurup yeni baglantilari (hatasiz) beklemeye/asili kalmaya
// zorluyor. Fix: her istemci ornegi TEK baglanti tutsun (harici pooler zaten
// coklu istemciyi yonetiyor), bosta kalan baglanti hizlica serbest biraksin.
// connect_timeout: baglanti kurma asamasi 10s'de acik hatayla kessin (bu,
// pooler'in kuyrukta bekletmesini KAPSAMAZ - ust paragraftaki asil fix odur).
const client = postgres(url, { prepare: false, connect_timeout: 10, max: 1, idle_timeout: 20 });

export const db = drizzle(client, { schema });
