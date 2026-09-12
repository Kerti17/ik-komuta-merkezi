import { Card, PageHeader } from "@/components/admin/ui";
import { ImportForm } from "@/components/admin/ImportForm";
import { importEmployeesAction } from "./actions";

export default function ImportEmployeesPage() {
  return (
    <div>
      <PageHeader title="Excel İçe Aktarma — Çalışanlar" description="Departman ve şube adları önceden tanımlı olmalı (Departman & Şube sayfası)." />
      <Card>
        <ImportForm action={importEmployeesAction} templateHref="/admin/excel/calisanlar/template" />
      </Card>
    </div>
  );
}
