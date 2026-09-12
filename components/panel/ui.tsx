// /panel icin gorsel bilesenler. Bolum 10-A tokenlerini (app/globals.css)
// kullanir; gorsel/islevsel referans ik-komuta-merkezi.jsx'teki
// KpiCard/SectionCard/MiniStat bilesenlerinin TS/CSS-degiskenli karsiligidir.
import type { ReactNode } from "react";
import { FileDown } from "lucide-react";
export { ThreadRule } from "@/components/ThreadRule";

export const fmtTL = (n: number) => n.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export function KpiCard({
  icon,
  label,
  value,
  sub,
  tone = "ink",
}: {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "ink" | "brick" | "pine" | "thread";
}) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 8, boxShadow: "var(--card-shadow)", padding: "16px 16px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7280", marginBottom: 10 }}>
        {icon}
        <span className="mono" style={{ fontSize: 10.5, letterSpacing: "0.05em", fontWeight: 700 }}>
          {label.toUpperCase()}
        </span>
      </div>
      <div className="disp" style={{ fontSize: 28, fontWeight: 800, color: `var(--${tone})`, lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export function SectionCard({
  title,
  sub,
  icon,
  children,
  style,
  className,
  onExportPdf,
}: {
  title: string;
  sub?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  style?: React.CSSProperties;
  /** Genel Rapor/Sunum PDF Disa Aktarma (Bolum 5 madde 17) - bu bolumu tek basina
   *  gizleyip window.print()'e gonderen ust bilesenden gelen callback. Verilirse
   *  baslikta kucuk bir "PDF'e Aktar" butonu gorunur. */
  className?: string;
  onExportPdf?: () => void;
}) {
  return (
    <div className={className} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 8, boxShadow: "var(--card-shadow)", padding: "18px 20px 20px", ...style }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          {icon}
          <h3 className="disp" style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
            {title}
          </h3>
        </div>
        {onExportPdf && (
          <button
            onClick={onExportPdf}
            className="no-print mono"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
              padding: "4px 9px",
              fontSize: 10.5,
              fontWeight: 700,
              background: "transparent",
              color: "#6b7280",
              border: "1px solid var(--line)",
              borderRadius: 3,
              cursor: "pointer",
            }}
          >
            <FileDown size={11} /> PDF&apos;E AKTAR
          </button>
        )}
      </div>
      {sub && <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>{sub}</div>}
      {children}
    </div>
  );
}

export function MiniStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={{ background: "var(--paper-deep)", borderRadius: 4, padding: "12px 14px" }}>
      <div className="mono" style={{ fontSize: 10, color: "#6b7280", marginBottom: 4, letterSpacing: "0.04em" }}>
        {label.toUpperCase()}
      </div>
      <div className="disp" style={{ fontSize: 18, fontWeight: 700 }}>
        {value}
      </div>
    </div>
  );
}

const TONE_MAP: Record<string, { bg: string; fg: string }> = {
  default: { bg: "#EEECE3", fg: "var(--ink)" },
  brick: { bg: "#F3D6CE", fg: "var(--brick)" },
  pine: { bg: "#DCEADF", fg: "var(--pine)" },
  thread: { bg: "#F5E9CC", fg: "var(--thread-deep)" },
  denim: { bg: "#DCE3EE", fg: "var(--denim)" },
};

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: keyof typeof TONE_MAP }) {
  const c = TONE_MAP[tone];
  return (
    <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: c.bg, color: c.fg, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

export function DataTable({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--line)" }}>
            {head.map((h) => (
              <th
                key={h}
                className="mono"
                style={{ textAlign: "left", padding: "8px 10px", fontSize: 10.5, color: "#6b7280", fontWeight: 700, letterSpacing: "0.04em" }}
              >
                {h.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: "14px 10px", color: "#9ca3af", fontSize: 12.5 }}>
        {text}
      </td>
    </tr>
  );
}

export function InsightNote({ tone = "paper", children }: { tone?: "paper" | "brick" | "pine"; children: ReactNode }) {
  const bg = tone === "brick" ? "#FBF2EF" : tone === "pine" ? "#DCEADF" : "var(--paper-deep)";
  return <div style={{ marginTop: 12, padding: "10px 12px", background: bg, borderRadius: 4, fontSize: 12, lineHeight: 1.5 }}>{children}</div>;
}
