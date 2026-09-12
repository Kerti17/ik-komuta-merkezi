import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { getTerminatedEmployeeOptions } from "@/lib/employees";
import { Card, Table, Tr, Td, Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { ExitInterviewForm } from "./ExitInterviewForm";

export default async function CikisMulakatiPage() {
  const [employeeOptions, interviews, terminatedCount] = await Promise.all([
    getTerminatedEmployeeOptions(),
    db.query.exitInterviews.findMany({ with: { employee: { with: { department: true } } }, orderBy: (i) => [desc(i.exitDate)] }),
    db.$count(employees, eq(employees.status, "ayrildi")),
  ]);

  const missingCount = Math.max(0, terminatedCount - new Set(interviews.map((i) => i.employeeId)).size);

  return (
    <div>
      <PageHeader
        title="Çıkış Mülakatı — Kök Neden Analizi"
        description={
          <>
            Bölüm 5 Faz2 madde 24 — kategorize veri toplama. Buradaki kayıtlar Genel Müdür panelinde ("/panel") kök neden analizi olarak
            özetlenir.
            {missingCount > 0 && (
              <>
                {" "}
                <b>{missingCount} ayrılan çalışan için henüz çıkış mülakatı girilmedi.</b>
              </>
            )}
          </>
        }
      />

      <Card title="Yeni Çıkış Mülakatı Kaydı">
        {employeeOptions.length === 0 ? <EmptyState text="Henüz ayrılmış (durumu 'Ayrıldı' olan) çalışan yok." /> : <ExitInterviewForm employees={employeeOptions} />}
      </Card>

      <Card title={`Kayıtlı Mülakatlar (${interviews.length})`}>
        {interviews.length === 0 ? (
          <EmptyState text="Henüz çıkış mülakatı kaydedilmedi." />
        ) : (
          <Table head={["Çalışan", "Departman", "Ayrılış Tarihi", "Kategori", "Notlar"]}>
            {interviews.map((i) => (
              <Tr key={i.id}>
                <Td>{i.employee?.fullName ?? "—"}</Td>
                <Td>{i.employee?.department?.name ?? "—"}</Td>
                <Td mono>{i.exitDate}</Td>
                <Td>
                  <Badge>{i.reasonCategory}</Badge>
                </Td>
                <Td>{i.notes ?? "—"}</Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
