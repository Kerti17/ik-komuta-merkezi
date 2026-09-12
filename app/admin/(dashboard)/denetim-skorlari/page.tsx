import { desc } from "drizzle-orm";
import { db } from "@/db";
import { customerAudits } from "@/db/schema";
import { Card, Table, Tr, Td, Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { CustomerAuditForm } from "./CustomerAuditForm";
import { deleteCustomerAuditAction } from "./actions";

function scoreTone(score: number): "pine" | "thread" | "brick" {
  if (score >= 80) return "pine";
  if (score >= 50) return "thread";
  return "brick";
}

export default async function DenetimSkorlariPage() {
  const list = await db.select().from(customerAudits).orderBy(desc(customerAudits.auditDate));

  return (
    <div>
      <PageHeader
        title="Denetim Skorları"
        description={
          <>
            Müşteri denetim ziyaretlerinin kaydı. <b>Dikkat:</b> bu sayfa, admin panelde yapılan değişikliklerin sistem tarafından otomatik
            tutulduğu <i>Audit Log</i> sayfasından farklıdır — burası müşterinin şirketi denetlemeye geldiği ziyaretlerin sonucudur.
          </>
        }
      />

      <Card title="Yeni Denetim Kaydı Ekle">
        <CustomerAuditForm />
      </Card>

      <Card title={`Kayıt Listesi (${list.length})`}>
        {list.length === 0 ? (
          <EmptyState text="Henüz denetim kaydı eklenmedi." />
        ) : (
          <Table head={["Müşteri", "Tarih", "Skor", "Açıklama", ""]}>
            {list.map((r) => (
              <Tr key={r.id}>
                <Td>{r.customerName}</Td>
                <Td mono>{r.auditDate}</Td>
                <Td>
                  <Badge tone={scoreTone(r.score)}>{r.score}</Badge>
                </Td>
                <Td>{r.description ?? "—"}</Td>
                <Td>
                  <form action={deleteCustomerAuditAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <DeleteButton confirmText={`"${r.customerName}" denetim kaydını silmek istediğinize emin misiniz?`} />
                  </form>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
