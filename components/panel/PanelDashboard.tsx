"use client";

// /panel dashboard - Faz 1 modulleri (bkz. claude-code-talimati.md Bolum 5,
// bellek notu "ik-komuta-merkezi-durum"). Gorsel/islevsel referans:
// ik-komuta-merkezi.jsx. Veri lib/panel-data.ts'te sunucuda hazirlanir; bu
// bilesen sadece yaka/sube filtresine gore YENIDEN GRUPLAMA gerektiren iki
// bolumu (kadro kompozisyonu, departman bazli devamsizlik) client'ta hesaplar.
import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Wallet,
  ShieldAlert,
  Building2,
  Moon,
  Activity,
  Siren,
  Palmtree,
  ClipboardCheck,
  Scale,
  Trophy,
  FileWarning,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  UserX,
  Gauge,
  GraduationCap,
  Landmark,
  Rocket,
  BanknoteX,
} from "lucide-react";
import type { PanelDashboardData } from "@/lib/panel-data";
import { KpiCard, SectionCard, MiniStat, ThreadRule, Badge, DataTable, InsightNote, fmtTL } from "./ui";

const CHART_LINE = "#d8d2c0"; // var(--line) sabit deger - recharts SVG props CSS var() kabul etmiyor
const CHART_THREAD = "#d4a017";
const CHART_DENIM = "#2a4f82";
const CHART_BRICK = "#b23a2e";
const CHART_PINE = "#327355";

const STAGE_LABELS: Record<string, string> = {
  deneme: "Deneme Süresi",
  "6_ay": "İlk 6 Ay",
  "1_yil": "İlk 1 Yıl",
  yillik: "Yıllık",
  alti_aylik: "6 Aylık",
};
const STATUS_STYLE: Record<string, { label: string; tone: "thread" | "brick" | "pine" | "default" }> = {
  bekliyor: { label: "Bekliyor", tone: "thread" },
  acil: { label: "ACİL — Karar Bekliyor", tone: "brick" },
  gecikti: { label: "Süre Geçti", tone: "brick" },
  devam: { label: "Devam — Onaylandı", tone: "pine" },
  sonlandirildi: { label: "Sonlandırıldı", tone: "default" },
};
const DISCIPLINARY_LABELS: Record<string, string> = {
  sozlu_uyari: "Sözlü Uyarı",
  yazili_uyari: "Yazılı Uyarı",
  devamsizlik_tutanagi: "Devamsızlık Tutanağı",
  diger: "Diğer",
};
const RISK_BAND_STYLE: Record<string, { label: string; tone: "brick" | "thread" | "pine" }> = {
  yuksek: { label: "Yüksek Risk", tone: "brick" },
  orta: { label: "Orta Risk", tone: "thread" },
  dusuk: { label: "Düşük Risk", tone: "pine" },
};

function avgScore(ev: { competencyScore: number | null; adaptationScore: number | null; performanceScore: number | null }) {
  if (ev.competencyScore == null || ev.adaptationScore == null || ev.performanceScore == null) return null;
  return Math.round((ev.competencyScore + ev.adaptationScore + ev.performanceScore) / 3);
}

