"use server";

import { revalidatePath } from "next/cache";
import { getLicenseGate } from "@/lib/license";

export type RefreshLicenseState = { checkedAt?: string } | undefined;

// Admin panelde "Simdi Kontrol Et" butonu icin - staleness'i yok sayip
// merkezi API'ye karsi zorla tazeler (bkz. lib/license.ts).
export async function refreshLicenseAction(): Promise<RefreshLicenseState> {
  await getLicenseGate({ force: true });
  revalidatePath("/admin/lisans");
  return { checkedAt: new Date().toISOString() };
}
