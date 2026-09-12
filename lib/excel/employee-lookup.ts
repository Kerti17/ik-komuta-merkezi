import { db } from "@/db";
import { employees } from "@/db/schema";

// Devamsizlik/vardiya sablonlarinda calisan "Ad Soyad" ile eslestirilir (bu
// tablolarin FK'si employeeId'dir). BILINEN SINIRLAMA: sistemde ayni isimde
// birden fazla calisan varsa satir hatali sayilir - benzersiz bir "Sicil No"
// alani Faz 2'de eklenebilir.
export async function buildEmployeeNameIndex(): Promise<Map<string, number[]>> {
  const rows = await db.select({ id: employees.id, fullName: employees.fullName }).from(employees);
  const map = new Map<string, number[]>();
  for (const r of rows) {
    const key = r.fullName.trim().toLowerCase();
    const arr = map.get(key) ?? [];
    arr.push(r.id);
    map.set(key, arr);
  }
  return map;
}

export function resolveEmployeeId(index: Map<string, number[]>, fullName: string): { id: number } | { error: string } {
  const ids = index.get(fullName.trim().toLowerCase());
  if (!ids || ids.length === 0) return { error: `"${fullName}" adında bir çalışan bulunamadı.` };
  if (ids.length > 1) return { error: `"${fullName}" adında birden fazla çalışan var, bu satır otomatik eşleştirilemedi.` };
  return { id: ids[0] };
}
