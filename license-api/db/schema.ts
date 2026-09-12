// ---------------------------------------------------------------------------
// Lisans dogrulama alt sisteminin KENDI semasi (bkz. claude-code-talimati.md
// Bolum 7). Bu, musteri uygulamasinin db/schema.ts'inden TAMAMEN AYRI ve
// KUCUK bir semadir - kurucunun kendi Turso hesabinda barinir, TUM musteriler
// icin ortaktir. Musteri verisini (calisan, departman vb.) ASLA tutmaz -
// sadece hangi lisans anahtarinin ne zamana kadar gecerli oldugunu bilir.
// ---------------------------------------------------------------------------
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

export const licenses = sqliteTable(
  "licenses",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    licenseKey: text("license_key").notNull(),
    // Kurucunun kendi takibi icin (hangi musteri, hangi anahtar) - musteri
    // uygulamasina asla gitmez, sadece bu servisin kendi tarafinda tutulur.
    customerName: text("customer_name").notNull(),
    // "iptal": kurucu odeme yapilmadigi/sozlesme bittigi icin elle iptal eder.
    // "suresi_doldu" ayri bir DB durumu DEGIL - /api/verify her cagrida
    // expiresAt'i "su an"la kiyaslayarak dinamik hesaplar (cron'a gerek yok).
    status: text("status", { enum: ["aktif", "iptal"] }).notNull().default("aktif"),
    activatedAt: text("activated_at").notNull(),
    expiresAt: text("expires_at").notNull(), // ISO yyyy-mm-dd
    notes: text("notes"),
    createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
    updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
  },
  (t) => [uniqueIndex("licenses_key_idx").on(t.licenseKey)]
);
