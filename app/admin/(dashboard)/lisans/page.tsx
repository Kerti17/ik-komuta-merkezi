import { getLicenseGate } from "@/lib/license";
import { Card, Badge, PageHeader } from "@/components/admin/ui";
import { RefreshLicenseButton } from "./RefreshLicenseButton";

const STATUS_LABEL: Record<string, { label: string; tone: "pine" | "brick" | "thread" }> = {
  aktif: { label: "Aktif", tone: "pine" },
  suresi_doldu: { label: "Süresi Doldu", tone: "brick" },
  gecersiz: { label: "Geçersiz", tone: "brick" },
};

function maskKey(key: string) {
  if (key.length <= 8) return key;
  return `${key.slice(0, 4)}${"•".repeat(Math.max(4, key.length - 8))}${key.slice(-4)}`;
}

export default async function LisansPage() {
  const gate = await getLicenseGate();
  const hasEnvKey = Boolean(process.env.LICENSE_KEY?.trim());
  const hasApiUrl = Boolean(process.env.LICENSE_API_URL?.trim());
  const bypassActive = process.env.DISABLE_LICENSE_CHECK?.trim().toLowerCase() === "true";

  return (
    <div>
      <PageHeader
        title="Lisans"
        description={
          <>
            Lisans anahtarı bu ekrandan girilmez — kurulum sırasında sunucu ortam değişkeni olarak (<code>LICENSE_KEY</code>) tanımlanır (bkz.{" "}
            <code>.env</code>). Bu sayfa sadece son bilinen durumu gösterir ve manuel kontrol tetikler.
          </>
        }
      />

      <Card title="Durum">
        {bypassActive && (
          <div style={{ marginBottom: 14, padding: "10px 12px", background: "#FBF8EF", border: "1px solid #E9D9A8", borderRadius: 4, fontSize: 12.5, color: "#8a6d1a" }}>
            Pilot test modu: <code>DISABLE_LICENSE_CHECK</code> aktif, lisans kontrolü tamamen atlanıyor. Gerçek müşteri
            kurulumlarında bu değişken tanımlanmamalı.
          </div>
        )}
        {gate.license ? (
          <div style={{ display: "grid", gap: 10, fontSize: 13 }}>
            <Row label="Durum">
              <Badge tone={STATUS_LABEL[gate.license.status]?.tone ?? "thread"}>
                {STATUS_LABEL[gate.license.status]?.label ?? gate.license.status}
              </Badge>
            </Row>
            <Row label="Lisans Anahtarı">
              <span className="mono">{maskKey(gate.license.licenseKey)}</span>
            </Row>
            <Row label="Aktivasyon Tarihi">{gate.license.activatedAt ?? "—"}</Row>
            <Row label="Geçerlilik Sonu">{gate.license.expiresAt ?? "—"}</Row>
            <Row label="Son Kontrol">{gate.license.lastCheckedAt ?? "—"}</Row>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "#6b7280" }}>
            {!hasEnvKey
              ? "LICENSE_KEY ortam değişkeni tanımlı değil — lisans yapılandırılmamış."
              : "Henüz bir doğrulama kaydı yok."}
          </p>
        )}

        {gate.locked && (
          <div style={{ marginTop: 14, padding: "10px 12px", background: "#FBF2EF", border: "1px solid #EAC5BC", borderRadius: 4, fontSize: 12.5, color: "var(--brick)" }}>
            {gate.reason === "not_configured" && "Lisans yapılandırılmamış — /panel erişimi kilitli."}
            {gate.reason === "expired" && "Lisans süresi doldu — /panel erişimi kilitli."}
            {gate.reason === "invalid" && "Lisans geçersiz — /panel erişimi kilitli."}
          </div>
        )}

        {!hasApiUrl && (
          <p style={{ fontSize: 11.5, color: "#9ca3af", marginTop: 10 }}>
            LICENSE_API_URL tanımlı değil, merkezi doğrulama servisiyle iletişim kurulamıyor.
          </p>
        )}

        <div style={{ marginTop: 16 }}>
          <RefreshLicenseButton />
        </div>
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span>{children}</span>
    </div>
  );
}
