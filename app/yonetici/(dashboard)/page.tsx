import { asc, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { employees, trainings } from "@/db/schema";
import { Card, Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { NoteForm } from "./NoteForm";
import { TrainingAssessmentForm } from "./TrainingAssessmentForm";

export const dynamic = "force-dynamic";

export default async function YoneticiPage() {
  const session = await auth();
  // proxy.ts zaten role/departmentId kontrolu yapiyor - burasi sadece
  // savunmaci bir bosluk (departmentId hicbir sekilde null olmamali).
  if (!session?.user || session.user.departmentId == null) {
    return <EmptyState text="Departman bilginiz bulunamadı. İK ile iletişime geçin." />;
  }

  // KVKK notu (Bolum 5 Faz1.5 madde 22): dogum tarihi/cinsiyet/emekli durumu
  // admin/Ik rolune sinirlanmali, bolum yoneticisi ekraninda GOSTERILMEMELI.
  // Bu yuzden `columns` ile SADECE bu ekranin gosterdigi alanlar cekilir -
  // "render etmiyoruz zaten" varsayimina degil, sorgu seviyesinde acikca
  // dislama listesine dayanir (author icin de ayni sebeple passwordHash/role
  // gibi hassas alanlar cekilmez).
  const deptEmployees = await db.query.employees.findMany({
    where: eq(employees.departmentId, session.user.departmentId),
    columns: { id: true, fullName: true, collarType: true, status: true },
    with: {
      department: { columns: { name: true } },
      managerNotes: {
        columns: { id: true, noteDate: true, note: true },
        with: { author: { columns: { fullName: true, email: true } } },
        orderBy: (n) => [desc(n.noteDate)],
      },
      // Sadece tamamlanmis egitimler icin gelisim degerlendirmesi girilebilir
      // (madde 25c) - bkz. yonetici/actions.ts createTrainingAssessmentAction.
      trainings: {
        where: eq(trainings.status, "tamamlandi"),
        columns: { id: true, trainingName: true, trainingField: true, completedDate: true },
        with: {
          managerAssessments: {
            columns: { id: true, noteDate: true, note: true },
            with: { author: { columns: { fullName: true, email: true } } },
            orderBy: (n) => [desc(n.noteDate)],
          },
        },
        orderBy: (t) => [desc(t.completedDate)],
      },
    },
    orderBy: (e) => [asc(e.fullName)],
  });

  const activeEmployees = deptEmployees.filter((e) => e.status === "aktif");
  const departmentName = activeEmployees[0]?.department?.name ?? deptEmployees[0]?.department?.name ?? "Departmanınız";

  return (
    <div>
      <PageHeader
        title={departmentName}
        description="Sadece kendi departmanınızdaki çalışanları görüyorsunuz. Girdiğiniz notlar İK'nın panelinde çalışan detayında görünür."
      />

      {activeEmployees.length === 0 ? (
        <Card>
          <EmptyState text="Departmanınızda aktif çalışan bulunamadı." />
        </Card>
      ) : (
        activeEmployees.map((e) => (
          <Card key={e.id} title={e.fullName} description={e.collarType === "mavi" ? "Mavi Yaka" : "Beyaz Yaka"}>
            {e.managerNotes.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 4 }}>
                {e.managerNotes.map((n) => (
                  <div key={n.id} style={{ background: "var(--paper-deep)", borderRadius: 4, padding: "8px 10px", fontSize: 12.5 }}>
                    <div className="mono" style={{ fontSize: 10.5, color: "#6b7280", marginBottom: 3 }}>
                      {n.noteDate} — {n.author?.fullName ?? n.author?.email ?? "—"}
                    </div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{n.note}</div>
                  </div>
                ))}
              </div>
            )}
            <NoteForm employeeId={e.id} />

            {e.trainings.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="mono" style={{ fontSize: 10.5, color: "#6b7280", letterSpacing: "0.04em" }}>
                  TAMAMLANMIŞ EĞİTİMLER — GELİŞİM DEĞERLENDİRMESİ
                </div>
                {e.trainings.map((t) => (
                  <div key={t.id} style={{ background: "var(--paper-deep)", borderRadius: 4, padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 12.5 }}>{t.trainingName}</span>
                      <Badge tone="default">{t.trainingField}</Badge>
                      {t.completedDate && <span className="mono" style={{ fontSize: 10.5, color: "#6b7280" }}>{t.completedDate}</span>}
                    </div>
                    {t.managerAssessments.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 4 }}>
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
                    <TrainingAssessmentForm employeeId={e.id} trainingId={t.id} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
