import { desc } from "drizzle-orm";
import { db } from "@/db";
import { collectiveAgreements } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import { Card, Table, Tr, Td, Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { CollectiveAgreementForm } from "./CollectiveAgreementForm";
import { deleteCollectiveAgreementAction } from "./actions";

export default async function TisSendikaPage() {
  const [s, list] = await Promise.all([getSettings(), db.select().from(collectiveAgreements).orderBy(desc(collectiveAgreements.agreementEndDate))]);
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <PageHeader
        title="TİS ve Sendika"
        description={
          <>
            Toplu iş sözleşmesi (TİS) kayıtları. Bitiş tarihine <b>{s.collectiveAgreementWarningDays} gün</b> kala (Ayarlar'dan değiştirilebilir)
            {" "}panelde (/panel) görünür bir uyarı üretilir.
          </>
        }
      />

      <Card title="Yeni TİS Kaydı Ekle">
        <CollectiveAgreementForm />
      </Card>

      <Card title={`Kayıt Listesi (${list.length})`}>
        {list.length === 0 ? (
          <EmptyState text="Henüz TİS kaydı eklenmedi." />
        ) : (
          <Table head={["Sendika", "Başlangıç", "Bitiş", "Kapsanan Çalışan", "Durum", ""]}>
            {list.map((r) => {
              const remainingDays = Math.round((new Date(r.agreementEndDate).getTime() - new Date(todayIso).getTime()) / 86_400_000);
              const expired = remainingDays < 0;
              const warning = remainingDays <= s.collectiveAgreementWarningDays;
              return (
                <Tr key={r.id}>
                  <Td>{r.unionName}</Td>
                  <Td mono>{r.agreementStartDate}</Td>
                  <Td mono>{r.agreementEndDate}</Td>
                  <Td>{r.coveredEmployeeCount}</Td>
                  <Td>
                    {expired ? (
                      <Badge tone="brick">Süresi Doldu</Badge>
                    ) : warning ? (
                      <Badge tone="thread">{remainingDays} gün kaldı</Badge>
                    ) : (
                      <Badge tone="pine">Devam Ediyor</Badge>
                    )}
                  </Td>
                  <Td>
                    <form action={deleteCollectiveAgreementAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <DeleteButton confirmText={`"${r.unionName}" TİS kaydını silmek istediğinize emin misiniz?`} />
                    </form>
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
