import { desc } from "drizzle-orm";
import { db } from "@/db";
import { Card, Table, Tr, Td, EmptyState, PageHeader } from "@/components/admin/ui";

const RECENT_LIMIT = 300;

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const entries = await db.query.auditLog.findMany({
    with: { adminUser: { columns: { fullName: true, email: true } } },
    orderBy: (a) => [desc(a.createdAt)],
    limit: RECENT_LIMIT,
  });

  return (
    <div>
      <PageHeader
        title="Audit Log"
        description={`Bölüm 5 Faz2 madde 29 — admin panelde ve bölüm yöneticisi ekranında yapılan değişikliklerin kaydı. En son ${RECENT_LIMIT} kayıt gösterilir, en yeni en üstte.`}
      />

      <Card title={`Kayıtlar (${entries.length})`}>
        {entries.length === 0 ? (
          <EmptyState text="Henüz kayıt yok." />
        ) : (
          <Table head={["Tarih", "Kullanıcı", "İşlem"]}>
            {entries.map((e) => (
              <Tr key={e.id}>
                <Td mono>{new Date(e.createdAt).toLocaleString("tr-TR")}</Td>
                <Td>{e.adminUser?.fullName ?? e.adminUser?.email ?? "—"}</Td>
                <Td>{e.action}</Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
