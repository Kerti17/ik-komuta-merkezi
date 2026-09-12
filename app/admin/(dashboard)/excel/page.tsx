import Link from "next/link";
import { Card, PageHeader } from "@/components/admin/ui";

const TEMPLATES = [
  {
    href: "/admin/excel/calisanlar",
    title: "Çalışanlar",
    description: "Ad, departman, şube, yaka tipi, işe giriş tarihi, maaş bandı — kadronun toplu yüklenmesi.",
  },
  {
    href: "/admin/excel/devamsizlik",
    title: "Devamsızlık",
    description: "Çalışan, tarih, tür (devamsızlık/raporlu vb.) — puantaj/devamsızlık sisteminden toplu aktarım.",
  },
  {
    href: "/admin/excel/vardiya",
    title: "Vardiya & Mesai",
    description: "Aylık dönem bazında fazla mesai saati, gece vardiyası ve hafta sonu mesai sayıları.",
  },
];

export default function ExcelHubPage() {
  return (
    <div>
      <PageHeader
        title="Excel İçe Aktarma"
        description="Bölüm 6 — sabit şablon formatları. Her biri indirilebilir, hatalı satırlar yükleme sonrası ayrıca gösterilir."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        {TEMPLATES.map((t) => (
          <Link key={t.href} href={t.href} style={{ textDecoration: "none" }}>
            <Card title={t.title} description={t.description} style={{ marginBottom: 0, height: "100%" }}>
              <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--denim)" }}>
                Aç →
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
