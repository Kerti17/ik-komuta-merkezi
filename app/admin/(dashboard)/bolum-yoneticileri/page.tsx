import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers, departments } from "@/db/schema";
import { Card, Table, Tr, Td, EmptyState, PageHeader } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ManagerAccountForm } from "./ManagerAccountForm";
import { deleteManagerAccountAction } from "./actions";

export default async function BolumYoneticileriPage() {
  const [depList, managers] = await Promise.all([
    db.select().from(departments).orderBy(asc(departments.name)),
    db.query.adminUsers.findMany({ where: eq(adminUsers.role, "departman_muduru"), with: { department: true }, orderBy: (m) => [asc(m.fullName)] }),
  ]);

  return (
    <div>
      <PageHeader
        title="Bölüm Yöneticileri"
        description={
          <>
            Bölüm 5 Faz1.5 madde 21 — her yönetici <b>sadece kendi departmanındaki</b> çalışanları görür ve onlarla ilgili not ekleyebilir (
            <code>/yonetici</code>, aynı e-posta/şifre ile <code>/admin/login</code> üzerinden giriş yapar). Girdikleri notlar bu ekranda değil,
            çalışan detay sayfasında ("Yönetici Notları") İK'ya görünür.
          </>
        }
      />

      <Card title="Yeni Yönetici Hesabı Oluştur">
        {depList.length === 0 ? <EmptyState text="Önce Departman & Şube sayfasından departman ekleyin." /> : <ManagerAccountForm departments={depList} />}
      </Card>

      <Card title={`Yönetici Hesapları (${managers.length})`}>
        {managers.length === 0 ? (
          <EmptyState text="Henüz bölüm yöneticisi hesabı oluşturulmadı." />
        ) : (
          <Table head={["Ad Soyad", "E-posta", "Departman", ""]}>
            {managers.map((m) => (
              <Tr key={m.id}>
                <Td>{m.fullName}</Td>
                <Td mono>{m.email}</Td>
                <Td>{m.department?.name ?? "—"}</Td>
                <Td>
                  <form action={deleteManagerAccountAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <DeleteButton confirmText={`"${m.fullName}" yönetici hesabını silmek istediğinize emin misiniz?`} />
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
