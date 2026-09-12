import { NextResponse } from "next/server";
import { buildTemplateWorkbook, XLSX_CONTENT_TYPE } from "@/lib/excel/write";
import { ATTENDANCE_IMPORT_HEADERS } from "../columns";

export async function GET() {
  const buffer = await buildTemplateWorkbook(ATTENDANCE_IMPORT_HEADERS, ["Ahmet Yılmaz", "04.08.2026", "Devamsızlık", 1, "Habersiz"]);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": XLSX_CONTENT_TYPE,
      "Content-Disposition": 'attachment; filename="devamsizlik-sablonu.xlsx"',
    },
  });
}
