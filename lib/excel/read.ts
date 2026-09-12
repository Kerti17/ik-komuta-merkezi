// Yuklenen .xlsx dosyalarini basligi -> deger eslesmesi seklinde satir
// dizisine cevirir. Bolum 6: "yuklenen dosyayi sablona gore parse edip
// veritabanina yaz, hatali satirlari kullaniciya goster."
import ExcelJS from "exceljs";

export async function readWorkbookRows(buffer: ArrayBuffer): Promise<Record<string, string>[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const headers: string[] = [];
  sheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber] = String(cell.value ?? "").trim();
  });

  const rows: Record<string, string>[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // baslik satiri
    const obj: Record<string, string> = {};
    let hasValue = false;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber];
      if (!header) return;
      let value = cell.value as unknown;
      if (value && typeof value === "object" && "text" in (value as Record<string, unknown>)) {
        value = (value as { text: unknown }).text; // zengin metin hucreleri
      }
      const str = value instanceof Date ? value.toISOString().slice(0, 10) : value === null || value === undefined ? "" : String(value).trim();
      obj[header] = str;
      if (str) hasValue = true;
    });
    if (hasValue) rows.push(obj);
  });
  return rows;
}

// "GG.AA.YYYY" veya "YYYY-AA-GG" formatlarini kabul eder, ISO (YYYY-AA-GG)
// dondurur. Gecersizse null.
export function parseExcelDate(raw: string): string | null {
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) {
    const [, d, mo, y] = m;
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

export type RowError = { row: number; message: string };
