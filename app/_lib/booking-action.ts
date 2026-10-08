"use server";

import config from "@payload-config";
import { headers } from "next/headers";
import { getPayload } from "payload";
import { isDayAvailable, todayParis } from "./availability";
import { acknowledgementEmail } from "./booking-emails";
import { getContent } from "./cms";
import { bookingModes, bookingWindows } from "./content";
import { sendMail } from "./mail";
import { bookingSchema, type BookingField, type BookingState } from "./booking-schema";

// Limitation de débit en mémoire : suffisante pour une instance unique
// (un conteneur Coolify). À remplacer par un store partagé si l'on scale.
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

const label = (list: readonly { value: string; label: string }[], value: string) =>
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

const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export async function submitBooking(_prev: BookingState, formData: FormData): Promise<BookingState> {
  const raw = Object.fromEntries(
    (["name", "email", "phone", "motif", "mode", "day", "window", "message", "consent", "website"] as const).map(
      (k) => [k, String(formData.get(k) ?? "")],
    ),
  ) as Record<BookingField, string>;

  // Robot détecté : on répond « succès » sans rien enregistrer ni envoyer.
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

  const content = await getContent();
  const { site, availability } = content;

  if (!isDayAvailable(data.day, availability, todayParis())) {
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

  // 1) Persistance dans l'administration : la source de vérité.
  let saved = false;
  try {
    const payload = await getPayload({ config });
    await payload.create({
      collection: "bookings",
      data: {
        status: "nouveau",
        name: oneLine(data.name),
        email: data.email,
        phone: data.phone || undefined,
        motif: data.motif,
        mode: data.mode as "cabinet" | "visio" | "telephone",
        day: data.day,
        window: data.window as "matin" | "apres-midi" | "fin-journee",
        message: data.message || undefined,
      },
    });
    saved = true;
  } catch (err) {
    console.error("Échec d’enregistrement de la demande de rendez-vous :", err);
  }

  // 2) Notification par e-mail : filet de sécurité et confort.
  const subject = `Demande de rendez-vous · ${oneLine(data.name)} · ${formatDay(data.day)}`;
  const text = [
    "Nouvelle demande de rendez-vous reçue depuis le site.",
    "",
    `Nom : ${oneLine(data.name)}`,
    `E-mail : ${data.email}`,
    `Téléphone : ${data.phone || "non renseigné"}`,
    `Sujet : ${data.motif}`,
    `Mode : ${label(bookingModes, data.mode)}`,
    `Jour souhaité : ${formatDay(data.day)}`,
    `Moment : ${label(bookingWindows, data.window)}`,
    "",
    "Message :",
    data.message || "(aucun)",
  ].join("\n");

  const to = process.env.BOOKING_TO_EMAIL;
  let mailed = false;

  if (to) {
    const r = await sendMail({ to, replyTo: data.email, subject, text });
    mailed = r.status === "sent" || r.status === "logged";
    if (r.status === "failed") console.error("Échec d’envoi de l’e-mail de rendez-vous :", r.error);
  } else if (process.env.NODE_ENV !== "production") {
    console.log(`\n--- Demande de rendez-vous (mode développement) ---\n${subject}\n\n${text}\n`);
    mailed = true;
  }

  // Succès dès que la demande est quelque part où l'avocat la verra.
  if (saved || mailed) {
    // Accusé de réception au client : un échec ne doit jamais faire échouer la demande.
    const ack = acknowledgementEmail(site, { name: oneLine(data.name), day: data.day, window: data.window });
    const r = await sendMail({ to: data.email, replyTo: site.email, ...ack });
    if (r.status === "failed") console.error("Échec de l’accusé de réception :", r.error);
    return { status: "success" };
  }

  return {
    status: "error",
    message: `Votre demande n’a pas pu être enregistrée. Réessayez ou appelez le ${site.phone}.`,
    values: raw,
  };
}
