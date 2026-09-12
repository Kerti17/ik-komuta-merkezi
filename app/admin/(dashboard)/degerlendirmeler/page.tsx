import { db } from "@/db";
import { getActiveEmployeeOptions } from "@/lib/employees";
import { Card, Table, EmptyState, PageHeader } from "@/components/admin/ui";
import { CreateEvaluationForm } from "./CreateEvaluationForm";
import { EvaluationRow } from "./EvaluationRow";

const STATUS_RANK: Record<string, number> = { gecikti: 0, acil: 1, bekliyor: 2, devam: 3, sonlandirildi: 4 };

export default async function DegerlendirmelerPage() {
  const [employeeOptions, evaluationList] = await Promise.all([
    getActiveEmployeeOptions(),
    db.query.evaluations.findMany({ with: { employee: { with: { department: true } } } }),
  ]);

  const sorted = [...evaluationList].sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || a.dueDate.localeCompare(b.dueDate));

  return (
    <div>
      <PageHeader
        title="Performans Değerlendirmeleri"
        description={
          <>
            İşe giriş sürecindeki (deneme/6 ay/1 yıl — kıdem tazminatı hakkı 1. yılda doğar, karar bu tarihten önce netleşmeli) değerlendirmelerin
            yanı sıra, tüm kadro için periyodik (yıllık/6 aylık) değerlendirmeler de buradan planlanır.
          </>
        }
      />

      <Card title="Yeni Değerlendirme Planla">
        {employeeOptions.length === 0 ? (
          <EmptyState text="Önce Çalışanlar sayfasından aktif çalışan ekleyin." />
        ) : (
          <CreateEvaluationForm employees={employeeOptions} />
        )}
      </Card>

      <Card title={`Değerlendirme Listesi (${sorted.length})`} description="Durum ve puanları doğrudan tablodan güncelleyebilirsiniz.">
        {sorted.length === 0 ? (
          <EmptyState text="Henüz değerlendirme planlanmadı." />
        ) : (
          <Table head={["Çalışan", "Aşama", "Son Tarih", "Durum / Puanlar"]}>
            {sorted.map((ev) => (
              <EvaluationRow key={ev.id} evaluation={ev} />
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
