import { desc } from "drizzle-orm";
import { db } from "@/db";
import { getActiveEmployeeOptions } from "@/lib/employees";
import { getSettings } from "@/lib/settings";
import { Card, Table, Tr, Td, Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { LeaveBalanceForm } from "./LeaveBalanceForm";

export default async function IzinPage() {
  const [employeeOptions, balances, settings] = await Promise.all([
    getActiveEmployeeOptions(),
    db.query.leaveBalances.findMany({ with: { employee: true }, orderBy: (l) => [desc(l.remainingDaysTotal)] }),
    getSettings(),
  ]);

  return (
    <div>
      <PageHeader
        title="Birikmiş Yıllık İzin Takibi"
        description={`Eşikler: ≥${settings.leaveCriticalThresholdDays} gün kritik, ≥${settings.leaveWarningThresholdDays} gün dikkat (bkz. Ayarlar).`}
      />

      <Card title="İzin Bakiyesi Gir / Güncelle" description="Aynı çalışan + yıl için tekrar girerseniz mevcut kayıt güncellenir.">
        {employeeOptions.length === 0 ? <EmptyState text="Önce Çalışanlar sayfasından aktif çalışan ekleyin." /> : <LeaveBalanceForm employees={employeeOptions} />}
      </Card>

      <Card title={`Bakiye Listesi (${balances.length})`}>
        {balances.length === 0 ? (
          <EmptyState text="Henüz izin bakiyesi girilmedi." />
        ) : (
          <Table head={["Çalışan", "Yıl", "Hak Edilen", "Kullanılan", "Kalan (Birikmiş)", "Durum"]}>
            {balances.map((b) => {
              const tone = b.remainingDaysTotal >= settings.leaveCriticalThresholdDays ? "brick" : b.remainingDaysTotal >= settings.leaveWarningThresholdDays ? "thread" : "pine";
              const label = b.remainingDaysTotal >= settings.leaveCriticalThresholdDays ? "Acil — Kullandırılmalı" : b.remainingDaysTotal >= settings.leaveWarningThresholdDays ? "Planlanmalı" : "Normal";
              return (
                <Tr key={b.id}>
                  <Td>{b.employee?.fullName ?? "—"}</Td>
                  <Td mono>{b.asOfYear}</Td>
                  <Td mono>{b.earnedDays} gün</Td>
                  <Td mono>{b.usedDays} gün</Td>
                  <Td mono>{b.remainingDaysTotal} gün</Td>
                  <Td>
                    <Badge tone={tone}>{label}</Badge>
                  </Td>
                </Tr>
              );
            })}
          </Table>
        )}
      </Card>
    </div>
  );
}
