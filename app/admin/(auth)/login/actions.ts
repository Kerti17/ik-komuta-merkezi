"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { safeRelativeRedirect } from "@/lib/safe-redirect";

export type LoginState = { error?: string } | undefined;

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRelativeRedirect(formData.get("callbackUrl")?.toString(), "/admin", "/admin");

  try {
    await signIn("credentials", { email, password, redirectTo });
    return undefined;
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "E-posta veya şifre hatalı." };
      }
      return { error: "Giriş sırasında beklenmeyen bir hata oluştu." };
    }
    // NextAuth basarili girişte "NEXT_REDIRECT" hatasi firlatir - bu, gercek
    // bir hata degil, yonlendirmenin gerceklesmesi icin yeniden firlatilmali.
    throw error;
  }
}
