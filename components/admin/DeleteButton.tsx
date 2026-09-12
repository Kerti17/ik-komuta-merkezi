"use client";

export function DeleteButton({ confirmText = "Bu kaydi silmek istediginize emin misiniz?" }: { confirmText?: string }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
      className="mono"
      style={{
        padding: "4px 9px",
        fontSize: 10.5,
        fontWeight: 700,
        background: "transparent",
        color: "var(--brick)",
        border: "1px solid #EAC5BC",
        borderRadius: 4,
        cursor: "pointer",
      }}
    >
      Sil
    </button>
  );
}
