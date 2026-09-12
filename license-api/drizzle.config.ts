import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// "??" degil "||" - bkz. db/index.ts'teki ayni satirin yorumu.
const url = process.env.LICENSES_DATABASE_URL || "file:licenses.db";
const authToken = process.env.LICENSES_AUTH_TOKEN;

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
