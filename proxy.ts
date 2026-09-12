// Next.js 16: "middleware" dosya konvansiyonu "proxy" olarak yeniden adlandirildi.
// UC ayri koruma modeli tek proxy fonksiyonunda birlesir:
//   - /admin/*     -> NextAuth (kisisel hesap, admin_users), sadece ik_admin/genel_mudur - bkz. auth.ts
//   - /yonetici/*  -> AYNI NextAuth oturumu ama SADECE role=departman_muduru (Bolum 5
//                     Faz1.5 madde 21 - "ayri, kisitli bir giris"; giris ekrani ayni
//                     /admin/login'i paylasir, ayrimi rol belirler, bkz. schema.ts
//                     manager_notes yorumu)
//   - /panel/*     -> tek, paylasilan sifre (VARSAYIM, kullanici talebiyle eklendi) - bkz. lib/panel-session.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PANEL_COOKIE_NAME, verifyPanelSessionToken } from "@/lib/panel-session";

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!req.auth?.user) {
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
      return NextResponse.redirect(url);
    }
    // Bolum yoneticileri Ik'nin admin ekranlarini gormemeli - kendi kisitli
    // ekranina yonlendirilir (madde 21 "ayri, kisitli bir giris").
    if (req.auth.user.role === "departman_muduru") {
      return NextResponse.redirect(new URL("/yonetici", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/yonetici")) {
    if (!req.auth?.user) {
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
      return NextResponse.redirect(url);
    }
    // Ik_admin/genel_mudur bolum yoneticisi ekranini gormemeli - kendi admin
    // panellerine yonlendirilir.
    if (req.auth.user.role !== "departman_muduru") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/panel") && !pathname.startsWith("/panel/login")) {
    const token = req.cookies.get(PANEL_COOKIE_NAME)?.value;
    const valid = token ? await verifyPanelSessionToken(token) : false;
    if (!valid) {
      const url = new URL("/panel/login", req.url);
      url.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/yonetici/:path*", "/panel/:path*"],
};
