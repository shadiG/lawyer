import type { CollectionConfig } from "payload";
import { bookingModes, bookingWindows } from "../../app/_lib/content";

const loggedIn = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);
const locked = { readOnly: true } as const;

export const Bookings: CollectionConfig = {
  slug: "bookings",
  labels: { singular: "Demande de rendez-vous", plural: "Demandes de rendez-vous" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "status", "day", "window", "motif", "createdAt"],
    group: "Rendez-vous",
    description: "Demandes reçues par le formulaire du site. Une copie est aussi envoyée par e-mail.",
  },
  defaultSort: "-createdAt",
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
      options: [
        { label: "Nouvelle", value: "nouveau" },
        { label: "Confirmée", value: "confirme" },
        { label: "Refusée / sans suite", value: "sans-suite" },
        { label: "Archivée", value: "archive" },
      ],
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
