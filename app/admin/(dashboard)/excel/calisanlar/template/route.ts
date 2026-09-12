import { NextResponse } from "next/server";
import { buildTemplateWorkbook, XLSX_CONTENT_TYPE } from "@/lib/excel/write";
import { EMPLOYEE_IMPORT_HEADERS } from "../columns";

export async function GET() {
  const buffer = await buildTemplateWorkbook(EMPLOYEE_IMPORT_HEADERS, [
    "Ahmet Yılmaz",
    "Dokuma",
    "Çorlu Fabrika",
    "Mavi",
    "15.03.2024",
    25000,
    "10.05.1990",
    "Erkek",
    "Hayır",
  ]);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": XLSX_CONTENT_TYPE,
      "Content-Disposition": 'attachment; filename="calisanlar-sablonu.xlsx"',
    },
  });
}
