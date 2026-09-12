import { auth, signOut } from "@/auth";
import { AdminNav } from "@/components/admin/Nav";
import { getLicenseGate } from "@/lib/license";

const LOCK_MESSAGE: Record<string, string> = {
  not_configured: "Lisans yapılandırılmamış.",
  expired: "Lisansınızın süresi doldu.",
  invalid: "Lisansınız geçersiz.",
};

// Middleware zaten oturum kontrolu yapiyor (bkz. middleware.ts + auth.ts
// callbacks.authorized), ama savunmaci olarak burada da session okunur.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [session, licenseGate] = await Promise.all([auth(), getLicenseGate()]);

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--paper)" }}>
      <aside
        style={{
          width: 216,
          flexShrink: 0,
          borderRight: "1px solid var(--line)",
          padding: "22px 12px",
          background: "#fff",
        }}
      >
        <div className="mono" style={{ fontSize: 10.5, color: "var(--thread)", letterSpacing: "0.1em", marginBottom: 2, padding: "0 12px" }}>
          IK KOMUTA MERKEZI
        </div>
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 16, padding: "0 12px" }}>Admin Panel</div>
        <AdminNav />
      </aside>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header
          style={{
            borderBottom: "1px solid var(--line)",
            padding: "13px 28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fff",
          }}
        >
          <span style={{ fontSize: 12.5, color: "#4b5563" }}>{session?.user?.name ?? session?.user?.email}</span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="mono"
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: "transparent",
                border: "1px solid var(--line)",
                borderRadius: 4,
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              Çıkış Yap
            </button>
          </form>
        </header>
        {/* VARSAYIM (Bolum 7): lisans sorunlarinda /panel TAMAMEN kilitlenir (bkz.
            app/panel/(dashboard)/layout.tsx) ama /admin sadece bir uyari banner'i
            gosterir - admin panel calisir durumda kalmali ki yonetici /admin/lisans'a
            gidip durumu gorebilsin ve (env degisken guncellendiginde) yeniden
            kontrol edebilsin. */}
        {licenseGate.locked && licenseGate.reason && (
          <div
            className="mono"
            style={{
              background: "#FBF2EF",
              borderBottom: "1px solid #EAC5BC",
              color: "var(--brick)",
              fontSize: 12,
              fontWeight: 700,
              padding: "9px 28px",
            }}
          >
            {LOCK_MESSAGE[licenseGate.reason]} Genel Müdür panelinin (/panel) erişimi kilitlendi — detaylar için{" "}
            <a href="/admin/lisans" style={{ color: "var(--brick)", textDecoration: "underline" }}>
              Lisans
            </a>{" "}
            sayfasına bakın.
          </div>
        )}
        <main style={{ flex: 1, padding: "26px 28px 60px", maxWidth: 1000, width: "100%" }}>{children}</main>
      </div>
    </div>
  );
}
