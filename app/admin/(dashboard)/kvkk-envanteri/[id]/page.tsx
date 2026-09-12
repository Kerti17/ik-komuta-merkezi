import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { kvkkInventory } from "@/db/schema";
import { Card, PageHeader } from "@/components/admin/ui";
import { EditKvkkInventoryForm } from "./EditKvkkInventoryForm";

export default async function EditKvkkInventoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recordId = Number(id);
  if (!Number.isInteger(recordId)) notFound();

  const [record] = await db.select().from(kvkkInventory).where(eq(kvkkInventory.id, recordId)).limit(1);
  if (!record) notFound();

  return (
    <div>
      <PageHeader title="Envanter Kaydını Düzenle" description={record.dataCategory} />
      <Card>
        <EditKvkkInventoryForm record={record} />
      </Card>
    </div>
  );
}
