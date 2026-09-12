import { desc } from "drizzle-orm";
import { db } from "@/db";
import { getActiveEmployeeOptions } from "@/lib/employees";
import { Card, Table, Tr, Td, EmptyState, PageHeader } from "@/components/admin/ui";
import { RecognitionForm } from "./RecognitionForm";

export default async function OdulPage() {
  const [employeeOptions, list] = await Promise.all([
    getActiveEmployeeOptions(),
    db.query.recognitions.findMany({ with: { employee: true }, orderBy: (r) => [desc(r.awardDate)] }),
  ]);

  return (
    <div>
      <PageHeader title="Ödül / Takdir Kayıtları" description="Risk analizinde çapraz referans için kullanılır — ödül tek başına bağlılığı garanti etmez." />

      <Card title="Yeni Ödül Ekle">
        {employeeOptions.length === 0 ? <EmptyState text="Önce Çalışanlar sayfasından aktif çalışan ekleyin." /> : <RecognitionForm employees={employeeOptions} />}
      </Card>

      <Card title={`Kayıt Listesi (${list.length})`}>
        {list.length === 0 ? (
          <EmptyState text="Henüz ödül kaydı eklenmedi." />
        ) : (
          <Table head={["Çalışan", "Ödül", "Tarih"]}>
            {list.map((r) => (
              <Tr key={r.id}>
                <Td>{r.employee?.fullName ?? "—"}</Td>
                <Td>{r.awardName}</Td>
                <Td mono>{r.awardDate}</Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
