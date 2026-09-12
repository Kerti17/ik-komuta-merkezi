import { notFound } from "next/navigation";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { employees, departments, branches, managerNotes, trainings } from "@/db/schema";
import { Card, Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { EditEmployeeForm } from "./EditEmployeeForm";

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const employeeId = Number(id);
  if (!Number.isInteger(employeeId)) notFound();

  const [[employee], depList, branchList, notes, employeeTrainings] = await Promise.all([
    db.select().from(employees).where(eq(employees.id, employeeId)).limit(1),
    db.select().from(departments).orderBy(asc(departments.name)),
    db.select().from(branches).orderBy(asc(branches.name)),
    // trainingId dolu olanlar burada DEGIL, asagidaki "Egitim ve Gelisim"
    // kartinda gosterilir - ayni not iki kartta tekrar etmesin diye.
    db.query.managerNotes.findMany({
      where: and(eq(managerNotes.employeeId, employeeId), isNull(managerNotes.trainingId)),
      with: { author: { columns: { fullName: true, email: true } } }, // author'un passwordHash/role gibi alanlarini cekmeye gerek yok
      orderBy: (n) => [desc(n.noteDate)],
    }),
    // komut1.md Faz 1.6 madde 25d: egitim + egitim sonrasi gelisim
    // degerlendirmesi calisan detayinda gorunmeli.
    db.query.trainings.findMany({
      where: eq(trainings.employeeId, employeeId),
      with: {
        managerAssessments: {
          columns: { id: true, noteDate: true, note: true },
          with: { author: { columns: { fullName: true, email: true } } },
          orderBy: (n) => [desc(n.noteDate)],
        },
      },
      orderBy: (t) => [desc(t.createdAt)],
    }),
  ]);

  if (!employee) notFound();

  return (
    <div>
      <PageHeader title="Çalışanı Düzenle" description={employee.fullName} />
      <Card>
        <EditEmployeeForm employee={employee} departments={depList} branches={branchList} />
      </Card>

      <Card
        title="Yönetici Notları"
        description="Bölüm 5 Faz1.5 madde 21 — bölüm yöneticisinin (/yonetici) bu çalışan için girdiği serbest metin notlar, salt-okunur."
      >
        {notes.length === 0 ? (
          <EmptyState text="Henüz yönetici notu girilmedi." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notes.map((n) => (
              <div key={n.id} style={{ background: "var(--paper-deep)", borderRadius: 4, padding: "10px 12px", fontSize: 12.5 }}>
                <div className="mono" style={{ fontSize: 10.5, color: "#6b7280", marginBottom: 4 }}>
                  {n.noteDate} — {n.author?.fullName ?? n.author?.email ?? "—"}
                </div>
                <div style={{ whiteSpace: "pre-wrap" }}>{n.note}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card
        title="Eğitim ve Gelişim"
        description='komut1.md Faz 1.6 madde 25 — eğitim kayıtları ve "tamamlandı" olanlar için bölüm yöneticisinin girdiği gelişim değerlendirmesi.'
      >
        {employeeTrainings.length === 0 ? (
          <EmptyState text="Henüz eğitim kaydı eklenmedi." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {employeeTrainings.map((t) => (
              <div key={t.id} style={{ background: "var(--paper-deep)", borderRadius: 4, padding: "10px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 12.5 }}>{t.trainingName}</span>
                  <Badge tone="default">{t.trainingField}</Badge>
                  <Badge tone={t.status === "tamamlandi" ? "pine" : "thread"}>{t.status === "tamamlandi" ? "Tamamlandı" : "Tamamlanmadı"}</Badge>
                  {t.completedDate && <span className="mono" style={{ fontSize: 10.5, color: "#6b7280" }}>{t.completedDate}</span>}
                </div>
                {t.status === "tamamlandi" && (
                  <div style={{ marginTop: 6 }}>
                    {t.managerAssessments.length === 0 ? (
                      <div style={{ fontSize: 11.5, color: "#9ca3af" }}>Bölüm yöneticisi tarafından henüz değerlendirme girilmedi.</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {t.managerAssessments.map((a) => (
                          <div key={a.id} style={{ background: "#fff", borderRadius: 4, padding: "8px 10px", fontSize: 12.5 }}>
                            <div className="mono" style={{ fontSize: 10.5, color: "#6b7280", marginBottom: 3 }}>
                              {a.noteDate} — {a.author?.fullName ?? a.author?.email ?? "—"}
                            </div>
                            <div style={{ whiteSpace: "pre-wrap" }}>{a.note}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
