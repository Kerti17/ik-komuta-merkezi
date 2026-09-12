import { getSettings, getRiskScoreWeights } from "@/lib/settings";
import { Card, PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "./SettingsForm";
import { PanelPasswordForm } from "./PanelPasswordForm";
import { RiskWeightsForm } from "./RiskWeightsForm";

export default async function AyarlarPage() {
  const [s, riskWeights] = await Promise.all([getSettings(), getRiskScoreWeights()]);
  return (
    <div>
      <PageHeader title="Ayarlar" description="Bölüm 6 — firmaya özel parametreler. Değişiklikler tüm panele hemen yansır." />

      <Card title="Panel Şifresi" description="/panel — Genel Müdür/yönetim görünümü için tek, paylaşılan şifre.">
        <PanelPasswordForm isSet={!!s.panelPasswordHash} />
      </Card>

      <Card
        title="Ayrılma Riski Skoru — Ağırlıklar"
        description="Bölüm 5 Faz1.5 madde 19 — her sinyalin göreli ağırlığı. Toplamları 100 olmak zorunda değil, otomatik orantılanır. Varsayılan: 30/20/20/15/15."
      >
        <RiskWeightsForm weights={riskWeights} />
      </Card>

      <SettingsForm settings={s} />
    </div>
  );
}
