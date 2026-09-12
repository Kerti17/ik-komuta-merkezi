import { asc } from "drizzle-orm";
import { db } from "@/db";
import { getActiveEmployeeOptions } from "@/lib/employees";
import { Card, Table, Tr, Td, Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { ScreeningForm } from "./ScreeningForm";

export default async function IsgPage() {
  const [employeeOptions, screenings] = await Promise.all([
    getActiveEmployeeOptions(),
    db.query.healthScreenings.findMany({ with: { employee: true }, orderBy: (h) => [asc(h.dueDate)] }),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const soonCutoff = new Date();
  soonCutoff.setDate(soonCutoff.getDate() + 14);
  const soonCutoffStr = soonCutoff.toISOString().slice(0, 10);

  return (
    <div>
      <PageHeader title="Periyodik ISG Tarama Takibi" description="Akciğer grafisi, odyometri, solunum testi gibi zorunlu kontroller." />

      <Card title="Yeni Tarama Ekle">
        {employeeOptions.length === 0 ? <EmptyState text="Önce Çalışanlar sayfasından aktif çalışan ekleyin." /> : <ScreeningForm employees={employeeOptions} />}
      </Card>

      <Card title={`Tarama Listesi (${screenings.length})`}>
        {screenings.length === 0 ? (
          <EmptyState text="Henüz tarama eklenmedi." />
        ) : (
          <Table head={["Çalışan", "Tür", "Son Tarama", "Son Tarih", "Durum"]}>
            {screenings.map((s) => (
              <Tr key={s.id}>
                <Td>{s.employee?.fullName ?? "—"}</Td>
                <Td>{s.screeningType}</Td>
                <Td mono>{s.lastScreeningDate ?? "—"}</Td>
                <Td mono>{s.dueDate}</Td>
                <Td>
                  {s.dueDate < today ? <Badge tone="brick">Süre Geçti</Badge> : s.dueDate <= soonCutoffStr ? <Badge tone="thread">Yaklaşıyor</Badge> : <Badge tone="pine">Normal</Badge>}
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
