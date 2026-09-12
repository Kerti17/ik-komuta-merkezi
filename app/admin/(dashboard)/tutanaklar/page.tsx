import { desc } from "drizzle-orm";
import { db } from "@/db";
import { getActiveEmployeeOptions } from "@/lib/employees";
import { Card, Table, Tr, Td, Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { RecordForm } from "./RecordForm";

const TYPE_LABELS: Record<string, string> = {
  sozlu_uyari: "Sözlü Uyarı",
  yazili_uyari: "Yazılı Uyarı",
  devamsizlik_tutanagi: "Devamsızlık Tutanağı",
  diger: "Diğer",
};

export default async function TutanaklarPage() {
  const [employeeOptions, records] = await Promise.all([
    getActiveEmployeeOptions(),
    db.query.disciplinaryRecords.findMany({ with: { employee: true }, orderBy: (r) => [desc(r.recordDate)] }),
  ]);

  return (
    <div>
      <PageHeader title="Tutanak Kayıtları" description="Ayrılma riski analizinde çalışanla ilişkilendirilir." />

      <Card title="Yeni Tutanak Ekle">
        {employeeOptions.length === 0 ? <EmptyState text="Önce Çalışanlar sayfasından aktif çalışan ekleyin." /> : <RecordForm employees={employeeOptions} />}
      </Card>

      <Card title={`Kayıt Listesi (${records.length})`}>
        {records.length === 0 ? (
          <EmptyState text="Henüz tutanak eklenmedi." />
        ) : (
          <Table head={["Çalışan", "Tarih", "Tür", "Açıklama"]}>
            {records.map((r) => (
              <Tr key={r.id}>
                <Td>{r.employee?.fullName ?? "—"}</Td>
                <Td mono>{r.recordDate}</Td>
                <Td>
                  <Badge tone="brick">{TYPE_LABELS[r.type] ?? r.type}</Badge>
                </Td>
                <Td>{r.description ?? "—"}</Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
