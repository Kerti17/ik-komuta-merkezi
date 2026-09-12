"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { getSettings } from "@/lib/settings";
import { sendSupportEmail } from "@/lib/email";

export type SupportFormState = { error?: string; success?: boolean } | undefined;

const schema = z.object({
  subject: z.string().trim().min(1, "Konu boş olamaz").max(150),
  message: z.string().trim().min(1, "Mesaj boş olamaz").max(5000),
});

export async function sendSupportMessageAction(_prevState: SupportFormState, formData: FormData): Promise<SupportFormState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Girilen değerler geçersiz." };
  }

  const session = await auth();
  if (!session?.user?.email) {
    return { error: "Oturum bulunamadı, lütfen tekrar giriş yapın." };
  }

  const settings = await getSettings();

  const result = await sendSupportEmail({
    companyName: settings.companyName,
    fromName: session.user.name ?? session.user.email,
    fromEmail: session.user.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });

  if (!result.ok) {
    return { error: result.error ?? "Mesaj gönderilemedi." };
  }

  return { success: true };
}
