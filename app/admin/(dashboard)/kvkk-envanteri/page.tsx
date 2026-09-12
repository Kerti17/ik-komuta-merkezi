import { desc } from "drizzle-orm";
import { db } from "@/db";
import { kvkkInventory } from "@/db/schema";
import { Card, Table, Tr, Td, EmptyState, PageHeader } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { KvkkInventoryForm } from "./KvkkInventoryForm";
import { deleteKvkkInventoryAction } from "./actions";
import Link from "next/link";

export default async function KvkkEnvanteriPage() {
  const list = await db.select().from(kvkkInventory).orderBy(desc(kvkkInventory.updatedAt));
  const existingCategories = Array.from(new Set(list.map((r) => r.dataCategory))).sort();

  return (
    <div>
      <PageHeader
        title="KVKK Kişisel Veri Envanteri"
        description="Veri kategorisi, işleme amacı, hukuki dayanak, saklama süresi ve aktarılan taraf bilgilerini İK bu ekrandan girer/düzenler."
      />

      <div
        style={{
          background: "#FBF7EC",
          border: "1px solid #F0E2BC",
          borderRadius: 6,
          padding: "12px 16px",
          fontSize: 12.5,
          color: "#6b5a1f",
          marginBottom: 20,
          lineHeight: 1.6,
        }}
      >
        <b>⚠ Bu bir dokümantasyon aracıdır.</b> Sistem, veritabanındaki verileri tarayıp bu envanterle karşılaştırmaz ve{" "}
        <b>hiçbir otomatik hukuki uygunluk denetimi yapmaz.</b> Envanterin doğruluğu ve güncelliği tamamen İK/veri sorumlusunun girdiği bilgiye
        bağlıdır — burada bir kayıt olmaması veya eksik/hatalı olması, ilgili veri işlemenin KVKK'ya uygun olduğu ya da olmadığı anlamına gelmez.
      </div>

      <Card title="Yeni Envanter Kaydı Ekle">
        <KvkkInventoryForm existingCategories={existingCategories} />
      </Card>

      <Card title={`Envanter Kayıtları (${list.length})`}>
        {list.length === 0 ? (
          <EmptyState text="Henüz envanter kaydı eklenmedi." />
        ) : (
          <Table head={["Veri Kategorisi", "İşleme Amacı", "Hukuki Dayanak", "Saklama Süresi", "Aktarılan Taraf", ""]}>
            {list.map((r) => (
              <Tr key={r.id}>
                <Td>
                  <b>{r.dataCategory}</b>
                </Td>
                <Td>{r.processingPurpose}</Td>
                <Td>{r.legalBasis}</Td>
                <Td>{r.retentionPeriod}</Td>
                <Td>{r.transferredParty ?? "—"}</Td>
                <Td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Link
                      href={`/admin/kvkk-envanteri/${r.id}`}
                      className="mono"
                      style={{
                        padding: "4px 9px",
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: "var(--ink)",
                        border: "1px solid var(--line)",
                        borderRadius: 4,
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Düzenle
                    </Link>
                    <form action={deleteKvkkInventoryAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <DeleteButton confirmText={`"${r.dataCategory}" envanter kaydını silmek istediğinize emin misiniz?`} />
                    </form>
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
