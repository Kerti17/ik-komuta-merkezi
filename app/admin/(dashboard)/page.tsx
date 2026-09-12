import { eq, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { employees, evaluations, healthScreenings, leaveBalances } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import { getUpcomingBirthdays, formatDaysUntil } from "@/lib/birthdays";
import { Card, Badge, PageHeader } from "@/components/admin/ui";
import Link from "next/link";

export default async function AdminHomePage() {
  const s = await getSettings();
  const today = new Date().toISOString().slice(0, 10);

  const [activeEmployeeCount, pendingEvaluationCount, overdueScreeningCount, criticalLeaveCount, activeEmployeesForBirthdays] = await Promise.all([
    db.$count(employees, eq(employees.status, "aktif")),
    db.$count(evaluations, sql`${evaluations.status} in ('bekliyor', 'acil', 'gecikti')`),
    db.$count(healthScreenings, lte(healthScreenings.dueDate, today)),
    db.$count(leaveBalances, sql`${leaveBalances.remainingDaysTotal} >= ${s.leaveCriticalThresholdDays}`),
    db
      .select({ id: employees.id, fullName: employees.fullName, birthDate: employees.birthDate })
      .from(employees)
      .where(eq(employees.status, "aktif")),
  ]);

  const upcomingBirthdays = getUpcomingBirthdays(activeEmployeesForBirthdays);

  const cards = [
    { label: "Aktif Çalışan", value: activeEmployeeCount, href: "/admin/calisanlar" },
    { label: "Bekleyen Değerlendirme", value: pendingEvaluationCount, href: "/admin/degerlendirmeler" },
    { label: "Süresi Geçmiş ISG Taraması", value: overdueScreeningCount, href: "/admin/isg" },
    { label: "Kritik İzin Bakiyesi (30+ gün)", value: criticalLeaveCount, href: "/admin/izin" },
  ];

  return (
    <div>
      <PageHeader title="Genel Bakış" description={`${s.companyName} — hızlı erişim ve özet sayılar.`} />

      {upcomingBirthdays.length > 0 && (
        <Card title="🎂 Doğum Günleri" style={{ background: "#FBF7EC", borderColor: "#F0E2BC" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {upcomingBirthdays.map((b) => (
              <div key={b.employeeId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                <span>
                  <b>{b.fullName}</b>
                  {b.turningAge != null ? ` — ${b.turningAge} yaşına giriyor` : ""}
                </span>
                <Badge tone={b.daysUntil === 0 ? "brick" : "thread"}>{formatDaysUntil(b.daysUntil)}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 26 }}>
        {cards.map((c) => (
          <Link key={c.label} href={c.href} style={{ textDecoration: "none" }}>
            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 8, boxShadow: "var(--card-shadow)", padding: "16px 16px 14px" }}>
              <div className="mono" style={{ fontSize: 10.5, color: "#6b7280", letterSpacing: "0.05em", marginBottom: 8 }}>
                {c.label.toUpperCase()}
              </div>
              <div className="disp" style={{ fontSize: 28, fontWeight: 800, color: "var(--ink)" }}>
                {c.value}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Card title="Hızlı Bağlantılar" description="Sık kullanılan işlemler">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {[
            { href: "/admin/excel", label: "Excel İçe Aktarma" },
            { href: "/admin/calisanlar", label: "Yeni Çalışan / Liste" },
            { href: "/admin/degerlendirmeler", label: "Değerlendirme Puanı Gir" },
            { href: "/admin/ayarlar", label: "Ayarları Düzenle" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="mono"
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                padding: "8px 14px",
                borderRadius: 4,
                border: "1px solid var(--line)",
                background: "var(--paper)",
                color: "var(--ink)",
                textDecoration: "none",
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
