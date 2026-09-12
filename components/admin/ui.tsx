// Admin panel icin paylasilan, sade UI parcalari. Gorsel dil Bolum 10-A
// tokenlerini kullanir ama /panel kadar ozenli degildir - admin panel
// islevsel bir veri girisi araci (bkz. Bolum 6).
import type { ReactNode } from "react";
export { ThreadRule } from "@/components/ThreadRule";
import { ThreadRule } from "@/components/ThreadRule";

// tasarim.md kontrol listesi madde 7: her admin sayfasinin basligi altina
// tutarli sekilde iplik ayraci eklemek icin paylasilan basit bir sarmalayici.
export function PageHeader({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h1 className="disp" style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>
        {title}
      </h1>
      {description && <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 10px" }}>{description}</p>}
      <ThreadRule />
    </div>
  );
}

export function Card({
  title,
  description,
  children,
  style,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--line)",
        borderRadius: 8,
        boxShadow: "var(--card-shadow)",
        padding: "20px 22px",
        marginBottom: 20,
        ...style,
      }}
    >
      {title && (
        <h2 className="disp" style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
          {title}
        </h2>
      )}
      {description && <p style={{ fontSize: 12.5, color: "#6b7280", marginTop: 4, marginBottom: 14 }}>{description}</p>}
      {children}
    </div>
  );
}

export function FormGrid({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
      {children}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  children,
  required,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12.5 }}>
      <span style={{ fontWeight: 600, color: "var(--ink)" }}>
        {label}
        {required && <span style={{ color: "var(--brick)" }}> *</span>}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  fontSize: 13,
  borderRadius: 4,
  border: "1px solid var(--line)",
  background: "#fff",
  color: "var(--ink)",
  fontFamily: "inherit",
};

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputStyle, ...props.style }} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ ...inputStyle, ...props.style }} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} style={{ ...inputStyle, minHeight: 70, resize: "vertical", ...props.style }} />;
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--line)" }}>
            {head.map((h) => (
              <th
                key={h}
                className="mono"
                style={{ textAlign: "left", padding: "7px 9px", fontSize: 10, color: "#6b7280", fontWeight: 700, letterSpacing: "0.04em" }}
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

export function Tr({ children }: { children: ReactNode }) {
  return <tr style={{ borderBottom: "1px solid var(--line)" }}>{children}</tr>;
}

export function Td({ children, mono }: { children: ReactNode; mono?: boolean }) {
  return (
    <td className={mono ? "mono" : undefined} style={{ padding: "7px 9px", color: "#374151" }}>
      {children}
    </td>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <p style={{ fontSize: 12.5, color: "#9ca3af", padding: "10px 0" }}>{text}</p>;
}

export function ErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div
      style={{
        background: "#FBF2EF",
        border: "1px solid #EAC5BC",
        color: "var(--brick)",
        borderRadius: 4,
        padding: "9px 12px",
        fontSize: 12.5,
        marginBottom: 12,
      }}
    >
      {message}
    </div>
  );
}

export function SuccessBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div
      style={{
        background: "#DCEADF",
        border: "1px solid #bcdcc4",
        color: "var(--pine)",
        borderRadius: 4,
        padding: "9px 12px",
        fontSize: 12.5,
        marginBottom: 12,
      }}
    >
      {message}
    </div>
  );
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "brick" | "pine" | "thread" }) {
  const map: Record<string, { bg: string; fg: string }> = {
    default: { bg: "#EEECE3", fg: "var(--ink)" },
    brick: { bg: "#F3D6CE", fg: "var(--brick)" },
    pine: { bg: "#DCEADF", fg: "var(--pine)" },
    thread: { bg: "#F5E9CC", fg: "#9C7418" },
  };
  const c = map[tone];
  return (
    <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: c.bg, color: c.fg }}>
      {children}
    </span>
  );
}
