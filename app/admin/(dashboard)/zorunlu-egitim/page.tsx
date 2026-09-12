import { asc } from "drizzle-orm";
import { db } from "@/db";
import { getActiveEmployeeOptions } from "@/lib/employees";
import { Card, Table, Tr, Td, Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { TrainingForm } from "./TrainingForm";

export default async function ZorunluEgitimPage() {
  const [employeeOptions, trainings] = await Promise.all([
    getActiveEmployeeOptions(),
    db.query.mandatoryTrainings.findMany({ with: { employee: true }, orderBy: (t) => [asc(t.dueDate)] }),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const soonCutoff = new Date();
  soonCutoff.setDate(soonCutoff.getDate() + 14);
  const soonCutoffStr = soonCutoff.toISOString().slice(0, 10);

  return (
    <div>
      <PageHeader
        title="Zorunlu Eğitim Takibi"
        description="İSG, yangın, ilkyardım gibi periyodik zorunlu eğitimler — ISG tarama takibiyle aynı mantık, farklı tür alanı."
      />

      <Card title="Yeni Eğitim Kaydı Ekle">
        {employeeOptions.length === 0 ? <EmptyState text="Önce Çalışanlar sayfasından aktif çalışan ekleyin." /> : <TrainingForm employees={employeeOptions} />}
      </Card>

      <Card title={`Eğitim Listesi (${trainings.length})`}>
        {trainings.length === 0 ? (
          <EmptyState text="Henüz eğitim kaydı eklenmedi." />
        ) : (
          <Table head={["Çalışan", "Tür", "Son Tamamlanma", "Son Tarih", "Durum"]}>
            {trainings.map((t) => (
              <Tr key={t.id}>
                <Td>{t.employee?.fullName ?? "—"}</Td>
                <Td>{t.trainingType}</Td>
                <Td mono>{t.lastCompletedDate ?? "—"}</Td>
                <Td mono>{t.dueDate}</Td>
                <Td>
                  {t.dueDate < today ? <Badge tone="brick">Süre Geçti</Badge> : t.dueDate <= soonCutoffStr ? <Badge tone="thread">Yaklaşıyor</Badge> : <Badge tone="pine">Normal</Badge>}
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
