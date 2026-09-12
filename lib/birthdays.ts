// ---------------------------------------------------------------------------
// Dogum Gunu Uyarisi (komut1.md Faz 1.6 madde 24): admin ana sayfasinda
// bugun/bu hafta dogum gunu olan aktif calisanlari gosteren kucuk bildirim.
// Yeni alan gerekmiyor - employees.birthDate zaten var (madde 22), burada
// sadece hesaplama mantigi var.
//
// KVKK notu (madde 22 ile ayni sinir): birthDate kisisel veridir, bu yuzden
// bu fonksiyon SADECE admin/IK tarafinda (app/admin ana sayfasi) kullanilir -
// bolum yoneticisi ekraninda (/yonetici) ASLA cagrilmamali.
//
// VARSAYIM: "bu hafta" takvim haftasi (Pzt-Paz) degil, YUVARLANAN 7 gunluk
// pencere olarak yorumlandi (bugun + sonraki 6 gun) - bir bildirimin "hafta
// ortasinda aniden kaybolup Pazartesi tekrar cikmasi" gibi kafa karistirici
// bir davranisi onlemek icin daha pratik bir tanim.
// ---------------------------------------------------------------------------

export type UpcomingBirthday = {
  employeeId: number;
  fullName: string;
  birthDate: string; // ISO yyyy-mm-dd
  daysUntil: number; // 0 = bugun, 1 = yarin, ...
  turningAge: number | null; // dogum gununde kac yasina girecek (dogum yili varsa)
};

/** Bir dogum tarihinin, "today" gunune gore bir sonraki gerceklestigi tarihe kac gun kaldigini hesaplar. */
function daysUntilNextOccurrence(birthDate: string, today: Date): number {
  const parts = birthDate.split("-").map(Number);
  const bm = parts[1];
  const bd = parts[2];

  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Not: 29 Subat dogumlular icin, artik olmayan yillarda JS Date tasip 1
  // Mart'a kayar - bilincli kabul edilen basit bir sadelestirme (VARSAYIM).
  let next = new Date(todayMidnight.getFullYear(), bm - 1, bd);
  if (next < todayMidnight) next = new Date(todayMidnight.getFullYear() + 1, bm - 1, bd);

  return Math.round((next.getTime() - todayMidnight.getTime()) / 86_400_000);
}

/**
 * Aktif calisanlar arasindan bugunden itibaren 7 gun icinde (bugun dahil) dogum
 * gunu olanlari, en yakindan uzaga siralanmis sekilde dondurur.
 */
export function getUpcomingBirthdays(
  employees: { id: number; fullName: string; birthDate: string | null }[],
  today: Date = new Date()
): UpcomingBirthday[] {
  const result: UpcomingBirthday[] = [];

  for (const e of employees) {
    if (!e.birthDate) continue;
    const daysUntil = daysUntilNextOccurrence(e.birthDate, today);
    if (daysUntil > 6) continue;

    const birthYear = Number(e.birthDate.split("-")[0]);
    const targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    targetDate.setDate(targetDate.getDate() + daysUntil);
    const turningAge = Number.isFinite(birthYear) && birthYear > 1900 ? targetDate.getFullYear() - birthYear : null;

    result.push({ employeeId: e.id, fullName: e.fullName, birthDate: e.birthDate, daysUntil, turningAge });
  }

  return result.sort((a, b) => a.daysUntil - b.daysUntil);
}

/** "Bugün" / "Yarın" / "3 gün sonra" gibi insan-okunur etiket. */
export function formatDaysUntil(daysUntil: number): string {
  if (daysUntil === 0) return "Bugün";
  if (daysUntil === 1) return "Yarın";
  return `${daysUntil} gün sonra`;
}
