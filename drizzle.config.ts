import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Yerel gelistirmede Turso hesabi yoksa drizzle-kit de ayni yerel dosyaya
// (local.db) karsi calisir - bkz. db/index.ts.
// "??" degil "||" - bkz. db/index.ts'teki ayni satirin yorumu.
const url = process.env.TURSO_DATABASE_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

export default defineConfig({
  dialect: "turso",
  schema: "./db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url,
    ...(authToken ? { authToken } : {}),
  },
  verbose: true,
  strict: true,
});
