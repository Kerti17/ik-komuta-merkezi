import { asc } from "drizzle-orm";
import { db } from "@/db";
import { getActiveEmployeeOptions } from "@/lib/employees";
import { Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { CriticalRoleForm } from "./CriticalRoleForm";
import { CriticalRoleRow } from "./CriticalRoleRow";

const HEAD_COLUMNS = ["POZİSYON", "MEVCUT ÇALIŞAN", "YEDEK SAYISI", "YEDEK DURUMU", "RİSK", "", ""];

export default async function KritikRollerPage() {
  const [employeeOptions, roles] = await Promise.all([
    getActiveEmployeeOptions(),
    db.query.criticalRoles.findMany({ orderBy: (r) => [asc(r.roleName)] }),
  ]);

  const noBackupCount = roles.filter((r) => r.backupCount <= 0 && r.currentEmployeeId != null).length;

  return (
    <div>
      <PageHeader
        title="Kritik Rol & Yedekleme"
        description={
          <>
            Bir kritik pozisyonun yedeği yoksa (Yedek Sayısı = 0) Genel Müdür panelinde (/panel) otomatik, görünür bir uyarı banner&apos;ı
            gösterilir. Pozisyon adları tamamen serbesttir — sektörünüze göre istediğinizi tanımlayın.
          </>
        }
      />

      <Card title="Yeni Kritik Pozisyon Ekle">
        {employeeOptions.length === 0 ? (
          <EmptyState text="Önce Çalışanlar sayfasından aktif çalışan ekleyin (pozisyonu boş da bırakabilirsiniz)." />
        ) : (
          <CriticalRoleForm employees={employeeOptions} />
        )}
      </Card>

      <Card
        title={`Kritik Pozisyonlar (${roles.length})`}
        description={noBackupCount > 0 ? `⚠ ${noBackupCount} pozisyonda yedek yok — panelde uyarı gösteriliyor.` : undefined}
      >
        {roles.length === 0 ? (
          <EmptyState text="Henüz kritik pozisyon tanımlanmadı." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 780 }}>
              <div
                className="mono"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.3fr 1.3fr 0.7fr 1.2fr 0.8fr auto auto",
                  gap: 8,
                  padding: "0 0 8px",
                  fontSize: 10,
                  color: "#6b7280",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                {HEAD_COLUMNS.map((h, i) => (
                  <span key={i}>{h}</span>
                ))}
              </div>
              {roles.map((r) => (
                <CriticalRoleRow key={r.id} row={r} employees={employeeOptions} />
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
