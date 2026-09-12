"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Ana Sayfa" },
  { href: "/admin/calisanlar", label: "Çalışanlar" },
  { href: "/admin/departmanlar", label: "Departman & Şube" },
  { href: "/admin/excel", label: "Excel İçe Aktarma" },
  { href: "/admin/degerlendirmeler", label: "Değerlendirmeler" },
  { href: "/admin/kariyer", label: "Kariyer Takibi" },
  { href: "/admin/arabuluculuk", label: "Arabuluculuk" },
  { href: "/admin/isg", label: "ISG Taramaları" },
  { href: "/admin/zorunlu-egitim", label: "Zorunlu Eğitim" },
  { href: "/admin/egitimler", label: "Eğitim ve Gelişim" },
  { href: "/admin/tutanaklar", label: "Tutanaklar" },
  { href: "/admin/cikis-mulakati", label: "Çıkış Mülakatı" },
  { href: "/admin/odul", label: "Ödül / Takdir" },
  { href: "/admin/izin", label: "İzin Bakiyeleri" },
  { href: "/admin/engelli-kontenjani", label: "Engelli Kontenjanı" },
  { href: "/admin/kritik-roller", label: "Kritik Rol & Yedekleme" },
  { href: "/admin/tis-sendika", label: "TİS ve Sendika" },
  { href: "/admin/icra-takip", label: "İcra Takip" },
  { href: "/admin/sgk-tesvikleri", label: "SGK Teşvikleri" },
  { href: "/admin/denetim-skorlari", label: "Denetim Skorları" },
  { href: "/admin/bolum-yoneticileri", label: "Bölüm Yöneticileri" },
  { href: "/admin/kvkk-envanteri", label: "KVKK Veri Envanteri" },
  { href: "/admin/ayarlar", label: "Ayarlar" },
  { href: "/admin/lisans", label: "Lisans" },
  { href: "/admin/audit-log", label: "Audit Log" },
  { href: "/admin/destek", label: "Destek" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="mono"
            style={{
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: active ? 700 : 500,
              borderRadius: 4,
              color: active ? "var(--paper)" : "var(--ink)",
              background: active ? "var(--ink)" : "transparent",
              textDecoration: "none",
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
