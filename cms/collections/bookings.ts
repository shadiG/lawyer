import type { CollectionBeforeChangeHook, CollectionConfig, Endpoint } from "payload";
import { confirmationEmail, declinedEmail, type CabinetInfo } from "../../app/_lib/booking-emails";
import { bookingModes, bookingWindows } from "../../app/_lib/content";
import { sendMail } from "../../app/_lib/mail";

const loggedIn = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);
const locked = { readOnly: true } as const;

const STATUTS: Record<string, string> = {
  nouveau: "Nouvelle",
  confirme: "Confirmée",
  "sans-suite": "Refusée / sans suite",
  archive: "Archivée",
};

/**
 * Prévient le client par e-mail quand le statut passe à « Confirmée » ou
 * « Refusée / sans suite ». Exécuté AVANT l'enregistrement pour que la date
 * d'envoi (ou l'erreur) soit sauvegardée dans la même opération. Ne bloque jamais
 * l'enregistrement : un échec d'envoi est noté dans « Erreur d'envoi ».
 */
const notifyClient: CollectionBeforeChangeHook = async ({ data, originalDoc, operation, req }) => {
  if (operation !== "update") return data;
  const merged = { ...originalDoc, ...data } as Record<string, unknown> & {
    status?: string;
    notifyClient?: boolean;
    notifiedStatus?: string | null;
    email?: string;
    name?: string;
    mode?: string;
    slot?: string | null;
    messageToClient?: string | null;
  };
  const status = merged.status;
  if (status !== "confirme" && status !== "sans-suite") return data;
  if (originalDoc?.status === status) return data; // statut inchangé : rien à envoyer
  if (!merged.notifyClient || merged.notifiedStatus === status) return data;
  if (!merged.email || !merged.name) return data;

  const s = await req.payload.findGlobal({ slug: "settings", depth: 0 });
  const cabinet: CabinetInfo = {
    name: s.name || "Cabinet",
    lawyer: s.lawyer || "",
    phone: s.phone || "",
    email: s.email || "",
    address: { street: s.address?.street || "", postalCode: s.address?.postalCode || "", city: s.address?.city || "" },
  };

  const mail =
    status === "confirme"
      ? confirmationEmail(cabinet, {
          name: merged.name,
          mode: merged.mode ?? "cabinet",
          slot: merged.slot as string,
          messageToClient: merged.messageToClient,
        })
      : declinedEmail(cabinet, { name: merged.name, messageToClient: merged.messageToClient });

  const res = await sendMail({ to: merged.email, replyTo: cabinet.email || undefined, ...mail });

  if (res.status === "sent" || res.status === "logged") {
    return { ...data, notifiedAt: new Date().toISOString(), notifiedStatus: status, notifyError: null };
  }
  const reason =
    res.status === "unconfigured"
      ? "E-mail non configuré (RESEND_API_KEY / BOOKING_FROM_EMAIL) : le client n’a pas été prévenu."
      : `Échec de l’envoi : ${res.error}`;
  return { ...data, notifyError: reason };
};

/* ---------- Export CSV (Excel) ---------- */

const parisDateTime = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Paris" });