export function PanelDashboard({ data }: { data: PanelDashboardData }) {
  const [collarFilter, setCollarFilter] = useState<"tumu" | "mavi" | "beyaz">("tumu");
  const [branchFilter, setBranchFilter] = useState("Tümü");

  const filteredEmployees = useMemo(
    () =>
      data.employeeSummaries
        .filter((e) => collarFilter === "tumu" || e.collarType === collarFilter)
        .filter((e) => branchFilter === "Tümü" || e.branchName === branchFilter),
    [data.employeeSummaries, collarFilter, branchFilter]
  );

  const departmentBreakdown = useMemo(() => {
    const byDept = new Map<string, { name: string; collarType: "mavi" | "beyaz"; count: number; attendanceDays: number }>();
    for (const e of filteredEmployees) {
      const key = `${e.departmentId}`;
      const existing = byDept.get(key);
      if (existing) {
        existing.count += 1;
        existing.attendanceDays += e.attendanceDays;
        if (existing.collarType !== e.collarType) existing.collarType = "mavi"; // karma departman - carta gorsel amacli tek renge duser
      } else {
        byDept.set(key, { name: e.departmentName, collarType: e.collarType, count: 1, attendanceDays: e.attendanceDays });
      }
    }
    return [...byDept.values()]
      .map((d) => ({ ...d, attendanceDays: Math.round(d.attendanceDays * 10) / 10 }))
      .sort((a, b) => b.attendanceDays - a.attendanceDays);
  }, [filteredEmployees]);

  const blueCount = filteredEmployees.filter((e) => e.collarType === "mavi").length;
  const whiteCount = filteredEmployees.length - blueCount;
  const pieData = [
    { name: "Beyaz Yaka", value: whiteCount, color: CHART_DENIM },
    { name: "Mavi Yaka", value: blueCount, color: CHART_THREAD },
  ].filter((p) => p.value > 0);

  const branchOptions = ["Tümü", ...data.branchNames];
  const thisMonth = data.turnoverTrend[data.turnoverTrend.length - 1];
  const exitCostTotal = data.exitCost.mavi.annualTotal + data.exitCost.beyaz.annualTotal;

  // ---- Genel Rapor/Sunum PDF Disa Aktarma (Bolum 5 madde 17) ----
  // Patron Raporu'ndan (/panel/rapor, sabit tek sayfalik ozet) AYRI bir ozellik:
  // Ik, panelin herhangi bir bolumunun yanindaki "PDF'e Aktar" butonuna basarak
  // SADECE o bolumu yazdirma diyaloguna gonderebilir (MVP - Bolum 8'deki
  // window.print() sinirlamasi burada da gecerli). Diger her sey (KPI kartlari,
  // filtreler, diger bolumler) .no-print ile gizlenir, yerine sirket adi + bolum
  // basligi + tarih iceren gecici bir baslik (.print-only-header) eklenir.
  const [pdfSection, setPdfSection] = useState<string | null>(null);
  const [pdfSectionTitle, setPdfSectionTitle] = useState("");
  const isExporting = pdfSection !== null;
  const chromeClass = isExporting ? "no-print" : undefined;
  const sectionClass = (id: string) => (isExporting && pdfSection !== id ? "no-print" : undefined);
  const exportPdf = (id: string, title: string) => {
    setPdfSectionTitle(title);
    setPdfSection(id);
  };

  useEffect(() => {
    const resetAfterPrint = () => setPdfSection(null);
    window.addEventListener("afterprint", resetAfterPrint);
    return () => window.removeEventListener("afterprint", resetAfterPrint);
  }, []);

  useEffect(() => {
    if (!pdfSection) return;
    // no-print class'larinin DOM'a yazilmasini bekleyip sonra yazdirma
    // diyalogunu ac - ayni tick'te cagrilirsa henuz commit edilmemis olabilir.
    const timer = setTimeout(() => window.print(), 50);
    return () => clearTimeout(timer);
  }, [pdfSection]);

  const todayLabel = new Date().toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div style={{ padding: "24px 32px 48px", maxWidth: 1180, margin: "0 auto" }}>
      {/* Tek-bolum PDF disa aktarma basligi - sadece yazdirma ciktisinda gorunur (bkz. .print-only-header) */}
      {isExporting && (
        <div className="print-only-header" style={{ marginBottom: 20 }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--thread-deep)", letterSpacing: "0.12em", marginBottom: 6 }}>
            {data.companyName.toUpperCase()} — {todayLabel.toUpperCase()}
          </div>
          <h1 className="disp" style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
            {pdfSectionTitle}
          </h1>
        </div>
      )}

      {/* Kritik Rol & Yedekleme uyarısı (Bölüm 5 madde 18) - yedeği olmayan
          kritik pozisyonlar varsa en üstte, KPI kartlarından önce gösterilir. */}
      {data.criticalRoleWarnings.length > 0 && (
        <SectionCard
          title="Kritik Rol & Yedekleme Uyarısı"
          sub="Yedeği tanımlanmamış kritik pozisyonlar — bu kişiler ayrılırsa operasyon durabilir"
          icon={<UserX size={15} color="var(--brick)" />}
          style={{ marginBottom: 20, borderColor: "#EAC5BC" }}
          className={sectionClass("kritik-rol-yedek")}
          onExportPdf={() => exportPdf("kritik-rol-yedek", "Kritik Rol & Yedekleme Uyarısı")}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.criticalRoleWarnings.map((w) => (
              <div key={w.id} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "#FBF2EF", borderRadius: 4, fontSize: 13, lineHeight: 1.5 }}>
                <AlertTriangle size={15} color="var(--brick)" style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                  <b>{w.roleName}</b> pozisyonu için yedek personel yok — <b>{w.employeeName}</b> ayrılırsa operasyon durabilir.
                  {w.backupStatus && <span style={{ color: "#6b7280" }}> ({w.backupStatus})</span>}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* TIS ve Sendika uyarisi (komut1.md Faz 1.6 madde 26) - kidem esigi
          takibindeki gibi, esik gun sayisi (varsayilan 90) kala gorunur olur. */}
      {data.collectiveAgreementWarnings.length > 0 && (
        <SectionCard
          title="TİS ve Sendika Uyarısı"
          sub="Toplu iş sözleşmesi süresi yaklaşan veya dolmuş kapsamlar"
          icon={<Landmark size={15} color="var(--brick)" />}
          style={{ marginBottom: 20, borderColor: "#EAC5BC" }}
          className={sectionClass("tis-sendika")}
          onExportPdf={() => exportPdf("tis-sendika", "TİS ve Sendika Uyarısı")}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.collectiveAgreementWarnings.map((w) => (
              <div key={w.id} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "#FBF2EF", borderRadius: 4, fontSize: 13, lineHeight: 1.5 }}>
                <AlertTriangle size={15} color="var(--brick)" style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                  <b>{w.unionName}</b> TİS'i ({w.coveredEmployeeCount} çalışanı kapsıyor) —{" "}
                  {w.remainingDays < 0 ? (
                    <b>{Math.abs(w.remainingDays)} gün önce süresi doldu</b>
                  ) : w.remainingDays === 0 ? (
                    <b>bugün sona eriyor</b>
                  ) : (
                    <>
                      bitiş tarihine <b>{w.remainingDays} gün</b> kaldı
                    </>
                  )}{" "}
                  <span style={{ color: "#6b7280" }}>({w.agreementEndDate})</span>
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* KPI kartları */}
      <div className={chromeClass} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 28 }}>
        <KpiCard
          icon={<Users size={16} />}
          label="Toplam Çalışan"
          value={filteredEmployees.length}
          sub={`${whiteCount} beyaz · ${blueCount} mavi yaka`}
        />
        <KpiCard
          icon={<TrendingUp size={16} />}
          label="Bu Ay Mavi Yaka Devir Hızı"
          value={thisMonth ? `%${thisMonth.blueRate}` : "—"}
          tone="brick"
        />
        <KpiCard
          icon={<TrendingDown size={16} />}
          label="Bu Ay Beyaz Yaka Devir Hızı"
          value={thisMonth ? `%${thisMonth.whiteRate}` : "—"}
          tone="pine"
        />
        <KpiCard
          icon={<Wallet size={16} />}
          label="Yıllık İşten Çıkış Maliyeti"
          value={fmtTL(exitCostTotal)}
          sub="Boş pozisyon + işe alım + oryantasyon + KKD"
          tone="thread"
        />
        <KpiCard
          icon={<ShieldAlert size={16} />}
          label="Kıdem Eşiğine ≤30 Gün"
          value={data.upcomingSeniorityCount}
          sub={`${data.pendingEvaluationCount} değerlendirme karar bekliyor`}
          tone="brick"
        />
        <KpiCard
          icon={<Gauge size={16} />}
          label="Yüksek Riskli Çalışan"
          value={data.highRiskCount}
          sub="Ayrılma riski skoru ≥70"
          tone="brick"
        />
      </div>

      {/* Filtreler */}
      <div className={chromeClass} style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        {[
          { k: "tumu" as const, label: "Tüm Kadro" },
          { k: "beyaz" as const, label: "Beyaz Yaka" },
          { k: "mavi" as const, label: "Mavi Yaka" },
        ].map((f) => (
          <button
            key={f.k}
            onClick={() => setCollarFilter(f.k)}
            className="mono"
            style={{
              padding: "7px 16px",
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 3,
              border: `1px solid ${collarFilter === f.k ? "var(--ink)" : "var(--line)"}`,
              background: collarFilter === f.k ? "var(--ink)" : "transparent",
              color: collarFilter === f.k ? "var(--paper)" : "var(--ink)",
              cursor: "pointer",
            }}
          >
            {f.label}
          </button>
        ))}
        <div style={{ width: 1, height: 20, background: "var(--line)", margin: "0 4px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Building2 size={13} color="#6b7280" />
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="mono"
            style={{
              padding: "7px 10px",
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 3,
              border: "1px solid var(--line)",
              background: "#fff",
              color: "var(--ink)",
              cursor: "pointer",
            }}
          >
            {branchOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ayrılma Riski Skoru (Bölüm 5 madde 19) */}
      <SectionCard
        title="Ayrılma Riski Skoru"
        sub="0-100 arası ağırlıklı skor — devamsızlık trendi, fazla mesai yükü, tutanak sayısı, kıdem ve birikmiş izin sinyallerinden hesaplanır. En riskli çalışan en üstte."
        icon={<Gauge size={15} color="var(--brick)" />}
        style={{ marginTop: 16 }}
        className={sectionClass("ayrilma-riski")}
        onExportPdf={() => exportPdf("ayrilma-riski", "Ayrılma Riski Skoru")}
      >
        {data.riskScores.length === 0 ? (
          <EmptyState text="Aktif çalışan bulunamadı." />
        ) : (
          <DataTable head={["Çalışan", "Departman", "Skor", "Risk", "Devamsızlık", "Mesai", "Tutanak", "Kıdem", "İzin"]}>
            {data.riskScores.map((r) => {
              const band = RISK_BAND_STYLE[r.band];
              const signalCell = (value: number) => (
                <td className="mono" style={{ padding: "9px 10px", fontSize: 11.5, color: "#6b7280", textAlign: "left" }}>
                  {value}
                </td>
              );
              return (
                <tr key={r.employeeId} style={{ borderBottom: "1px solid var(--line)", background: r.band === "yuksek" ? "#FBF2EF" : "transparent" }}>
                  <td style={{ padding: "9px 10px", fontWeight: 600 }}>{r.employeeName}</td>
                  <td style={{ padding: "9px 10px", color: "#4b5563" }}>{r.departmentName}</td>
                  <td className="disp" style={{ padding: "9px 10px", fontWeight: 800, fontSize: 15 }}>
                    {r.score}
                  </td>
                  <td style={{ padding: "9px 10px" }}>
                    <Badge tone={band.tone}>{band.label}</Badge>
                  </td>
                  {signalCell(r.signals.attendanceTrend)}
                  {signalCell(r.signals.overtimeLoad)}
                  {signalCell(r.signals.disciplinaryCount)}
                  {signalCell(r.signals.lowSeniority)}
                  {signalCell(r.signals.accruedLeave)}
                </tr>
              );
            })}
          </DataTable>
        )}
        <InsightNote>
          v1 formülü — ağırlıklar (varsayılan %30/%20/%20/%15/%15) Ayarlar sayfasından değiştirilebilir. Bu ilk versiyon; gerçek kullanımla hangi
          sinyallerin ayrılmayı daha iyi öngördüğü zamanla kalibre edilmelidir.
        </InsightNote>
      </SectionCard>

      {/* Devir trendi */}
      <SectionCard
        title="Aylık Devir Hızı Trendi"
        sub="Son 12 ay — o ay başındaki kadroya oranla ayrılış sayısı"
        className={sectionClass("devir-hizi")}
        onExportPdf={() => exportPdf("devir-hizi", "Aylık Devir Hızı Trendi")}
      >
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data.turnoverTrend} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid stroke={CHART_LINE} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={{ stroke: CHART_LINE }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: `1px solid ${CHART_LINE}` }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="blueRate" name="Mavi Yaka" stroke={CHART_THREAD} strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="whiteRate" name="Beyaz Yaka" stroke={CHART_DENIM} strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Devir Maliyeti Özeti (Bölüm 5 Faz2 madde 23) */}
      <SectionCard
        title="Devir Maliyeti Özeti"
        sub="Aylık devir hızı trendi × işten çıkış maliyeti hesaplayıcısındaki kişi başı maliyet — gerçek ayrılış sayısıyla çarpılır"
        icon={<Wallet size={15} />}
        style={{ marginTop: 16 }}
        className={sectionClass("devir-maliyeti")}
        onExportPdf={() => exportPdf("devir-maliyeti", "Devir Maliyeti Özeti")}
      >
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.turnoverCostTrend} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
            <CartesianGrid stroke={CHART_LINE} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={{ stroke: CHART_LINE }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${Math.round(v / 1000)}b`} />
            <Tooltip formatter={(v) => fmtTL(Number(v))} contentStyle={{ fontSize: 12, borderRadius: 4, border: `1px solid ${CHART_LINE}` }} />
            <Bar dataKey="cost" name="Devir Maliyeti" fill={CHART_BRICK} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        {data.departmentTurnoverCosts.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <DataTable head={["Departman", "Son 12 Ayda Ayrılan", "Toplam Devir Maliyeti"]}>
              {data.departmentTurnoverCosts.map((d) => (
                <tr key={d.departmentName} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "8px 10px", fontWeight: 600 }}>{d.departmentName}</td>
                  <td className="mono" style={{ padding: "8px 10px" }}>{d.terminatedCount}</td>
                  <td className="mono" style={{ padding: "8px 10px", fontWeight: 700, color: "var(--brick)" }}>{fmtTL(d.totalCost)}</td>
                </tr>
              ))}
            </DataTable>
          </div>
        )}
        <InsightNote>
          Bu özet ayrı bir maliyet varsayımı içermez — Ayarlar → Varsayılan Maliyet Kalemleri'ndeki kişi başı tutarları, o ayki/departmandaki gerçek
          ayrılış sayısıyla çarpar.
        </InsightNote>
      </SectionCard>

      {/* Çıkış Mülakatı Kök Neden Analizi (Bölüm 5 Faz2 madde 24) */}
      <SectionCard
        title="Çıkış Mülakatı — Kök Neden Analizi"
        sub="Admin → Çıkış Mülakatı'nda kaydedilen kategorilerin dağılımı — en sık neden en üstte"
        icon={<FileWarning size={15} color="var(--brick)" />}
        style={{ marginTop: 16 }}
        className={sectionClass("cikis-mulakati")}
        onExportPdf={() => exportPdf("cikis-mulakati", "Çıkış Mülakatı — Kök Neden Analizi")}
      >
        {data.exitReasonAnalysis.length === 0 ? (
          <EmptyState text="Henüz çıkış mülakatı kaydedilmedi." />
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(140, data.exitReasonAnalysis.length * 34)}>
            <BarChart data={data.exitReasonAnalysis} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={CHART_LINE} horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="category" width={180} tick={{ fontSize: 11, fill: "#1b2333" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: `1px solid ${CHART_LINE}` }} />
              <Bar dataKey="count" name="Mülakat Sayısı" fill={CHART_BRICK} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginTop: 16 }}>
        {/* Departman devamsızlık */}
        <SectionCard
          title="Departman Bazında Devamsızlık (Gün)"
          sub="Son 12 ay toplam devamsızlık/rapor gün sayısı"
          className={sectionClass("departman-devamsizlik")}
          onExportPdf={() => exportPdf("departman-devamsizlik", "Departman Bazında Devamsızlık (Gün)")}
        >
          {departmentBreakdown.length === 0 ? (
            <EmptyState text="Filtreye uyan çalışan bulunamadı." />
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(180, departmentBreakdown.length * 32)}>
              <BarChart data={departmentBreakdown} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={CHART_LINE} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: "#1b2333" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: `1px solid ${CHART_LINE}` }} />
                <Bar dataKey="attendanceDays" name="Devamsızlık (gün)" radius={[0, 3, 3, 0]}>
                  {departmentBreakdown.map((d, i) => (
                    <Cell key={i} fill={d.collarType === "mavi" ? CHART_THREAD : CHART_DENIM} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* Kadro kompozisyonu */}
        <SectionCard
          title="Kadro Kompozisyonu"
          sub={`${filteredEmployees.length} çalışan görüntüleniyor`}
          className={sectionClass("kadro-kompozisyon")}
          onExportPdf={() => exportPdf("kadro-kompozisyon", "Kadro Kompozisyonu")}
        >
          {pieData.length === 0 ? (
            <EmptyState text="Filtreye uyan çalışan bulunamadı." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {pieData.map((p, i) => (
                    <Cell key={i} fill={p.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: `1px solid ${CHART_LINE}` }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      {/* Değerlendirme takibi */}
      <SectionCard
        title="Deneme Süresi & Kıdem Öncesi Değerlendirme Takibi"
        sub="Kıdem tazminatı hakkı 1. yılda doğar — karar bu tarihten önce netleşmeli. En acil olan en üstte."
        icon={<ShieldAlert size={15} color="var(--brick)" />}
        style={{ marginTop: 16 }}
        className={sectionClass("degerlendirme")}
        onExportPdf={() => exportPdf("degerlendirme", "Deneme Süresi & Kıdem Öncesi Değerlendirme Takibi")}
      >
        {data.evaluations.length === 0 ? (
          <EmptyState text="Henüz değerlendirme planlanmadı." />
        ) : (
          <DataTable head={["Çalışan", "Departman", "Aşama", "Son Tarih", "Kalan Gün", "Durum", "Y / U / P"]}>
            {data.evaluations.map((ev) => {
              const stil = STATUS_STYLE[ev.status] ?? STATUS_STYLE.bekliyor;
              const avg = avgScore(ev);
              return (
                <tr key={ev.id} style={{ borderBottom: "1px solid var(--line)", background: ev.status === "gecikti" ? "#FBF2EF" : "transparent" }}>
                  <td style={{ padding: "9px 10px", fontWeight: 600 }}>{ev.employeeName}</td>
                  <td style={{ padding: "9px 10px", color: "#4b5563" }}>{ev.departmentName}</td>
                  <td style={{ padding: "9px 10px" }}>
                    <Badge tone={ev.stage === "1_yil" ? "brick" : "default"}>{STAGE_LABELS[ev.stage] ?? ev.stage}</Badge>
                  </td>
                  <td className="mono" style={{ padding: "9px 10px", color: "#4b5563" }}>
                    {ev.dueDate}
                  </td>
                  <td className="mono" style={{ padding: "9px 10px" }}>
                    {ev.remainingDays < 0 ? `${Math.abs(ev.remainingDays)} gün geçti` : `${ev.remainingDays} gün`}
                  </td>
                  <td style={{ padding: "9px 10px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {ev.status === "devam" && <CheckCircle2 size={12} color="var(--pine)" />}
                      {ev.status === "sonlandirildi" && <XCircle size={12} />}
                      <Badge tone={stil.tone}>{stil.label}</Badge>
                    </span>
                  </td>
                  <td className="mono" style={{ padding: "9px 10px", fontSize: 11, color: "#4b5563" }}>
                    {ev.competencyScore == null ? (
                      <span style={{ color: "#9ca3af" }}>Bekleniyor</span>
                    ) : (
                      <>
                        Y:{ev.competencyScore} · U:{ev.adaptationScore} · P:{ev.performanceScore}
                        {avg != null && (
                          <span className="disp" style={{ marginLeft: 6, fontWeight: 800, color: avg >= 60 ? "var(--pine)" : "var(--brick)" }}>
                            Ort. {avg}
                          </span>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </DataTable>
        )}
      </SectionCard>

      {/* Performans ve Kariyer Yönetimi (komut1.md Faz 1.6 madde 27c) */}
      <SectionCard
        title="Performans Trendi"
        sub="Son 12 ay — periyodik (yıllık/6 aylık, tüm kadro) değerlendirmelerin performans puanı ortalaması. İşe giriş süreci değerlendirmeleri (deneme/6 ay/1 yıl) tek seferlik olduğu için dahil edilmez."
        icon={<TrendingUp size={15} color="var(--pine)" />}
        style={{ marginTop: 16 }}
        className={sectionClass("performans-trendi")}
        onExportPdf={() => exportPdf("performans-trendi", "Performans Trendi")}
      >
        {data.performanceTrend.every((m) => m.sampleCount === 0) ? (
          <EmptyState text="Henüz tamamlanmış periyodik değerlendirme yok." />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.performanceTrend} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={CHART_LINE} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={{ stroke: CHART_LINE }} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => (v == null ? "Veri yok" : v)}
                contentStyle={{ fontSize: 12, borderRadius: 4, border: `1px solid ${CHART_LINE}` }}
              />
              <Line type="monotone" dataKey="avgPerformanceScore" name="Ort. Performans Puanı" stroke={CHART_PINE} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      <SectionCard
        title="Kariyer Planı Olan / Terfi Bekleyen Çalışanlar"
        sub="Hedef tarihe en yakın olan en üstte"
        icon={<Rocket size={15} color="var(--denim)" />}
        style={{ marginTop: 16 }}
        className={sectionClass("kariyer-plani")}
        onExportPdf={() => exportPdf("kariyer-plani", "Kariyer Planı Olan / Terfi Bekleyen Çalışanlar")}
      >
        {data.careerPlans.length === 0 ? (
          <EmptyState text="Henüz kariyer planı girilmedi." />
        ) : (
          <DataTable head={["Çalışan", "Departman", "Hedef Unvan", "Hedef Tarih", "Kalan Gün"]}>
            {data.careerPlans.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "9px 10px", fontWeight: 600 }}>{c.employeeName}</td>
                <td style={{ padding: "9px 10px", color: "#4b5563" }}>{c.departmentName}</td>
                <td style={{ padding: "9px 10px" }}>{c.targetTitle}</td>
                <td className="mono" style={{ padding: "9px 10px", color: "#4b5563" }}>
                  {c.targetDate}
                </td>
                <td className="mono" style={{ padding: "9px 10px" }}>
                  {c.remainingDays < 0 ? `${Math.abs(c.remainingDays)} gün geçti` : `${c.remainingDays} gün`}
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </SectionCard>

      {/* Icra Takip (komut1.md Faz 1.6 madde 29) */}
      <SectionCard
        title="İcra Takip"
        sub="Aktif icra dosyası olan çalışanlar — kalan bakiye ve durum toplam borç/kesinti üzerinden otomatik hesaplanır"
        icon={<BanknoteX size={15} color="var(--brick)" />}
        style={{ marginTop: 16 }}
        className={sectionClass("icra-takip")}
        onExportPdf={() => exportPdf("icra-takip", "İcra Takip")}
      >
        {data.activeGarnishments.length === 0 ? (
          <EmptyState text="Aktif icra dosyası bulunmuyor." />
        ) : (
          <DataTable head={["Çalışan", "Departman", "İcra Dairesi", "Dosya No", "Toplam Borç", "Kalan Bakiye", "Durum"]}>
            {data.activeGarnishments.map((g) => (
              <tr key={g.id} style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "9px 10px", fontWeight: 600 }}>{g.employeeName}</td>
                <td style={{ padding: "9px 10px", color: "#4b5563" }}>{g.departmentName}</td>
                <td style={{ padding: "9px 10px", color: "#4b5563" }}>{g.enforcementOffice}</td>
                <td className="mono" style={{ padding: "9px 10px", color: "#4b5563" }}>
                  {g.caseNumber}
                </td>
                <td className="mono" style={{ padding: "9px 10px" }}>
                  {fmtTL(g.totalDebt)}
                </td>
                <td className="mono" style={{ padding: "9px 10px", fontWeight: 700, color: "var(--brick)" }}>
                  {fmtTL(g.remainingBalance)}
                </td>
                <td style={{ padding: "9px 10px" }}>
                  <Badge tone="thread">Devam Ediyor</Badge>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </SectionCard>

      {/* İşten Çıkış Maliyeti Hesaplayıcı */}
      <SectionCard
        title="İşten Çıkış Maliyeti Hesaplayıcı"
        sub="Boş pozisyon + işe alım + oryantasyon verim kaybı + KKD/kıyafet-ekipman — son 12 aydaki ayrılış sayısıyla çarpılır"
        icon={<Wallet size={15} />}
        style={{ marginTop: 16 }}
        className={sectionClass("cikis-maliyeti")}
        onExportPdf={() => exportPdf("cikis-maliyeti", "İşten Çıkış Maliyeti Hesaplayıcı")}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {(["mavi", "beyaz"] as const).map((collar) => {
            const c = data.exitCost[collar];
            return (
              <div key={collar} style={{ border: "1px solid var(--line)", borderRadius: 4, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <Badge tone={collar === "mavi" ? "thread" : "denim"}>{collar === "mavi" ? "MAVİ YAKA" : "BEYAZ YAKA"}</Badge>
                  <span className="mono" style={{ fontSize: 11, color: "#6b7280" }}>{c.annualTurnoverCount} ayrılış/yıl</span>
                </div>
                <div style={{ display: "grid", gap: 6, fontSize: 12.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#4b5563" }}>Boş pozisyon ({c.vacancyDays ?? 0} gün × {fmtTL(c.dailyWage ?? 0)})</span>
                    <span className="mono">{fmtTL(c.vacancyCost)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#4b5563" }}>İşe alım süreci</span>
                    <span className="mono">{fmtTL(c.hiringCost)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#4b5563" }}>Oryantasyon verim kaybı</span>
                    <span className="mono">{fmtTL(c.onboardingLoss)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#4b5563" }}>KKD / kıyafet-ekipman</span>
                    <span className="mono">{fmtTL(c.ppeCost)}</span>
                  </div>
                </div>
                <ThreadRule style={{ margin: "12px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 6 }}>
                  <span>Kişi başı toplam</span>
                  <span className="mono" style={{ fontWeight: 700 }}>{fmtTL(c.totalPerHire)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 13, color: "#4b5563" }}>Yıllık tahmini toplam</span>
                  <span className="disp" style={{ fontSize: 20, fontWeight: 800, color: "var(--brick)" }}>
                    {fmtTL(c.annualTotal)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <InsightNote>
          Ayarlar sayfasında yapılandırılmamış (boş bırakılmış) kalemler <b>0 TL</b> kabul edilir — rakamlar eksik görünüyorsa Ayarlar → Varsayılan
          Maliyet Kalemleri&apos;ni tamamlayın.
        </InsightNote>
      </SectionCard>

      {/* Zorunlu istihdam (engelli) */}
      <SectionCard
        title="Zorunlu İstihdam (Engelli Çalışan) Takibi"
        sub="İş Kanunu m.30 — 50+ çalışanlı işyerlerinde %3 engelli çalıştırma zorunluluğu"
        icon={<ClipboardCheck size={15} color={data.disabilityQuota.gap > 0 ? "var(--brick)" : "var(--pine)"} />}
        style={{ marginTop: 16 }}
        className={sectionClass("engelli-kontenjan")}
        onExportPdf={() => exportPdf("engelli-kontenjan", "Zorunlu İstihdam (Engelli Çalışan) Takibi")}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <MiniStat label="Toplam Kadro" value={data.disabilityQuota.totalHeadcount} />
          <MiniStat label={`Yasal Kontenjan (%${Math.round(data.disabilityQuota.quotaPercentage * 100)})`} value={`${data.disabilityQuota.requiredCount} kişi`} />
          <MiniStat label="Mevcut Engelli Çalışan" value={data.disabilityQuota.currentDisabledCount} />
          <div style={{ background: data.disabilityQuota.gap > 0 ? "#F3D6CE" : "#DCEADF", borderRadius: 4, padding: "12px 14px" }}>
            <div className="mono" style={{ fontSize: 10, color: data.disabilityQuota.gap > 0 ? "var(--brick)" : "var(--pine)", marginBottom: 4, letterSpacing: "0.04em" }}>
              KONTENJAN AÇIĞI
            </div>
            <div className="disp" style={{ fontSize: 18, fontWeight: 700, color: data.disabilityQuota.gap > 0 ? "var(--brick)" : "var(--pine)" }}>
              {data.disabilityQuota.gap > 0 ? `${data.disabilityQuota.gap} kişi eksik` : "Kontenjan dolu"}
            </div>
          </div>
        </div>
        {data.disabilityQuota.gap > 0 && data.disabilityQuota.monthlyPenaltyRiskEstimate != null && (
          <InsightNote tone="brick">
            <AlertTriangle size={13} color="var(--brick)" style={{ display: "inline", marginRight: 4, verticalAlign: -2 }} />
            Mevcut açıkla aylık tahmini idari para cezası riski: <b>{fmtTL(data.disabilityQuota.monthlyPenaltyRiskEstimate)}</b>. Rakam admin
            panelde girilen tahminidir, güncel SGK tebliğine göre teyit edilmelidir.
          </InsightNote>
        )}
      </SectionCard>

      {/* Birikmiş yıllık izin takibi */}
      <SectionCard
        title="Birikmiş Yıllık İzin Takibi"
        sub={`Eşikler: ${data.leaveWarningThresholdDays}+ gün dikkat, ${data.leaveCriticalThresholdDays}+ gün kritik — ayrılıkta nakit ödeme yükümlülüğü taşır`}
        icon={<Palmtree size={15} color="var(--brick)" />}
        style={{ marginTop: 16 }}
        className={sectionClass("izin-bakiyesi")}
        onExportPdf={() => exportPdf("izin-bakiyesi", "Birikmiş Yıllık İzin Takibi")}
      >
        {data.leaveBalances.length === 0 ? (
          <EmptyState text="Eşiği aşan izin bakiyesi yok." />
        ) : (
          <DataTable head={["Çalışan", "Departman", "Hak Edilen", "Kullanılan", "Kalan (Birikmiş)", "Durum", "Tahmini Yükümlülük"]}>
            {data.leaveBalances.map((row) => (
              <tr key={row.employeeId} style={{ borderBottom: "1px solid var(--line)", background: row.severity === "kritik" ? "#FBF2EF" : "transparent" }}>
                <td style={{ padding: "9px 10px", fontWeight: 600 }}>{row.employeeName}</td>
                <td style={{ padding: "9px 10px", color: "#4b5563" }}>{row.departmentName}</td>
                <td className="mono" style={{ padding: "9px 10px" }}>{row.earnedDays} gün</td>
                <td className="mono" style={{ padding: "9px 10px" }}>{row.usedDays} gün</td>
                <td className="mono" style={{ padding: "9px 10px", fontWeight: 700 }}>{row.remainingDays} gün</td>
                <td style={{ padding: "9px 10px" }}>
                  <Badge tone={row.severity === "kritik" ? "brick" : "thread"}>{row.severity === "kritik" ? "ACİL — Kullandırılmalı" : "Planlanmalı"}</Badge>
                </td>
                <td className="mono" style={{ padding: "9px 10px", color: "#4b5563" }}>{fmtTL(row.estimatedLiability)}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </SectionCard>

      {/* Vardiya & mesai yükü */}
      <SectionCard
        title="Vardiya & Mesai Yükü"
        sub={`Son 12 puantaj dönemi — yasal yıllık fazla mesai limiti: ${data.legalOvertimeLimitHours} saat, aşanlar kırmızı`}
        icon={<Moon size={15} color="var(--brick)" />}
        style={{ marginTop: 16 }}
        className={sectionClass("vardiya-mesai")}
        onExportPdf={() => exportPdf("vardiya-mesai", "Vardiya & Mesai Yükü")}
      >
        {data.overtime.length === 0 ? (
          <EmptyState text="Vardiya/mesai kaydı yok." />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.overtime} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid stroke={CHART_LINE} vertical={false} />
                <XAxis
                  dataKey="employeeName"
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  axisLine={{ stroke: CHART_LINE }}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} unit="s" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: `1px solid ${CHART_LINE}` }} />
                <Bar dataKey="overtimeHours" name="Yıllık Fazla Mesai (saat)" radius={[3, 3, 0, 0]}>
                  {data.overtime.map((m, i) => (
                    <Cell key={i} fill={m.overLimit ? CHART_BRICK : CHART_THREAD} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 8 }}>
              <DataTable head={["Çalışan", "Departman", "Yıllık Fazla Mesai", "Gece Vardiyası", "Hafta Sonu Mesai", "Durum"]}>
                {data.overtime.map((m) => (
                  <tr key={m.employeeId} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "7px 9px", fontWeight: 600 }}>{m.employeeName}</td>
                    <td style={{ padding: "7px 9px", color: "#4b5563" }}>{m.departmentName}</td>
                    <td className="mono" style={{ padding: "7px 9px", fontWeight: 700, color: m.overLimit ? "var(--brick)" : "var(--ink)" }}>
                      {m.overtimeHours} sa
                    </td>
                    <td className="mono" style={{ padding: "7px 9px" }}>{m.nightShiftCount}</td>
                    <td className="mono" style={{ padding: "7px 9px" }}>{m.weekendOvertimeCount}</td>
                    <td style={{ padding: "7px 9px" }}>
                      {m.overLimit ? (
                        <Badge tone="brick">LİMİT AŞILDI</Badge>
                      ) : m.overtimeHours > data.legalOvertimeLimitHours - 30 ? (
                        <Badge tone="thread">YAKLAŞIYOR</Badge>
                      ) : (
                        <Badge tone="pine">NORMAL</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </DataTable>
            </div>
          </>
        )}
      </SectionCard>

      {/* ISG + Zorunlu Eğitim + Pzt/Cuma sinyali */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 16 }}>
        <SectionCard
          title="Periyodik ISG Tarama Takibi"
          sub="Zorunlu sağlık kontrollerinin son tarihleri"
          icon={<Activity size={15} color="var(--denim)" />}
          className={sectionClass("isg-tarama")}
          onExportPdf={() => exportPdf("isg-tarama", "Periyodik ISG Tarama Takibi")}
        >
          {data.healthScreenings.length === 0 ? (
            <EmptyState text="ISG tarama kaydı yok." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.healthScreenings.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 10px",
                    background: t.remainingDays < 0 ? "#FBF2EF" : "var(--paper-deep)",
                    borderRadius: 4,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>
                      {t.employeeName} <span style={{ color: "#9ca3af", fontWeight: 400 }}>· {t.departmentName}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>{t.screeningType}</div>
                  </div>
                  <span
                    className="mono"
                    style={{ fontSize: 11, fontWeight: 700, color: t.remainingDays < 0 ? "var(--brick)" : t.remainingDays <= 7 ? "var(--thread-deep)" : "var(--pine)" }}
                  >
                    {t.remainingDays < 0 ? `${Math.abs(t.remainingDays)} gün geçti` : `${t.remainingDays} gün kaldı`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Zorunlu Eğitim Takibi"
          sub="Periyodik zorunlu eğitimlerin son tarihleri"
          icon={<GraduationCap size={15} color="var(--denim)" />}
          className={sectionClass("zorunlu-egitim")}
          onExportPdf={() => exportPdf("zorunlu-egitim", "Zorunlu Eğitim Takibi")}
        >
          {data.mandatoryTrainings.length === 0 ? (
            <EmptyState text="Eğitim kaydı yok." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.mandatoryTrainings.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 10px",
                    background: t.remainingDays < 0 ? "#FBF2EF" : "var(--paper-deep)",
                    borderRadius: 4,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>
                      {t.employeeName} <span style={{ color: "#9ca3af", fontWeight: 400 }}>· {t.departmentName}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>{t.trainingType}</div>
                  </div>
                  <span
                    className="mono"
                    style={{ fontSize: 11, fontWeight: 700, color: t.remainingDays < 0 ? "var(--brick)" : t.remainingDays <= 7 ? "var(--thread-deep)" : "var(--pine)" }}
                  >
                    {t.remainingDays < 0 ? `${Math.abs(t.remainingDays)} gün geçti` : `${t.remainingDays} gün kaldı`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Pazartesi / Cuma Devamsızlık Sinyali"
          sub="Hafta başı-sonu tek günlük rapor yoğunluğu (son 12 ay)"
          icon={<Siren size={15} color="var(--brick)" />}
          className={sectionClass("pzt-cuma")}
          onExportPdf={() => exportPdf("pzt-cuma", "Pazartesi / Cuma Devamsızlık Sinyali")}
        >
          {data.mondayFridaySignals.length === 0 ? (
            <EmptyState text="Belirgin bir örüntü tespit edilmedi." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.mondayFridaySignals.map((s) => (
                <div key={s.employeeId} style={{ padding: "8px 10px", background: "#FBF2EF", borderRadius: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>
                      {s.employeeName} <span style={{ color: "#9ca3af", fontWeight: 400 }}>· {s.departmentName}</span>
                    </span>
                    <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--brick)" }}>
                      %{s.ratioPercent} Pzt/Cum
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                    {s.totalSingleDay} tek günlük rapor — {s.mondayCount} Pazartesi, {s.fridayCount} Cuma
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Örüntü İK görüşmesi için bir öneridir, tek başına disiplin gerekçesi değildir.</div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Tutanak kayıtları */}
      <SectionCard
        title="Tutanak Kayıtları"
        sub="Disiplin/uyarı tutanakları"
        icon={<FileWarning size={15} color="var(--brick)" />}
        style={{ marginTop: 16 }}
        className={sectionClass("tutanak")}
        onExportPdf={() => exportPdf("tutanak", "Tutanak Kayıtları")}
      >
        {data.disciplinaryRecords.length === 0 ? (
          <EmptyState text="Tutanak kaydı yok." />
        ) : (
          <DataTable head={["Çalışan", "Departman", "Tarih", "Tür", "Açıklama"]}>
            {data.disciplinaryRecords.map((row) => (
              <tr key={row.id} style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "8px 10px", fontWeight: 600 }}>{row.employeeName}</td>
                <td style={{ padding: "8px 10px", color: "#4b5563" }}>{row.departmentName}</td>
                <td className="mono" style={{ padding: "8px 10px", color: "#4b5563" }}>{row.recordDate}</td>
                <td style={{ padding: "8px 10px" }}>
                  <Badge tone="brick">{DISCIPLINARY_LABELS[row.type] ?? row.type}</Badge>
                </td>
                <td style={{ padding: "8px 10px", color: "#4b5563" }}>{row.description ?? "—"}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </SectionCard>

      {/* Ödül/takdir */}
      <SectionCard
        title="Ödül / Takdir Alan Personel"
        sub="Performans veya bağlılık göstergesi olarak izlenir"
        icon={<Trophy size={15} color="var(--thread-deep)" />}
        style={{ marginTop: 16 }}
        className={sectionClass("odul")}
        onExportPdf={() => exportPdf("odul", "Ödül / Takdir Alan Personel")}
      >
        {data.recognitions.length === 0 ? (
          <EmptyState text="Ödül kaydı yok." />
        ) : (
          <DataTable head={["Çalışan", "Departman", "Ödül", "Tarih"]}>
            {data.recognitions.map((row) => (
              <tr key={row.id} style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "8px 10px", fontWeight: 600 }}>{row.employeeName}</td>
                <td style={{ padding: "8px 10px", color: "#4b5563" }}>{row.departmentName}</td>
                <td style={{ padding: "8px 10px" }}>🏆 {row.awardName}</td>
                <td className="mono" style={{ padding: "8px 10px", color: "#4b5563" }}>{row.awardDate}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </SectionCard>

      {/* Arabuluculuk (bonus modül) */}
      <SectionCard
        title="Arabuluculuk Kazanç Tablosu"
        sub="Dava yerine arabulucuda anlaşılan dosyalarda engellenen olası dava maliyeti"
        icon={<Scale size={15} color="var(--pine)" />}
        style={{ marginTop: 16 }}
        className={sectionClass("arabuluculuk")}
        onExportPdf={() => exportPdf("arabuluculuk", "Arabuluculuk Kazanç Tablosu")}
      >
        {data.mediationCases.length === 0 ? (
          <EmptyState text="Arabuluculuk kaydı yok." />
        ) : (
          <>
            <DataTable head={["Çalışan", "Departman", "Anlaşma Tarihi", "Ödenen Tutar", "Tahmini Dava Maliyeti", "Sağlanan Tasarruf"]}>
              {data.mediationCases.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "9px 10px", fontWeight: 600 }}>{row.employeeName}</td>
                  <td style={{ padding: "9px 10px", color: "#4b5563" }}>{row.departmentName}</td>
                  <td className="mono" style={{ padding: "9px 10px", color: "#4b5563" }}>{row.caseDate}</td>
                  <td className="mono" style={{ padding: "9px 10px" }}>{fmtTL(row.paidAmount)}</td>
                  <td className="mono" style={{ padding: "9px 10px", color: "#4b5563" }}>{fmtTL(row.estimatedLawsuitCost)}</td>
                  <td className="mono" style={{ padding: "9px 10px", fontWeight: 700, color: "var(--pine)" }}>
                    {fmtTL(row.estimatedLawsuitCost - row.paidAmount)}
                  </td>
                </tr>
              ))}
            </DataTable>
            <ThreadRule style={{ margin: "16px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 13, color: "#4b5563" }}>Toplam sağlanan tasarruf</span>
              <span className="disp" style={{ fontSize: 26, fontWeight: 800, color: "var(--pine)" }}>
                {fmtTL(data.mediationTotalSavings)}
              </span>
            </div>
          </>
        )}
      </SectionCard>

      <div className={["mono", chromeClass].filter(Boolean).join(" ")} style={{ marginTop: 28, fontSize: 10.5, color: "#9ca3af", textAlign: "center" }}>
        {data.companyName.toUpperCase()} — VERİTABANINDAN CANLI OKUNUYOR
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p style={{ fontSize: 12.5, color: "#9ca3af", padding: "10px 0" }}>{text}</p>;
}
