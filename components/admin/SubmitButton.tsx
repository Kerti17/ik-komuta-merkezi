"use client";

import { useFormStatus } from "react-dom";

// tasarim.md kontrol listesi madde 8: birincil buton dolu altin (var(--thread))
// + golge olmali - koyu lacivert DEGIL. "brick" tonu (tehlikeli/geri alinamaz
// islemler icin, su an hicbir yerde kullanilmiyor ama API olarak duruyor) hala
// koyu/dolu kalir.
export function SubmitButton({ children, tone = "primary" }: { children: React.ReactNode; tone?: "primary" | "brick" }) {
  const { pending } = useFormStatus();
  const bg = tone === "brick" ? "var(--brick)" : "var(--thread)";
  const fg = tone === "brick" ? "var(--paper)" : "var(--ink)";
  return (
    <button
      type="submit"
      disabled={pending}
      className="mono"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "9px 16px",
        fontSize: 12,
        fontWeight: 700,
        background: bg,
        color: fg,
        border: "none",
        borderRadius: 4,
        boxShadow: tone === "brick" ? "0 8px 18px -10px rgba(178,58,46,0.55)" : "0 8px 18px -10px rgba(212,160,23,0.55)",
        cursor: pending ? "default" : "pointer",
        opacity: pending ? 0.6 : 1,
      }}
    >
      {pending ? "Kaydediliyor..." : children}
    </button>
  );
}
