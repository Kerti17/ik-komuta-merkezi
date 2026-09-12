// "İplik" ayraç çizgisi (tasarim.md kontrol listesi madde 7): 4px yükseklik,
// paletteki 5 renkli aksan (thread/denim/brick/pine/indigo) eşit segmentler
// halinde. /admin ve /panel arasında GÖRSEL OLARAK BİREBİR AYNI olmalı - bu
// yüzden tek dosyada tanımlanıp iki tarafça da import edilir (bkz.
// components/admin/ui.tsx, components/panel/ui.tsx).
const SEGMENT_COLORS = ["var(--thread)", "var(--denim)", "var(--brick)", "var(--pine)", "var(--indigo)"];

export function ThreadRule({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", height: 4, borderRadius: 2, overflow: "hidden", ...style }}>
      {SEGMENT_COLORS.map((color) => (
        <div key={color} style={{ flex: 1, background: color }} />
      ))}
    </div>
  );
}
