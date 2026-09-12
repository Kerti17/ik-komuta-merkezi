import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { employees } from "@/db/schema";

// Tekil olay formlarindaki (degerlendirme, arabuluculuk, ISG vb.) calisan
// secim kutulari icin ortak liste. Sadece aktif calisanlar gosterilir.
export async function getActiveEmployeeOptions() {
  const rows = await db.query.employees.findMany({
    where: eq(employees.status, "aktif"),
    with: { department: true },
    orderBy: (e) => [asc(e.fullName)],
  });
  return rows.map((e) => ({ id: e.id, label: `${e.fullName} — ${e.department?.name ?? "?"}` }));
}

// Cikis mulakati (Bolum 5 Faz2 madde 24) icin - sadece AYRILMIS calisanlar
// secilebilir (mulakat mantiken ayriliktan sonra yapilir).
export async function getTerminatedEmployeeOptions() {
  const rows = await db.query.employees.findMany({
    where: eq(employees.status, "ayrildi"),
    with: { department: true },
    orderBy: (e) => [desc(e.terminationDate)],
  });
  return rows.map((e) => ({ id: e.id, label: `${e.fullName} — ${e.department?.name ?? "?"} (${e.terminationDate ?? "?"})` }));
}
