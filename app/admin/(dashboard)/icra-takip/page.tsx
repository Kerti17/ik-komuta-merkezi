import { desc } from "drizzle-orm";
import { db } from "@/db";
import { getActiveEmployeeOptions } from "@/lib/employees";
import { computeGarnishmentBalance } from "@/lib/garnishments";
import { Card, Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { GarnishmentForm } from "./GarnishmentForm";
import { DeductionForm } from "./DeductionForm";
import { deleteGarnishmentAction } from "./actions";

const fmtTL = (n: number) => n.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 });

export default async function IcraTakipPage() {
  const [employeeOptions, list] = await Promise.all([
    getActiveEmployeeOptions(),
    db.query.garnishments.findMany({
      with: { employee: { columns: { fullName: true } } },
      orderBy: (g) => [desc(g.createdAt)],
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="İcra Takip"
        description={
          <>
            Kalan bakiye ve durum, toplam borç ile kesilen toplam tutar üzerinden <b>otomatik</b> hesaplanır — elle işaretlenmez. Aktif icra dosyası
            olan çalışanlar panelde (/panel) de görünür.
          </>
        }
      />

      <Card title="Yeni İcra Dosyası Ekle">
        {employeeOptions.length === 0 ? <EmptyState text="Önce Çalışanlar sayfasından aktif çalışan ekleyin." /> : <GarnishmentForm employees={employeeOptions} />}
      </Card>

      <Card title={`Dosya Listesi (${list.length})`}>
        {list.length === 0 ? (
          <EmptyState text="Henüz icra dosyası eklenmedi." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {list.map((g) => {
              const { remainingBalance, status } = computeGarnishmentBalance(g.totalDebt, g.deductedAmount);
              return (
                <div key={g.id} style={{ border: "1px solid var(--line)", borderRadius: 6, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{g.employee?.fullName ?? "—"}</span>
                        <Badge tone={status === "tamamlandi" ? "pine" : "thread"}>{status === "tamamlandi" ? "Tamamlandı" : "Devam Ediyor"}</Badge>
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>
                        {g.enforcementOffice} · Dosya No: {g.caseNumber}
                      </div>
                      <div className="mono" style={{ fontSize: 12, marginTop: 6 }}>
                        Toplam Borç: {fmtTL(g.totalDebt)} · Kesilen: {fmtTL(g.deductedAmount)} · Aylık Kesinti: {fmtTL(g.monthlyDeductionAmount)}
                      </div>
                      <div className="mono" style={{ fontSize: 13, fontWeight: 800, color: status === "tamamlandi" ? "var(--pine)" : "var(--brick)", marginTop: 4 }}>
                        Kalan Bakiye: {fmtTL(remainingBalance)}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
                      {status === "devam_ediyor" && <DeductionForm garnishmentId={g.id} defaultAmount={g.monthlyDeductionAmount} />}
                      <form action={deleteGarnishmentAction}>
                        <input type="hidden" name="id" value={g.id} />
                        <DeleteButton confirmText={`"${g.employee?.fullName ?? "—"}" icra dosyasını silmek istediğinize emin misiniz?`} />
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
