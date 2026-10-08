import { Resend } from "resend";

export type MailResult =
  | { status: "sent" }
  /** Pas de clé Resend en développement : le message est écrit dans la console. */
  | { status: "logged" }
  | { status: "unconfigured" }
  | { status: "failed"; error: string };

const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

/**
 * Envoi d'un e-mail texte via Resend. Ne lève jamais : l'appelant décide quoi
 * faire d'un échec (la demande de rendez-vous, elle, est déjà enregistrée).
 */
export async function sendMail(msg: { to: string; subject: string; text: string; replyTo?: string }): Promise<MailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.BOOKING_FROM_EMAIL;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n--- E-mail (mode développement) ---\nÀ : ${msg.to}\nObjet : ${msg.subject}\n\n${msg.text}\n`);
      return { status: "logged" };
    }
    return { status: "unconfigured" };
  }

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to: msg.to,
      replyTo: msg.replyTo,
      subject: oneLine(msg.subject),
      text: msg.text,
    });
    if (error) throw new Error(error.message);
    return { status: "sent" };
  } catch (err) {
    return { status: "failed", error: err instanceof Error ? err.message : String(err) };
  }
}
