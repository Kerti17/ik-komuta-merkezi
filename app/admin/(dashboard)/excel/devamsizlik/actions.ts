"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { attendance } from "@/db/schema";
import { readWorkbookRows, parseExcelDate, type RowError } from "@/lib/excel/read";
import { buildEmployeeNameIndex, resolveEmployeeId } from "@/lib/excel/employee-lookup";
import { logAudit } from "@/lib/audit";
import type { ImportState } from "@/components/admin/ImportForm";
import { ATTENDANCE_IMPORT_HEADERS as H } from "./columns";

export async function importAttendanceAction(_prevState: ImportState, formData: FormData): Promise<ImportState> {
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
  const toInsert: (typeof attendance.$inferInsert)[] = [];

  rows.forEach((r, idx) => {
    const row = idx + 2;
    const fullName = r[H[0]]?.trim();
    const dateRaw = r[H[1]]?.trim();
    const type = r[H[2]]?.trim();
    const dayCountRaw = r[H[3]]?.trim();
    const note = r[H[4]]?.trim();

    if (!fullName) return rowErrors.push({ row, message: "Ad Soyad boş." });
    const resolved = resolveEmployeeId(nameIndex, fullName);
    if ("error" in resolved) return rowErrors.push({ row, message: resolved.error });

    const date = dateRaw ? parseExcelDate(dateRaw) : null;
    if (!date) return rowErrors.push({ row, message: "Tarih geçersiz (GG.AA.YYYY bekleniyor)." });
    if (!type) return rowErrors.push({ row, message: "Tür boş." });

    let dayCount = 1;
    if (dayCountRaw) {
      dayCount = Number(dayCountRaw);
      if (Number.isNaN(dayCount) || dayCount <= 0) return rowErrors.push({ row, message: "Gün sayısı pozitif bir sayı olmalı." });
    }

    toInsert.push({ employeeId: resolved.id, date, type, dayCount, note: note || null });
  });

  if (toInsert.length > 0) {
    await db.insert(attendance).values(toInsert);
    await logAudit(`Excel ile ${toInsert.length} devamsızlık kaydı içe aktarıldı (${rowErrors.length} satır hatalı)`);
  }

  revalidatePath("/admin");
  return { result: { inserted: toInsert.length, rowErrors } };
}
