// Login sonrasi "callbackUrl" gibi kullanici kontrolundeki degerlerle
// yonlendirme yaparken open-redirect'i onlemek icin: sadece verilen prefix ile
// baslayan GORECELI bir yol kabul edilir, host/origin bilgisi tamamen atilir.
export function safeRelativeRedirect(raw: string | null | undefined, prefix: string, fallback: string): string {
  if (!raw) return fallback;
  try {
    const url = new URL(raw, "http://localhost");
    const path = url.pathname + url.search;
    return path.startsWith(prefix) ? path : fallback;
  } catch {
    return fallback;
  }
}
