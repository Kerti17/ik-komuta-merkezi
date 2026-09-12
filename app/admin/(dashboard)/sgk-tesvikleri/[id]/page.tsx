import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sgkIncentiveRules } from "@/db/schema";
import { Card, PageHeader } from "@/components/admin/ui";
import { EditSgkIncentiveRuleForm } from "./EditSgkIncentiveRuleForm";

export default async function EditSgkIncentiveRulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ruleId = Number(id);
  if (!Number.isInteger(ruleId)) notFound();

  const [rule] = await db.select().from(sgkIncentiveRules).where(eq(sgkIncentiveRules.id, ruleId)).limit(1);
  if (!rule) notFound();

  return (
    <div>
      <PageHeader title="Teşvik Kuralını Düzenle" description={rule.name} />
      <Card>
        <EditSgkIncentiveRuleForm rule={rule} />
      </Card>
    </div>
  );
}
