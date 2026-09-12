import { auth, signOut } from "@/auth";

// Bolum Yoneticisi ekrani (Bolum 5 Faz1.5 madde 21) - Ik admin panelinden
// (/admin) AYRI, kisitli bir giris. Ayni NextAuth oturumunu kullanir ama
// proxy.ts role bazinda ayirir (bkz. proxy.ts yorumu). Layout burada da
// (admin layout'taki gibi) savunmaci bir session kontrolu yapar.
export default async function YoneticiLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <header
        style={{
          borderBottom: "1px solid var(--line)",
          padding: "16px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fff",
        }}
      >
        <div>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--thread)", letterSpacing: "0.1em" }}>
            IK KOMUTA MERKEZI
          </div>
          <div className="disp" style={{ fontSize: 15, fontWeight: 800 }}>
            Bölüm Yöneticisi Ekranı
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
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
        </div>
      </header>
      <main style={{ padding: "26px 28px 60px", maxWidth: 860, margin: "0 auto" }}>{children}</main>
    </div>
  );
}
