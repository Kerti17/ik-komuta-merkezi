import Link from "next/link";
import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { departments, branches } from "@/db/schema";
import { Card, Table, Tr, Td, Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { EmployeeForm } from "./EmployeeForm";

export default async function CalisanlarPage() {
  const [employeeList, depList, branchList] = await Promise.all([
    db.query.employees.findMany({
      with: { department: true, branch: true },
      orderBy: (e) => [desc(e.status), asc(e.fullName)],
    }),
    db.select().from(departments).orderBy(asc(departments.name)),
    db.select().from(branches).orderBy(asc(branches.name)),
  ]);

  return (
    <div>
      <PageHeader
        title="Çalışanlar"
        description={
          <>
            Toplu yükleme için <Link href="/admin/excel" style={{ color: "var(--denim)" }}>Excel İçe Aktarma</Link> sayfasını kullanın. Bu form tekil ekleme/düzeltme içindir.
          </>
        }
      />

      {depList.length === 0 || branchList.length === 0 ? (
        <Card>
          <EmptyState text="Çalışan ekleyebilmek için önce en az bir departman ve bir şube tanımlamalısınız." />
          <Link href="/admin/departmanlar" className="mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--denim)" }}>
            Departman & Şube Yönetimine Git →
          </Link>
        </Card>
      ) : (
        <Card title="Yeni Çalışan">
          <EmployeeForm departments={depList} branches={branchList} />
        </Card>
      )}

      <Card title={`Çalışan Listesi (${employeeList.length})`}>
        {employeeList.length === 0 ? (
          <EmptyState text="Henüz çalışan eklenmedi." />
        ) : (
          <Table head={["Ad Soyad", "Departman", "Şube", "Yaka", "İşe Giriş", "Durum", ""]}>
            {employeeList.map((e) => (
              <Tr key={e.id}>
                <Td>{e.fullName}</Td>
                <Td>{e.department?.name ?? "—"}</Td>
                <Td>{e.branch?.name ?? "—"}</Td>
                <Td>
                  <Badge tone={e.collarType === "mavi" ? "thread" : "default"}>{e.collarType === "mavi" ? "MAVİ" : "BEYAZ"}</Badge>
                </Td>
                <Td mono>{e.hireDate}</Td>
                <Td>
                  <Badge tone={e.status === "aktif" ? "pine" : "brick"}>{e.status === "aktif" ? "AKTİF" : "AYRILDI"}</Badge>
                </Td>
                <Td>
                  <Link href={`/admin/calisanlar/${e.id}`} className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: "var(--denim)" }}>
                    Düzenle
                  </Link>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
