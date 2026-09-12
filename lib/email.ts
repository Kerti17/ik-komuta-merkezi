// ---------------------------------------------------------------------------
// Destek mekanizmasi (Bolum 9): "7/24 canli destek yok. Admin paneldeki
// destek formu, basit bir transactional email servisiyle (Resend) kurucunun
// e-postasina iletilir. Ekstra bir ticket sistemi kurmaya gerek yok."
//
// BILINCLI OLARAK yapilmayan: DB'ye kaydetme / ticket gecmisi. Talimat acikca
// "ekstra ticket sistemi gerekmiyor" diyor - form gonderilir, e-posta gider,
// bitti. Musteri kendi gonderdigi mesajin kaydini kendi e-posta programindan
// (Yaniti kendi adresine de CC'lemiyoruz, VARSAYIM - istenirse eklenir) degil,
// gonderen admin'in reply-to olarak eklenmesinden takip eder: kurucu yanitlarsa
// doğrudan admin'e gider.
// ---------------------------------------------------------------------------
import { Resend } from "resend";

export type SendSupportEmailInput = {
  companyName: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  message: string;
};

export async function sendSupportEmail(input: SendSupportEmailInput): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.SUPPORT_EMAIL_TO;
  // Resend'de dogrulanmamis bir alan adindan gonderim yapilamaz - kurulum
  // rehberi kendi alan adini dogrulamayi anlatir. Dogrulanmamis kurulumlarda
  // Resend'in kendi test gonderici adresi calisir (sadece Resend hesap
  // sahibinin kendi e-postasina gonderim yapabilir - MVP/gelistirme icin yeterli).
  const from = process.env.SUPPORT_EMAIL_FROM || "IK Komuta Merkezi <onboarding@resend.dev>";

  if (!apiKey || !to) {
    console.warn("[email] RESEND_API_KEY veya SUPPORT_EMAIL_TO tanımlı değil - e-posta gönderilmedi, konsola yazıldı.");
    console.info(`[destek talebi] ${input.companyName} — ${input.fromName} <${input.fromEmail}>: ${input.subject}\n${input.message}`);
    if (process.env.NODE_ENV !== "production") {
      return { ok: true }; // yerel gelistirmede formu bloklamak yerine basariliymis gibi devam et
    }
    return { ok: false, error: "E-posta servisi yapılandırılmamış. Lütfen daha sonra tekrar deneyin." };
  }

  const resend = new Resend(apiKey);
  try {
    const result = await resend.emails.send({
      from,
      to,
      replyTo: input.fromEmail,
      subject: `[Destek] ${input.companyName} — ${input.subject}`,
      text: `Gönderen: ${input.fromName} <${input.fromEmail}>\nŞirket: ${input.companyName}\n\n${input.message}`,
    });
    if (result.error) {
      console.error("[email] Resend hata döndürdü:", result.error);
      return { ok: false, error: "E-posta gönderilemedi, daha sonra tekrar deneyin." };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] Resend gönderim hatası:", err);
    return { ok: false, error: "E-posta gönderilemedi, daha sonra tekrar deneyin." };
  }
}
