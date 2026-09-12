import { desc } from "drizzle-orm";
import { db } from "@/db";
import { trainings } from "@/db/schema";
import { getActiveEmployeeOptions } from "@/lib/employees";
import { Card, Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { TrainingForm } from "./TrainingForm";
import { CompleteTrainingForm } from "./CompleteTrainingForm";
import { reopenTrainingAction, deleteTrainingAction } from "./actions";

export default async function EgitimlerPage() {
  const [employeeOptions, list] = await Promise.all([
    getActiveEmployeeOptions(),
    db.query.trainings.findMany({
      with: {
        employee: { columns: { fullName: true } },
        managerAssessments: {
          columns: { id: true, noteDate: true, note: true },
          with: { author: { columns: { fullName: true, email: true } } },
          orderBy: (n) => [desc(n.noteDate)],
        },
      },
      orderBy: (t) => [desc(t.createdAt)],
    }),
  ]);

  const existingFields = Array.from(new Set(list.map((t) => t.trainingField))).sort();

  return (
    <div>
      <PageHeader
        title="Eğitim ve Gelişim"
        description={
          <>
            Eğitim adı ve alanı/kategorisi serbest metindir, sabit bir listeye bağlı değildir. Bir eğitim "tamamlandı" olarak işaretlenince,
            çalışanın bölüm yöneticisi (/yonetici) o eğitime özel bir gelişim değerlendirmesi girebilir — buradan görünür olur.
          </>
        }
      />

      <Card title="Yeni Eğitim Kaydı Ekle">
        {employeeOptions.length === 0 ? <EmptyState text="Önce Çalışanlar sayfasından aktif çalışan ekleyin." /> : <TrainingForm employees={employeeOptions} existingFields={existingFields} />}
      </Card>

      <Card title={`Eğitim Kayıtları (${list.length})`}>
        {list.length === 0 ? (
          <EmptyState text="Henüz eğitim kaydı eklenmedi." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {list.map((t) => (
              <div key={t.id} style={{ border: "1px solid var(--line)", borderRadius: 6, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{t.trainingName}</span>
                      <Badge tone="default">{t.trainingField}</Badge>
                      <Badge tone={t.status === "tamamlandi" ? "pine" : "thread"}>{t.status === "tamamlandi" ? "Tamamlandı" : "Tamamlanmadı"}</Badge>
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>
                      {t.employee?.fullName ?? "—"}
                      {t.status === "tamamlandi" && t.completedDate ? ` · Tamamlanma: ${t.completedDate}` : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
                    {t.status === "tamamlanmadi" ? (
                      <CompleteTrainingForm trainingId={t.id} />
                    ) : (
                      <form action={reopenTrainingAction}>
                        <input type="hidden" name="id" value={t.id} />
                        <button
                          type="submit"
                          className="mono"
                          style={{
                            padding: "5px 10px",
                            fontSize: 10.5,
                            fontWeight: 700,
                            background: "transparent",
                            color: "var(--ink)",
                            border: "1px solid var(--line)",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          Geri Al
                        </button>
                      </form>
                    )}
                    {t.managerAssessments.length === 0 && (
                      <form action={deleteTrainingAction}>
                        <input type="hidden" name="id" value={t.id} />
                        <DeleteButton confirmText={`"${t.trainingName}" eğitim kaydını silmek istediğinize emin misiniz?`} />
                      </form>
                    )}
                  </div>
                </div>

                {t.status === "tamamlandi" && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--line)" }}>
                    <div className="mono" style={{ fontSize: 10.5, color: "#6b7280", marginBottom: 6, letterSpacing: "0.04em" }}>
                      EĞİTİM SONRASI GELİŞİM DEĞERLENDİRMESİ
                    </div>
                    {t.managerAssessments.length === 0 ? (
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>Bölüm yöneticisi tarafından henüz değerlendirme girilmedi.</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {t.managerAssessments.map((a) => (
                          <div key={a.id} style={{ background: "var(--paper-deep)", borderRadius: 4, padding: "8px 10px", fontSize: 12.5 }}>
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
