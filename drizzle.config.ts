import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// "db:generate" bir DB baglantisi gerektirmez (sadece schema.ts'ten SQL uretir),
// bu yuzden DATABASE_URL henuz ayarlanmamissa da calisabilmesi icin bir
// placeholder degere dusulur - "db:migrate"/"db:push"/"db:studio" icin gercek
// bir DATABASE_URL (Supabase Connection string) sarttir.
const url = process.env.DATABASE_URL || "postgres://placeholder:placeholder@localhost:5432/placeholder";

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
  verbose: true,
  strict: true,
});
