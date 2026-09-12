import { Card, PageHeader } from "@/components/admin/ui";
import { ImportForm } from "@/components/admin/ImportForm";
import { importAttendanceAction } from "./actions";

export default function ImportAttendancePage() {
  return (
    <div>
      <PageHeader
        title="Excel İçe Aktarma — Devamsızlık"
        description="Çalışan eşleştirmesi ad-soyada göre yapılır — aynı isimde birden fazla çalışan varsa o satır hatalı sayılır."
      />
      <Card>
        <ImportForm action={importAttendanceAction} templateHref="/admin/excel/devamsizlik/template" />
      </Card>
    </div>
  );
}
