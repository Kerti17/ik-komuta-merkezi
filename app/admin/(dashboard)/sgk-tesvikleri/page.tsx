import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { employees, sgkIncentiveRules } from "@/db/schema";
import { matchIncentiveRules } from "@/lib/sgk-incentives";
import { Card, Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { SgkIncentiveRuleForm } from "./SgkIncentiveRuleForm";
import { deleteSgkIncentiveRuleAction, toggleSgkIncentiveRuleActiveAction } from "./actions";

const fmtTL = (n: number) => n.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

function criteriaSummary(r: { ageMin: number | null; ageMax: number | null; gender: string | null; requiresDisability: boolean; region: string | null }) {
  const parts: string[] = [];
  if (r.ageMin != null || r.ageMax != null) parts.push(`Yaş ${r.ageMin ?? "?"}–${r.ageMax ?? "?"}`);
  if (r.gender) parts.push(r.gender === "kadin" ? "Kadın" : "Erkek");
  if (r.requiresDisability) parts.push("Engellilik gerektirir");
  if (r.region) parts.push(`Bölge: ${r.region}`);
  return parts.length > 0 ? parts.join(" · ") : "Kriter yok (herkese açık)";
}

export default async function SgkTesviklerPage() {
  const todayIso = new Date().toISOString().slice(0, 10);

  const [rules, activeEmployees] = await Promise.all([
    db.select().from(sgkIncentiveRules).orderBy(asc(sgkIncentiveRules.name)),
    db.query.employees.findMany({ where: eq(employees.status, "aktif"), with: { branch: true } }),
  ]);

  const employeesForMatching = activeEmployees.map((e) => ({
    id: e.id,
    fullName: e.fullName,
    branchName: e.branch?.name ?? "—",
    birthDate: e.birthDate,
    gender: e.gender,
  }));

  const rulesWithMatches = matchIncentiveRules(
    rules.filter((r) => r.isActive),
    employeesForMatching,
    todayIso
  );
  const matchesByRuleId = new Map(rulesWithMatches.map((r) => [r.id, r]));

  return (
    <div>
      <PageHeader
        title="SGK Teşvik Motoru"
        description={
          <>
            Statik bir liste değil — teşvik tanımlarını kendiniz ekler, düzenler, pasife alırsınız. Sistem aktif çalışanlarla otomatik uygunluk
            önerisi sunar; <b>son onay her zaman sizde kalır</b>, özellikle engellilik ve bölge kriterleri sistemde çalışan bazında tutulmadığı
            için elle doğrulama gerektirir.
          </>
        }
      />

      <Card title="Yeni Teşvik Kuralı Ekle">
        <SgkIncentiveRuleForm />
      </Card>

      <Card title={`Teşvik Kuralları (${rules.length})`}>
        {rules.length === 0 ? (
          <EmptyState text="Henüz teşvik kuralı tanımlanmadı." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {rules.map((r) => {
              const match = matchesByRuleId.get(r.id);
              return (
                <div key={r.id} style={{ border: "1px solid var(--line)", borderRadius: 6, padding: "14px 16px", opacity: r.isActive ? 1 : 0.6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</span>
                        <Badge tone={r.isActive ? "pine" : "default"}>{r.isActive ? "Aktif" : "Pasif"}</Badge>
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{criteriaSummary(r)}</div>
                      {(r.estimatedAmount != null || r.estimatedRatePercent != null) && (
                        <div className="mono" style={{ fontSize: 11.5, color: "var(--pine)", marginTop: 3 }}>
                          {r.estimatedAmount != null ? fmtTL(r.estimatedAmount) + "/ay" : ""}
                          {r.estimatedAmount != null && r.estimatedRatePercent != null ? " · " : ""}
                          {r.estimatedRatePercent != null ? `%${r.estimatedRatePercent}` : ""}
                        </div>
                      )}
                      {r.description && <div style={{ fontSize: 12, color: "#374151", marginTop: 6 }}>{r.description}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <Link
                        href={`/admin/sgk-tesvikleri/${r.id}`}
                        className="mono"
                        style={{
                          padding: "4px 9px",
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: "var(--ink)",
                          border: "1px solid var(--line)",
                          borderRadius: 4,
                          textDecoration: "none",
                        }}
                      >
                        Düzenle
                      </Link>
                      <form action={toggleSgkIncentiveRuleActiveAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="nextActive" value={(!r.isActive).toString()} />
                        <button
                          type="submit"
                          className="mono"
                          style={{
                            padding: "4px 9px",
                            fontSize: 10.5,
                            fontWeight: 700,
                            background: "transparent",
                            color: "var(--ink)",
                            border: "1px solid var(--line)",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          {r.isActive ? "Pasife Al" : "Aktifleştir"}
                        </button>
                      </form>
                      <form action={deleteSgkIncentiveRuleAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <DeleteButton confirmText={`"${r.name}" teşvik kuralını silmek istediğinize emin misiniz?`} />
                      </form>
                    </div>
                  </div>

                  {r.isActive && match && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--line)" }}>
                      {match.matches.length === 0 ? (
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>Kriterlere uyan aktif çalışan bulunamadı.</div>
                      ) : (
                        <>
                          <div className="mono" style={{ fontSize: 10.5, color: "#6b7280", marginBottom: 6, letterSpacing: "0.04em" }}>
                            UYGUNLUK ÖNERİSİ — {match.eligibleCount} UYGUN · {match.reviewCount} KONTROL GEREKLİ
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {match.matches.map((m) => (
                              <span
                                key={m.employeeId}
                                title={m.reasons.join(" · ") || undefined}
                                className="mono"
                                style={{
                                  fontSize: 11,
                                  padding: "3px 8px",
                                  borderRadius: 10,
                                  background: m.verdict === "uygun" ? "#DCEADF" : "#F5E9CC",
                                  color: m.verdict === "uygun" ? "var(--pine)" : "#9C7418",
                                }}
                              >
                                {m.employeeName}
                                {m.verdict === "kontrol_gerekli" ? " ⚠" : ""}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
