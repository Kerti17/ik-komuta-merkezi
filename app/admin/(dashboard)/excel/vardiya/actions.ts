"use server";

import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { shiftsOvertime } from "@/db/schema";
import { readWorkbookRows, type RowError } from "@/lib/excel/read";
import { buildEmployeeNameIndex, resolveEmployeeId } from "@/lib/excel/employee-lookup";
import { logAudit } from "@/lib/audit";
import type { ImportState } from "@/components/admin/ImportForm";
import { SHIFTS_IMPORT_HEADERS as H } from "./columns";

const PERIOD_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export async function importShiftsAction(_prevState: ImportState, formData: FormData): Promise<ImportState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Bir dosya seçin." };

  let rows;
  try {
    rows = await readWorkbookRows(await file.arrayBuffer());
  } catch {
    return { error: "Dosya okunamadı. Geçerli bir .xlsx dosyası olduğundan emin olun." };
  }
  if (rows.length === 0) return { error: "Dosyada veri satırı bulunamadı." };

  const nameIndex = await buildEmployeeNameIndex();
  const rowErrors: RowError[] = [];
  const toUpsert: (typeof shiftsOvertime.$inferInsert)[] = [];

  rows.forEach((r, idx) => {
    const row = idx + 2;
    const fullName = r[H[0]]?.trim();
    const period = r[H[1]]?.trim();
    const overtimeRaw = r[H[2]]?.trim();
    const nightRaw = r[H[3]]?.trim();
    const weekendRaw = r[H[4]]?.trim();

    if (!fullName) return rowErrors.push({ row, message: "Ad Soyad boş." });
    const resolved = resolveEmployeeId(nameIndex, fullName);
    if ("error" in resolved) return rowErrors.push({ row, message: resolved.error });

    if (!period || !PERIOD_RE.test(period)) return rowErrors.push({ row, message: "Dönem YYYY-AA formatında olmalı (ör. 2026-07)." });

    const overtimeHours = Number(overtimeRaw);
    if (!overtimeRaw || Number.isNaN(overtimeHours) || overtimeHours < 0) return rowErrors.push({ row, message: "Fazla mesai saati geçerli bir sayı olmalı." });

    const nightShiftCount = nightRaw ? Number(nightRaw) : 0;
    if (nightRaw && Number.isNaN(nightShiftCount)) return rowErrors.push({ row, message: "Gece vardiyası sayısı sayısal olmalı." });

    const weekendOvertimeCount = weekendRaw ? Number(weekendRaw) : 0;
    if (weekendRaw && Number.isNaN(weekendOvertimeCount)) return rowErrors.push({ row, message: "Hafta sonu mesai sayısı sayısal olmalı." });

    toUpsert.push({ employeeId: resolved.id, period, overtimeHours, nightShiftCount, weekendOvertimeCount });
  });

  if (toUpsert.length > 0) {
    // Ayni calisan + donem zaten varsa guncellenir (bkz. db/schema.ts
    // shifts_overtime_employee_period_idx).
    await db
      .insert(shiftsOvertime)
      .values(toUpsert)
      .onConflictDoUpdate({
        target: [shiftsOvertime.employeeId, shiftsOvertime.period],
        set: {
          overtimeHours: sql`excluded.overtime_hours`,
          nightShiftCount: sql`excluded.night_shift_count`,
          weekendOvertimeCount: sql`excluded.weekend_overtime_count`,
        },
      });
    await logAudit(`Excel ile ${toUpsert.length} vardiya/mesai kaydı içe aktarıldı (${rowErrors.length} satır hatalı)`);
  }

  revalidatePath("/admin");
  return { result: { inserted: toUpsert.length, rowErrors } };
}
