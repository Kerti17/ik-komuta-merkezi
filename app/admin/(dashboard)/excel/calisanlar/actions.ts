"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { employees, departments, branches } from "@/db/schema";
import { readWorkbookRows, parseExcelDate, type RowError } from "@/lib/excel/read";
import { logAudit } from "@/lib/audit";
import type { ImportState } from "@/components/admin/ImportForm";
import { EMPLOYEE_IMPORT_HEADERS as H } from "./columns";

const COLLAR_VALUES = new Set(["mavi", "beyaz"]);
const GENDER_MAP: Record<string, "kadin" | "erkek"> = { kadın: "kadin", kadin: "kadin", erkek: "erkek" };
const RETIRED_TRUE_VALUES = new Set(["evet", "e", "true", "1"]);

export async function importEmployeesAction(_prevState: ImportState, formData: FormData): Promise<ImportState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Bir dosya seçin." };

  let rows;
  try {
    rows = await readWorkbookRows(await file.arrayBuffer());
  } catch {
    return { error: "Dosya okunamadı. Geçerli bir .xlsx dosyası olduğundan emin olun." };
  }
  if (rows.length === 0) return { error: "Dosyada veri satırı bulunamadı." };

  const [depList, branchList] = await Promise.all([db.select().from(departments), db.select().from(branches)]);
  const depMap = new Map(depList.map((d) => [d.name.toLowerCase(), d.id]));
  const branchMap = new Map(branchList.map((b) => [b.name.toLowerCase(), b.id]));

  const rowErrors: RowError[] = [];
  const toInsert: (typeof employees.$inferInsert)[] = [];

  rows.forEach((r, idx) => {
    const row = idx + 2; // 1-indeksli + baslik satiri
    const fullName = r[H[0]]?.trim();
    const depName = r[H[1]]?.trim();
    const branchName = r[H[2]]?.trim();
    const collarRaw = r[H[3]]?.trim().toLowerCase();
    const hireDateRaw = r[H[4]]?.trim();
    const salaryRaw = r[H[5]]?.trim();
    const birthDateRaw = r[H[6]]?.trim();
    const genderRaw = r[H[7]]?.trim().toLowerCase();
    const retiredRaw = r[H[8]]?.trim().toLowerCase();

    if (!fullName) return rowErrors.push({ row, message: "Ad Soyad boş." });
    if (!depName || !depMap.has(depName.toLowerCase())) {
      return rowErrors.push({ row, message: `Departman "${depName || "-"}" tanımlı değil (önce Departman & Şube sayfasından ekleyin).` });
    }
    if (!branchName || !branchMap.has(branchName.toLowerCase())) {
      return rowErrors.push({ row, message: `Şube "${branchName || "-"}" tanımlı değil (önce Departman & Şube sayfasından ekleyin).` });
    }
    if (!collarRaw || !COLLAR_VALUES.has(collarRaw)) {
      return rowErrors.push({ row, message: 'Yaka tipi "Mavi" veya "Beyaz" olmalı.' });
    }
    const hireDate = hireDateRaw ? parseExcelDate(hireDateRaw) : null;
    if (!hireDate) return rowErrors.push({ row, message: "İşe giriş tarihi geçersiz (GG.AA.YYYY bekleniyor)." });

    let monthlySalary: number | null = null;
    if (salaryRaw) {
      monthlySalary = Number(salaryRaw);
      if (Number.isNaN(monthlySalary)) return rowErrors.push({ row, message: "Aylık maaş sayısal olmalı." });
    }

    // Bolum 5 Faz1.5 madde 22 - ucu SGK tesvik uygunlugu icin (madde 20), ikisi de opsiyonel.
    const birthDate = birthDateRaw ? parseExcelDate(birthDateRaw) : null;
    if (birthDateRaw && !birthDate) return rowErrors.push({ row, message: "Doğum tarihi geçersiz (GG.AA.YYYY bekleniyor)." });

    let gender: "kadin" | "erkek" | null = null;
    if (genderRaw) {
      gender = GENDER_MAP[genderRaw] ?? null;
      if (!gender) return rowErrors.push({ row, message: 'Cinsiyet "Kadın" veya "Erkek" olmalı (boş da bırakılabilir).' });
    }

    const isRetired = retiredRaw ? RETIRED_TRUE_VALUES.has(retiredRaw) : false;

    toInsert.push({
      fullName,
      departmentId: depMap.get(depName.toLowerCase())!,
      branchId: branchMap.get(branchName.toLowerCase())!,
      collarType: collarRaw as "mavi" | "beyaz",
      hireDate,
      monthlySalary,
      birthDate,
      gender,
      isRetired,
      status: "aktif",
    });
  });

  if (toInsert.length > 0) {
    await db.insert(employees).values(toInsert);
    await logAudit(`Excel ile ${toInsert.length} çalışan içe aktarıldı (${rowErrors.length} satır hatalı)`);
  }

  revalidatePath("/admin/calisanlar");
  revalidatePath("/admin");
  return { result: { inserted: toInsert.length, rowErrors } };
}
