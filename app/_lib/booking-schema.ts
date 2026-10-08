import { z } from "zod";
import { bookingModes, bookingWindows } from "./content";

const modes = bookingModes.map((m) => m.value) as [string, ...string[]];
const windows = bookingWindows.map((w) => w.value) as [string, ...string[]];

export const bookingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Indiquez votre nom.")
    .max(80, "Ce nom est trop long."),
  email: z.email("Cette adresse e-mail semble incorrecte.").max(120),
  phone: z
    .string()
    .trim()
    .max(20, "Ce numéro est trop long.")
    .regex(/^[+0-9 .()-]*$/, "Utilisez uniquement des chiffres."),
  // Les sujets viennent de l'admin : on borne la longueur plutôt que de figer une liste.
  motif: z.string().trim().min(1, "Choisissez le sujet de votre demande.").max(60),
  mode: z.enum(modes, { error: "Choisissez un mode de rendez-vous." }),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choisissez un jour."),
  window: z.enum(windows, { error: "Choisissez un moment de la journée." }),
  message: z.string().trim().max(1000, "Votre message dépasse 1 000 caractères."),
  consent: z.literal("on", { error: "Votre accord est nécessaire pour traiter la demande." }),
  // Piège à robots : un humain ne voit ni ne remplit ce champ.
  website: z.string().max(0),
});

export type BookingField = keyof z.infer<typeof bookingSchema>;

export type BookingState = {
  status: "idle" | "error" | "success";
  /** Message général (envoi impossible, trop de demandes…). */
  message?: string;
  errors?: Partial<Record<BookingField, string>>;
  values?: Partial<Record<BookingField, string>>;
};

export const initialBookingState: BookingState = { status: "idle" };
