// Patron Raporu (Bolum 5 Faz1 madde 11, Bolum 8): tek sayfalik yonetici
// ozeti. MVP'de window.print() ile tarayici uzerinden PDF alinir (bkz.
// PrintButton.tsx). Ayni panel dashboard verisinden (lib/panel-data.ts)
// turetilir - bkz. lib/executive-summary.ts icin metodoloji notu.
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ShieldAlert } from "lucide-react";
import { getPanelDashboardData } from "@/lib/panel-data";
import { getSettings } from "@/lib/settings";
import { buildExecutiveSummary } from "@/lib/executive-summary";
import { fmtTL } from "@/components/panel/ui";
import { ThreadRule } from "@/components/ThreadRule";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function PatronRaporuPage() {
  const [data, settings] = await Promise.all([getPanelDashboardData(), getSettings()]);
  const summary = buildExecutiveSummary(data, {
    monthlyWorkforceCost: settings.monthlyWorkforceCost,
    monthlyRevenue: settings.monthlyRevenue,
  });

  const today = new Date().toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div style={{ background: "#fff", minHeight: "100vh", color: "var(--ink)" }}>
      <div
        className="no-print"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 32px",
          borderBottom: "1px solid var(--line)",
          background: "var(--paper)",
        }}
      >
        <Link
          href="/panel"
          className="mono"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            fontSize: 11.5,
            fontWeight: 700,
            background: "transparent",
            color: "var(--ink)",
            border: "1px solid var(--line)",
            borderRadius: 3,
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={13} /> Panele Dön
        </Link>
        <PrintButton />
      </div>

      <div style={{ padding: "36px 40px", maxWidth: 820, margin: "0 auto" }}>
        <div className="mono" style={{ fontSize: 11, color: "var(--thread-deep)", letterSpacing: "0.12em", marginBottom: 8 }}>
          {data.companyName.toUpperCase()} — YÖNETİM KURULU ÖZETİ
        </div>
        <h1 className="disp" style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px" }}>
          İK Aylık Özeti — {today}
        </h1>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 14 }}>1 sayfalık yönetici özeti · {summary.totalActiveCount} çalışan</div>
        <ThreadRule style={{ marginBottom: 28 }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 26 }}>
          <div style={{ border: "1px solid var(--line)", borderRadius: 4, padding: "16px 18px" }}>
            <div className="mono" style={{ fontSize: 10, color: "#6b7280", marginBottom: 6, letterSpacing: "0.05em" }}>
              TOPLAM İŞGÜCÜ MALİYETİ (AYLIK)
            </div>
            {summary.monthlyWorkforceCost != null ? (
              <>
                <div className="disp" style={{ fontSize: 24, fontWeight: 800 }}>
                  {fmtTL(summary.monthlyWorkforceCost)}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                  {summary.workforceCostRatioPercent != null ? `Cironun %${summary.workforceCostRatioPercent}'i` : "Ciro girilmemiş"}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: "#9ca3af" }}>Ayarlar&apos;dan girilmedi</div>
            )}
          </div>
          <div style={{ border: "1px solid var(--line)", borderRadius: 4, padding: "16px 18px" }}>
            <div className="mono" style={{ fontSize: 10, color: "#6b7280", marginBottom: 6, letterSpacing: "0.05em" }}>
              ARABULUCULUKLA ENGELLENEN DAVA MALİYETİ
            </div>
            <div className="disp" style={{ fontSize: 24, fontWeight: 800, color: "var(--pine)" }}>
              {fmtTL(summary.mediationTotalSavings)}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Yıllık işten çıkış maliyeti ayrıca {fmtTL(summary.annualExitCostTotal)}</div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3 className="disp" style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>
            Öne Çıkan Riskler
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {summary.risks.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "#FBF2EF", borderRadius: 4, fontSize: 13, lineHeight: 1.5 }}>
                <AlertTriangle size={15} color="var(--brick)" style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="disp" style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>
            Alınması Önerilen Yönetsel Kararlar
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {summary.decisions.map((k, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "var(--paper-deep)", borderRadius: 4, fontSize: 13, lineHeight: 1.5 }}>
                <ShieldAlert size={15} color="var(--denim)" style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{k}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mono" style={{ marginTop: 32, fontSize: 10, color: "#9ca3af" }}>
          VERİTABANINDAN CANLI OKUNUR — RİSK/KARAR LİSTESİ GÜNCEL VERİYE GÖRE OTOMATİK DEĞİŞİR
        </div>
      </div>
    </div>
  );
}
