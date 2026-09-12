import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PANEL_COOKIE_NAME } from "@/lib/panel-session";
import { getLicenseGate } from "@/lib/license";

const LOCK_TITLE: Record<string, string> = {
  not_configured: "Lisans Yapılandırılmamış",
  expired: "Lisansınızın Süresi Doldu",
  invalid: "Lisansınız Geçersiz",
};
const LOCK_BODY: Record<string, string> = {
  not_configured: "Bu kurulum için henüz bir lisans anahtarı tanımlanmamış.",
  expired: "Verileriniz silinmedi, sadece erişim kilitlendi. Yenilemek için satın aldığınız kanaldan iletişime geçin.",
  invalid: "Lisans anahtarı geçersiz görünüyor. Yardım için satın aldığınız kanaldan iletişime geçin.",
};

export default async function PanelDashboardLayout({ children }: { children: React.ReactNode }) {
  const licenseGate = await getLicenseGate();

  async function panelLogoutAction() {
    "use server";
    const cookieStore = await cookies();
    cookieStore.delete(PANEL_COOKIE_NAME);
    redirect("/panel/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", padding: "10px 20px" }}>
        <form action={panelLogoutAction}>
          <button
            type="submit"
            className="mono"
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              background: "transparent",
              border: "1px solid var(--line)",
              borderRadius: 4,
              padding: "5px 10px",
              cursor: "pointer",
              color: "var(--ink)",
            }}
          >
            Çıkış Yap
          </button>
        </form>
      </div>
      {licenseGate.locked && licenseGate.reason ? (
        // Bolum 7: "uygulama verileri silmez, sadece erisimi kilitler". Bu ekran
        // dashboard'un YERINE gecer - children hic render edilmez (bkz. lib/license.ts).
        <main style={{ padding: "48px 32px", maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--brick)", letterSpacing: "0.12em", marginBottom: 10 }}>
            ERİŞİM KİLİTLİ
          </div>
          <h1 className="disp" style={{ fontSize: 24, fontWeight: 800, margin: "0 0 12px" }}>
            {LOCK_TITLE[licenseGate.reason]}
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "#4b5563" }}>{LOCK_BODY[licenseGate.reason]}</p>
        </main>
      ) : (
        children
      )}
    </div>
  );
}
