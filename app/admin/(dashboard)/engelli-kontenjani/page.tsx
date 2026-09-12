import { getDisabilityQuota, getSettings } from "@/lib/settings";
import { Card, PageHeader } from "@/components/admin/ui";
import { QuotaForm } from "./QuotaForm";

export default async function EngelliKontenjaniPage() {
  const [quota, settings] = await Promise.all([getDisabilityQuota(), getSettings()]);

  return (
    <div>
      <PageHeader
        title="Zorunlu İstihdam (Engelli) Kontenjanı"
        description="İş Kanunu m.30 — 50+ çalışanlı işyerlerinde yasal kontenjan zorunluluğu. Rakamlar demo/tahminidir, güncel mevzuata göre teyit edilmelidir."
      />
      <Card>
        <QuotaForm quota={quota} quotaPercentage={settings.disabilityQuotaPercentage} />
      </Card>
    </div>
  );
}
