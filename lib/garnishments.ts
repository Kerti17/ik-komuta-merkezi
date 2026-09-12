// ---------------------------------------------------------------------------
// Icra Takip (komut1.md Faz 1.6 madde 29) - kalan bakiye ve durum HER ZAMAN
// buradan, totalDebt - deductedAmount uzerinden otomatik hesaplanir. DB'de
// ayri bir "status" sutunu YOK - boylece admin'in unutup yanlis isaretlemesi
// mumkun degil, tek gercek kaynak (source of truth) deductedAmount'tir.
// Hem admin ekrani (app/admin/(dashboard)/icra-takip) hem panel veri
// katmani (lib/panel-data.ts) bu fonksiyonu kullanir.
// ---------------------------------------------------------------------------

export type GarnishmentStatus = "devam_ediyor" | "tamamlandi";

export function computeGarnishmentBalance(totalDebt: number, deductedAmount: number): { remainingBalance: number; status: GarnishmentStatus } {
  const remainingBalance = Math.max(0, Math.round((totalDebt - deductedAmount) * 100) / 100);
  return { remainingBalance, status: remainingBalance <= 0 ? "tamamlandi" : "devam_ediyor" };
}
