import { NextResponse } from "next/server";
import { buildTemplateWorkbook, XLSX_CONTENT_TYPE } from "@/lib/excel/write";
import { SHIFTS_IMPORT_HEADERS } from "../columns";

export async function GET() {
  const buffer = await buildTemplateWorkbook(SHIFTS_IMPORT_HEADERS, ["Ahmet Yılmaz", "2026-07", 26, 4, 2]);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": XLSX_CONTENT_TYPE,
      "Content-Disposition": 'attachment; filename="vardiya-mesai-sablonu.xlsx"',
    },
  });
}
