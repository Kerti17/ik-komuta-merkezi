import { redirect } from "next/navigation";

// Kok sayfa: Bolum 2 - "Dashboard | /panel | Genel Mudur / yonetim". Ana sayfa
// dogrudan panele yonlendirir.
export default function RootPage() {
  redirect("/panel");
}
