import { Card, PageHeader } from "@/components/admin/ui";
import { ImportForm } from "@/components/admin/ImportForm";
import { importShiftsAction } from "./actions";

export default function ImportShiftsPage() {
  return (
    <div>
      <PageHeader
        title="Excel İçe Aktarma — Vardiya & Mesai"
        description="Aynı çalışan + dönem tekrar yüklenirse mevcut kayıt güncellenir (üzerine yazılır)."
      />
      <Card>
        <ImportForm action={importShiftsAction} templateHref="/admin/excel/vardiya/template" />
      </Card>
    </div>
  );
}
