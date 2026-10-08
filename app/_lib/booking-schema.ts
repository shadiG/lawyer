import { z } from "zod";
import { booking } from "./content";

const modes = booking.modes.map((m) => m.value) as [string, ...string[]];
const windows = booking.windows.map((w) => w.value) as [string, ...string[]];
const motifs = [...booking.motifs] as [string, ...string[]];

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
  motif: z.enum(motifs, { error: "Choisissez le sujet de votre demande." }),
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
