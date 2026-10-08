import { bookingModes, bookingWindows } from "./content";

/** Ce qu'il faut du cabinet pour rédiger les e-mails. */
export type CabinetInfo = {
  name: string;
  lawyer: string;
  phone: string;
  email: string;
  address: { street: string; postalCode: string; city: string };
};

export type Email = { subject: string; text: string };

const label = (list: readonly { value: string; label: string }[], value: string) =>
  list.find((i) => i.value === value)?.label ?? value;

const jour = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const jourHeure = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});

const formatDay = (iso: string) => jour.format(new Date(`${iso}T12:00:00Z`));

function signature(c: CabinetInfo) {
  return [
    "",
    "Cordialement,",
    c.lawyer,
    c.name,
    `${c.address.street}, ${c.address.postalCode} ${c.address.city}`,
    `Tél. ${c.phone} · ${c.email}`,
  ].join("\n");
}

const prenom = (name: string) => name.trim();

/** Accusé de réception, envoyé juste après la demande. */
export function acknowledgementEmail(c: CabinetInfo, b: { name: string; day: string; window: string }): Email {
  return {
    subject: `Votre demande de rendez-vous · ${c.name}`,
    text: [
      `Bonjour ${prenom(b.name)},`,
      "",
      "Nous avons bien reçu votre demande de rendez-vous. Elle est actuellement à l’étude ; nous revenons vers vous pour confirmer un créneau.",
      "",
      `Votre souhait : ${formatDay(b.day)}, ${label(bookingWindows, b.window).toLowerCase()}.`,
      "",
      "Merci de ne pas communiquer d’informations confidentielles par e-mail : nous les aborderons lors du rendez-vous, sous le secret professionnel.",
      signature(c),
    ].join("\n"),
  };
}

/** Confirmation du créneau retenu. */
export function confirmationEmail(
  c: CabinetInfo,
  b: { name: string; mode: string; slot: string; messageToClient?: string | null },
): Email {
  const lieu =
    b.mode === "cabinet"
      ? `Au cabinet : ${c.address.street}, ${c.address.postalCode} ${c.address.city}.`
      : b.mode === "visio"
        ? "En visioconférence : le lien de connexion vous sera envoyé avant le rendez-vous."
        : `Par téléphone : nous vous appellerons au numéro que vous nous avez indiqué.`;
  return {
    subject: `Rendez-vous confirmé · ${c.name}`,
    text: [
      `Bonjour ${prenom(b.name)},`,
      "",
      "Votre rendez-vous est confirmé :",
      "",
      `  Quand : ${jourHeure.format(new Date(b.slot))}`,
      `  Mode : ${label(bookingModes, b.mode)}`,
      `  ${lieu}`,
      ...(b.messageToClient?.trim() ? ["", b.messageToClient.trim()] : []),
      "",
      `Un empêchement ? Merci de nous prévenir au plus tôt au ${c.phone}.`,
      signature(c),
    ].join("\n"),
  };
}

/** Réponse négative, courtoise. */
export function declinedEmail(c: CabinetInfo, b: { name: string; messageToClient?: string | null }): Email {
  return {
    subject: `Votre demande de rendez-vous · ${c.name}`,
    text: [
      `Bonjour ${prenom(b.name)},`,
      "",
      "Nous vous remercions de votre demande. Malheureusement, nous ne sommes pas en mesure de donner suite à celle-ci.",
      ...(b.messageToClient?.trim() ? ["", b.messageToClient.trim()] : []),
      "",
      "Si votre situation est urgente, nous vous invitons à vous rapprocher du barreau de votre ressort ou d’un autre avocat, sans attendre.",
      signature(c),
    ].join("\n"),
  };
}
