import { desc } from "drizzle-orm";
import { db } from "@/db";
import { getActiveEmployeeOptions } from "@/lib/employees";
import { Card, Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { CareerRecordForm } from "./CareerRecordForm";
import { deleteCareerRecordAction } from "./actions";

export default async function KariyerPage() {
  const [employeeOptions, list] = await Promise.all([
    getActiveEmployeeOptions(),
    db.query.careerRecords.findMany({
      with: { employee: { columns: { fullName: true } } },
      orderBy: (r) => [desc(r.createdAt)],
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Kariyer Takibi"
        description={
          <>
            Unvan/terfi geçmişi ve gelecek kariyer planları (hedef unvan, hedef tarih, gelişim notu). Kariyer planı olan/terfi bekleyen çalışanlar
            özeti panelde (/panel) görünür.
          </>
        }
      />

      <Card title="Yeni Kayıt Ekle">
        {employeeOptions.length === 0 ? <EmptyState text="Önce Çalışanlar sayfasından aktif çalışan ekleyin." /> : <CareerRecordForm employees={employeeOptions} />}
      </Card>

      <Card title={`Kayıt Listesi (${list.length})`}>
        {list.length === 0 ? (
          <EmptyState text="Henüz kariyer kaydı eklenmedi." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {list.map((r) => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, border: "1px solid var(--line)", borderRadius: 6, padding: "12px 14px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5 }}>{r.employee?.fullName ?? "—"}</span>
                    <Badge tone={r.recordType === "plan" ? "thread" : "default"}>{r.recordType === "plan" ? "Kariyer Planı" : "Unvan/Terfi"}</Badge>
                  </div>
                  {r.recordType === "gecmis" ? (
                    <div style={{ fontSize: 12.5, color: "#374151" }}>
                      <b>{r.title}</b> — <span className="mono">{r.effectiveDate}</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12.5, color: "#374151" }}>
                      Hedef: <b>{r.targetTitle}</b> — <span className="mono">{r.targetDate}</span>
                      {r.developmentNote && <div style={{ marginTop: 4, color: "#6b7280", whiteSpace: "pre-wrap" }}>{r.developmentNote}</div>}
                    </div>
                  )}
                </div>
                <form action={deleteCareerRecordAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <DeleteButton confirmText="Bu kariyer kaydını silmek istediğinize emin misiniz?" />
                </form>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
