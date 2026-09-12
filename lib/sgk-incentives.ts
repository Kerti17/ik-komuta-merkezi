// ---------------------------------------------------------------------------
// SGK Tesvik Motoru - otomatik uygunluk onerisi (claude-code-talimati.md
// Bolum 5 Faz1.5 madde 20). Kural tanimlari admin'de yonetilir (bkz.
// db/schema.ts -> sgkIncentiveRules); bu dosya sadece SALT-OKUNUR eslestirme
// mantigini icerir - hicbir DB yazma islemi yapmaz.
//
// ONEMLI SINIRLAMA (talimatta da acikca belirtildi - "tam otomatik hesaplama
// garanti edilmez, Ik'nin dogrulamasi gerekir"): engellilik durumu VE bolge
// calisan bazinda TUTULMUYOR (engellilik sadece disability_quota'da toplam
// sayi olarak var - Faz2 kapsami disi; bolge icin employees'te ayri bir alan
// yok, sadece sube adi var). Bu iki kriter icin sistem asla "uygun" demez,
// her zaman "kontrol_gerekli" doner - Ik elle dogrulamali.
// ---------------------------------------------------------------------------

export type IncentiveVerdict = "uygun" | "kontrol_gerekli" | "uygun_degil";

export type IncentiveMatch = {
  employeeId: number;
  employeeName: string;
  branchName: string;
  verdict: IncentiveVerdict;
  reasons: string[];
};

export type IncentiveRuleInput = {
  id: number;
  name: string;
  description: string | null;
  ageMin: number | null;
  ageMax: number | null;
  gender: "kadin" | "erkek" | null;
  requiresDisability: boolean;
  region: string | null;
  estimatedAmount: number | null;
  estimatedRatePercent: number | null;
  isActive: boolean;
};

export type IncentiveRuleWithMatches = IncentiveRuleInput & {
  eligibleCount: number;
  reviewCount: number;
  matches: IncentiveMatch[]; // "uygun_degil" olanlar listeye hic girmez
};

export type EmployeeForMatching = {
  id: number;
  fullName: string;
  branchName: string;
  birthDate: string | null;
  gender: "kadin" | "erkek" | null;
};

function ageFromBirthDate(birthDate: string, todayIso: string): number {
  const [by, bm, bd] = birthDate.split("-").map(Number);
  const [ty, tm, td] = todayIso.split("-").map(Number);
  let age = ty - by;
  if (tm < bm || (tm === bm && td < bd)) age -= 1;
  return age;
}

function matchOne(rule: IncentiveRuleInput, employee: EmployeeForMatching, todayIso: string): IncentiveMatch | null {
  const reasons: string[] = [];
  let verdict: IncentiveVerdict = "uygun";

  if (rule.ageMin != null || rule.ageMax != null) {
    if (!employee.birthDate) {
      verdict = "kontrol_gerekli";
      reasons.push("Doğum tarihi girilmemiş");
    } else {
      const age = ageFromBirthDate(employee.birthDate, todayIso);
      if ((rule.ageMin != null && age < rule.ageMin) || (rule.ageMax != null && age > rule.ageMax)) {
        return null; // yas araligi disinda - uygun_degil, listeye girmez
      }
    }
  }

  if (rule.gender) {
    if (!employee.gender) {
      verdict = "kontrol_gerekli";
      reasons.push("Cinsiyet girilmemiş");
    } else if (employee.gender !== rule.gender) {
      return null; // cinsiyet uyusmuyor - uygun_degil
    }
  }

  if (rule.requiresDisability) {
    verdict = "kontrol_gerekli";
    reasons.push("Engellilik durumu çalışan bazında sistemde tutulmuyor — elle doğrulayın");
  }

  if (rule.region) {
    const branchMatches = employee.branchName.toLocaleLowerCase("tr").includes(rule.region.toLocaleLowerCase("tr"));
    if (!branchMatches) {
      verdict = "kontrol_gerekli";
      reasons.push(`Şube adı "${rule.region}" ile otomatik eşleşmedi — elle doğrulayın`);
    }
  }

  return { employeeId: employee.id, employeeName: employee.fullName, branchName: employee.branchName, verdict, reasons };
}

const VERDICT_RANK: Record<IncentiveVerdict, number> = { uygun: 0, kontrol_gerekli: 1, uygun_degil: 2 };

export function matchIncentiveRules(rules: IncentiveRuleInput[], employees: EmployeeForMatching[], todayIso: string): IncentiveRuleWithMatches[] {
  return rules.map((rule) => {
    const matches = employees
      .map((e) => matchOne(rule, e, todayIso))
      .filter((m): m is IncentiveMatch => m !== null)
      .sort((a, b) => VERDICT_RANK[a.verdict] - VERDICT_RANK[b.verdict] || a.employeeName.localeCompare(b.employeeName, "tr"));

    return {
      ...rule,
      eligibleCount: matches.filter((m) => m.verdict === "uygun").length,
      reviewCount: matches.filter((m) => m.verdict === "kontrol_gerekli").length,
      matches,
    };
  });
}
