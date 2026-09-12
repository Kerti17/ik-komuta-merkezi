import { asc } from "drizzle-orm";
import { db } from "@/db";
import { departments, branches } from "@/db/schema";
import { Card, Table, Tr, Td, EmptyState, PageHeader } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { DepartmentForm } from "./DepartmentForm";
import { BranchForm } from "./BranchForm";
import { deleteDepartmentAction, deleteBranchAction } from "./actions";

export default async function DepartmanlarPage() {
  const [depList, branchList] = await Promise.all([
    db.select().from(departments).orderBy(asc(departments.name)),
    db.select().from(branches).orderBy(asc(branches.name)),
  ]);

  return (
    <div>
      <PageHeader title="Departman & Şube Yönetimi" description="Bölüm 1 — departmanlar serbest metindir, sektörünüze göre istediğiniz kadar ekleyebilirsiniz." />

      <Card title="Departmanlar">
        <DepartmentForm />
        <div style={{ marginTop: 16 }}>
          {depList.length === 0 ? (
            <EmptyState text="Henüz departman eklenmedi." />
          ) : (
            <Table head={["Departman", ""]}>
              {depList.map((d) => (
                <Tr key={d.id}>
                  <Td>{d.name}</Td>
                  <Td>
                    <form action={deleteDepartmentAction}>
                      <input type="hidden" name="id" value={d.id} />
                      <DeleteButton confirmText={`"${d.name}" departmanını silmek istediğinize emin misiniz?`} />
                    </form>
                  </Td>
                </Tr>
              ))}
            </Table>
          )}
        </div>
      </Card>

      <Card title="Şubeler / Lokasyonlar">
        <BranchForm />
        <div style={{ marginTop: 16 }}>
          {branchList.length === 0 ? (
            <EmptyState text="Henüz şube eklenmedi." />
          ) : (
            <Table head={["Şube", "Adres", ""]}>
              {branchList.map((b) => (
                <Tr key={b.id}>
                  <Td>{b.name}</Td>
                  <Td>{b.address ?? "—"}</Td>
                  <Td>
                    <form action={deleteBranchAction}>
                      <input type="hidden" name="id" value={b.id} />
                      <DeleteButton confirmText={`"${b.name}" şubesini silmek istediğinize emin misiniz?`} />
                    </form>
                  </Td>
                </Tr>
              ))}
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}
