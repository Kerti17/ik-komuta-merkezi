import { desc } from "drizzle-orm";
import { db } from "@/db";
import { getActiveEmployeeOptions } from "@/lib/employees";
import { Card, Table, Tr, Td, EmptyState, PageHeader } from "@/components/admin/ui";
import { MediationForm } from "./MediationForm";

const fmtTL = (n: number) => n.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export default async function ArabuluculukPage() {
  const [employeeOptions, cases] = await Promise.all([
    getActiveEmployeeOptions(),
    db.query.mediationCases.findMany({ with: { employee: true }, orderBy: (m) => [desc(m.caseDate)] }),
  ]);

  return (
    <div>
      <PageHeader title="Arabuluculuk Dosyaları" description="Dava yerine arabulucuda anlaşılan dosyalar — engellenen olası dava maliyeti hesaplanır." />

      <Card title="Yeni Dosya Ekle">
        {employeeOptions.length === 0 ? <EmptyState text="Önce Çalışanlar sayfasından aktif çalışan ekleyin." /> : <MediationForm employees={employeeOptions} />}
      </Card>

      <Card title={`Dosya Listesi (${cases.length})`}>
        {cases.length === 0 ? (
          <EmptyState text="Henüz arabuluculuk dosyası eklenmedi." />
        ) : (
          <Table head={["Çalışan", "Tarih", "Ödenen", "Tahmini Dava Maliyeti", "Tasarruf"]}>
            {cases.map((c) => (
              <Tr key={c.id}>
                <Td>{c.employee?.fullName ?? "—"}</Td>
                <Td mono>{c.caseDate}</Td>
                <Td mono>{fmtTL(c.paidAmount)}</Td>
                <Td mono>{fmtTL(c.estimatedLawsuitCost)}</Td>
                <Td mono>{fmtTL(c.estimatedLawsuitCost - c.paidAmount)}</Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
