"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="mono"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 14px",
        fontSize: 11.5,
        fontWeight: 700,
        background: "var(--thread)",
        color: "var(--ink)",
        boxShadow: "0 8px 18px -10px rgba(212,160,23,0.55)",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
      }}
    >
      <Printer size={13} /> Yazdır / PDF Kaydet
    </button>
  );
}
