// Dashboard (Bolum 2): "/panel" - Genel Mudur / yonetim, salt goruntuleme.
// Yapim Sirasi (Bolum 14) adim 3: veritabanindan okunan gercek Faz1 modulleri
// (bkz. bellek notu "ik-komuta-merkezi-durum"). Agir agregasyonlar
// lib/panel-data.ts'te sunucuda hesaplanir, sonuc client component'e
// (PanelDashboard) prop olarak gecilir.
import Link from "next/link";
import { FileDown } from "lucide-react";
import { getPanelDashboardData } from "@/lib/panel-data";
import { PanelDashboard } from "@/components/panel/PanelDashboard";
import { ThreadRule } from "@/components/ThreadRule";

// Onemli: bu sayfa DB'den okur ve her admin degisikliginde (yeni calisan,
// devamsizlik girisi, ayar degisikligi vb.) guncel gorunmesi gerekir. Dynamic
// API kullanmadigi icin (cookies/headers okumuyor - proxy.ts zaten korumasini
// yapiyor) Next.js bunu varsayilan olarak build-anindaki veriyle STATIK
// prerender eder (bkz. next build ciktisinda "○ /panel") - bu, canli bir
// panel icin yanlis. force-dynamic ile her istekte yeniden render zorlanir.
export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const data = await getPanelDashboardData();

  return (
    <main style={{ background: "var(--paper)", minHeight: "100vh" }}>
      <div style={{ borderBottom: "1px solid var(--line)", padding: "28px 32px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="mono" style={{ fontSize: 11, color: "var(--thread-deep)", letterSpacing: "0.12em", marginBottom: 6 }}>
              {data.companyName.toUpperCase()} — İNSAN KAYNAKLARI
            </div>
            <h1 className="disp" style={{ fontSize: 30, fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
              İK Komuta Merkezi
            </h1>
          </div>
          <Link
            href="/panel/rapor"
            className="mono"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              fontSize: 11.5,
              fontWeight: 700,
              background: "var(--thread)",
              color: "var(--ink)",
              border: "none",
              borderRadius: 4,
              boxShadow: "0 8px 18px -10px rgba(212,160,23,0.55)",
              textDecoration: "none",
            }}
          >
            <FileDown size={13} /> Patron Raporu Al (PDF)
          </Link>
        </div>
        <ThreadRule style={{ marginTop: 20 }} />
      </div>
      <PanelDashboard data={data} />
    </main>
  );
}