/** Entoure de guillemets, double les guillemets, et neutralise les formules (=, +, -, @). */
function csvCell(value: unknown): string {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

const exportCsv: Endpoint = {
  path: "/export",
  method: "get",
  handler: async (req) => {
    if (!req.user) return new Response("Non autorisé", { status: 401 });

    const { docs } = await req.payload.find({
      collection: "bookings",
      sort: "-createdAt",
      pagination: false,
      depth: 0,
      overrideAccess: false,
      user: req.user,
    });

    const date = (v?: string | null) => (v ? parisDateTime.format(new Date(v)) : "");
    const head = ["Reçue le", "Nom", "E-mail", "Téléphone", "Sujet", "Mode", "Jour souhaité", "Moment", "Statut", "Créneau confirmé", "Client prévenu le", "Message", "Note interne"];
    const rows = docs.map((b) => [
      date(b.createdAt),
      b.name,
      b.email,
      b.phone,
      b.motif,
      bookingModes.find((m) => m.value === b.mode)?.label ?? b.mode,
      b.day,
      bookingWindows.find((w) => w.value === b.window)?.label ?? b.window,
      STATUTS[b.status ?? "nouveau"] ?? b.status,
      date(b.slot),
      date(b.notifiedAt),
      b.message,
      b.note,
    ]);
    // « ; » comme séparateur et BOM UTF-8 : s'ouvre correctement dans Excel en français.
    const csv = "﻿" + [head, ...rows].map((r) => r.map(csvCell).join(";")).join("\r\n");
    const jour = new Date().toISOString().slice(0, 10);

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="demandes-rendez-vous-${jour}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  },
};

export const Bookings: CollectionConfig = {
  slug: "bookings",
  labels: { singular: "Demande de rendez-vous", plural: "Demandes de rendez-vous" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "status", "day", "window", "motif", "createdAt"],
    group: "Rendez-vous",
    description: "Demandes reçues par le formulaire du site. Passez le statut à « Confirmée » pour prévenir le client par e-mail.",
    components: { beforeListTable: ["/cms/components/BookingsExport#BookingsExport"] },
  },
  defaultSort: "-createdAt",
  endpoints: [exportCsv],
  hooks: { beforeChange: [notifyClient] },
  access: {
    // Personne ne crée de demande via l'API publique : seul le serveur du site
    // (API locale) écrit ici, après validation.
    create: () => false,
    read: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
  fields: [
    {
      name: "status",
      type: "select",
      label: "Statut",
      defaultValue: "nouveau",
      required: true,
      admin: { position: "sidebar" },
      options: Object.entries(STATUTS).map(([value, label]) => ({ label, value })),
    },
    {
      name: "slot",
      type: "date",
      label: "Créneau confirmé",
      admin: {
        position: "sidebar",
        description: "Date et heure du rendez-vous, indiquées au client dans l’e-mail de confirmation.",
        date: { pickerAppearance: "dayAndTime", displayFormat: "dd/MM/yyyy HH:mm", timeIntervals: 15 },
      },
      validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) => {
        if (siblingData?.status === "confirme" && siblingData?.notifyClient && !value) {
          return "Indiquez le créneau confirmé pour prévenir le client (ou décochez « Prévenir le client »).";
        }
        return true;
      },
    },
    {
      name: "messageToClient",
      type: "textarea",
      label: "Message au client",
      admin: { position: "sidebar", description: "Ajouté à l’e-mail de confirmation ou de refus. Facultatif." },
    },
    {
      name: "notifyClient",
      type: "checkbox",
      label: "Prévenir le client par e-mail",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description: "L’e-mail part quand le statut passe à « Confirmée » ou « Refusée / sans suite ».",
      },
    },
    {
      name: "notifiedAt",
      type: "date",
      label: "Client prévenu le",
      admin: { position: "sidebar", readOnly: true, date: { displayFormat: "dd/MM/yyyy HH:mm" } },
    },
    { name: "notifiedStatus", type: "text", admin: { hidden: true } },
    {
      name: "notifyError",
      type: "text",
      label: "Erreur d’envoi",
      admin: { position: "sidebar", readOnly: true, condition: (data) => Boolean(data?.notifyError) },
    },
    {
      name: "note",
      type: "textarea",
      label: "Note interne",
      admin: { position: "sidebar", description: "Visible uniquement dans l’administration." },
    },
    { name: "name", type: "text", label: "Nom", required: true, admin: locked },
    { name: "email", type: "email", label: "E-mail", required: true, admin: locked },
    { name: "phone", type: "text", label: "Téléphone", admin: locked },
    { name: "motif", type: "text", label: "Sujet", required: true, admin: locked },
    {
      name: "mode",
      type: "select",
      label: "Mode",
      required: true,
      options: bookingModes.map((m) => ({ label: m.label, value: m.value })),
      admin: locked,
    },
    { name: "day", type: "text", label: "Jour souhaité (AAAA-MM-JJ)", required: true, admin: locked },
    {
      name: "window",
      type: "select",
      label: "Moment",
      required: true,
      options: bookingWindows.map((w) => ({ label: `${w.label} (${w.detail})`, value: w.value })),
      admin: locked,
    },
    { name: "message", type: "textarea", label: "Message", admin: locked },
  ],
};
