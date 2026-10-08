"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { booking, site } from "./content";
import { bookingSchema, type BookingField, type BookingState } from "./booking-schema";

// Limitation de débit en mémoire : suffisante pour une instance unique
// (un conteneur Coolify). À remplacer par un store partagé si l’on scale.
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 3;

function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_HITS;
}

const label = <T extends readonly { value: string; label: string }[]>(list: T, value: string) =>
  list.find((i) => i.value === value)?.label ?? value;

function formatDay(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));
}

/** Un jour ouvré (lun.–ven.) dans les 90 prochains jours. */
function validDay(iso: string) {
  const date = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return false;
  const dow = date.getUTCDay();
  const diff = (date.getTime() - Date.now()) / 86_400_000;
  return dow !== 0 && dow !== 6 && diff > -1 && diff < 90;
}

const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export async function submitBooking(_prev: BookingState, formData: FormData): Promise<BookingState> {
  const raw = Object.fromEntries(
    (["name", "email", "phone", "motif", "mode", "day", "window", "message", "consent", "website"] as const).map(
      (k) => [k, String(formData.get(k) ?? "")],
    ),
  ) as Record<BookingField, string>;

  // Robot détecté : on répond « succès » sans rien envoyer.
  if (raw.website) return { status: "success" };

  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Partial<Record<BookingField, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as BookingField;
      errors[key] ??= issue.message;
    }
    return { status: "error", errors, values: raw };
  }
  const data = parsed.data;

  if (!validDay(data.day)) {
    return { status: "error", errors: { day: "Ce jour n’est plus disponible, choisissez-en un autre." }, values: raw };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  if (tooMany(ip)) {
    return {
      status: "error",
      message: `Vous avez envoyé plusieurs demandes à la suite. Patientez quelques minutes ou appelez le ${site.phone}.`,
      values: raw,
    };
  }

  const subject = `Demande de rendez-vous · ${oneLine(data.name)} · ${formatDay(data.day)}`;
  const text = [
    "Nouvelle demande de rendez-vous reçue depuis le site.",
    "",
    `Nom : ${oneLine(data.name)}`,
    `E-mail : ${data.email}`,
    `Téléphone : ${data.phone || "non renseigné"}`,
    `Sujet : ${data.motif}`,
    `Mode : ${label(booking.modes, data.mode)}`,
    `Jour souhaité : ${formatDay(data.day)}`,
    `Moment : ${label(booking.windows, data.window)}`,
    "",
    "Message :",
    data.message || "(aucun)",
  ].join("\n");

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.BOOKING_TO_EMAIL;
  const from = process.env.BOOKING_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    if (process.env.NODE_ENV !== "production") {
      // En développement : on affiche la demande au lieu de l’envoyer.
      console.log(`\n--- Demande de rendez-vous (mode développement) ---\n${subject}\n\n${text}\n`);
      return { status: "success" };
    }
    console.error("Réservation impossible : RESEND_API_KEY, BOOKING_TO_EMAIL ou BOOKING_FROM_EMAIL manquant.");
    return {
      status: "error",
      message: `L’envoi en ligne est momentanément indisponible. Merci d’appeler le ${site.phone}.`,
      values: raw,
    };
  }

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to,
      replyTo: data.email,
      subject,
      text,
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error("Échec d’envoi de la demande de rendez-vous :", err);
    return {
      status: "error",
      message: `Votre demande n’a pas pu être envoyée. Réessayez ou appelez le ${site.phone}.`,
      values: raw,
    };
  }

  return { status: "success" };
}
