// Admin panelden indirilebilir sabit sablon dosyasini uretir (Bolum 6).
import ExcelJS from "exceljs";

export async function buildTemplateWorkbook(headers: string[], exampleRow: (string | number)[]): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Şablon");
  sheet.addRow(headers);
  sheet.getRow(1).font = { bold: true };
  sheet.addRow(exampleRow);
  sheet.columns.forEach((col) => {
    col.width = 26;
  });
  const nodeBuffer = await workbook.xlsx.writeBuffer();
  // Duz (jenerik olmayan) bir ArrayBuffer'a kopyalanir - Node Buffer / generic
  // Uint8Array<T> tipleri NextResponse'un BodyInit tanimiyla TS surumune gore
  // uyusmazlik cikarabiliyor, duz ArrayBuffer her zaman gecerli.
  return new Uint8Array(nodeBuffer).buffer as ArrayBuffer;
}

export const XLSX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
