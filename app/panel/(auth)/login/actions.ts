"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { verifyPassword } from "@/lib/password";
import { createPanelSessionToken, PANEL_COOKIE_NAME, PANEL_SESSION_MAX_AGE_SECONDS } from "@/lib/panel-session";
import { safeRelativeRedirect } from "@/lib/safe-redirect";

export type PanelLoginState = { error?: string } | undefined;

export async function panelLoginAction(_prevState: PanelLoginState, formData: FormData): Promise<PanelLoginState> {
  const password = formData.get("password");
  if (typeof password !== "string" || !password) return { error: "Şifre girin." };

  const settings = await getSettings();
  if (!settings.panelPasswordHash) {
    return { error: "Panel şifresi henüz ayarlanmamış. Admin panelden (Ayarlar) bir şifre belirleyin." };
  }

  const valid = await verifyPassword(password, settings.panelPasswordHash);
  if (!valid) return { error: "Şifre hatalı." };

  const token = await createPanelSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(PANEL_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PANEL_SESSION_MAX_AGE_SECONDS,
  });

  redirect(safeRelativeRedirect(formData.get("callbackUrl")?.toString(), "/panel", "/panel"));
}
