"use client";

import { AnimatePresence, motion } from "motion/react";
import { useActionState, useState, useSyncExternalStore } from "react";
import { useFormStatus } from "react-dom";
import { submitBooking } from "../_lib/booking-action";
import { initialBookingState, type BookingField, type BookingState } from "../_lib/booking-schema";
import { availableDays } from "../_lib/availability";
import { bookingModes, bookingWindows, type Availability } from "../_lib/content";

const EASE = [0.23, 1, 0.32, 1] as const;

/* ---------- jours proposés (calculés côté client, après hydratation) ---------- */

const noopSubscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

type Day = { value: string; weekday: string; day: string; month: string };

const pad = (n: number) => String(n).padStart(2, "0");
const localIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * Les prochains jours proposés, avec les mêmes règles que le serveur (module
 * partagé `availability`) : jours ouverts, hors jours fermés, délai minimum.
 */
function upcomingDays(a: Availability): Day[] {
  const weekday = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
  const month = new Intl.DateTimeFormat("fr-FR", { month: "short" });
  return availableDays(a, localIso(new Date())).map((value) => {
    const d = new Date(`${value}T12:00:00`);
    return {
      value,
      weekday: weekday.format(d).replace(".", ""),
      day: String(d.getDate()),
      month: month.format(d).replace(".", ""),
    };
  });
}

/* ---------- briques de formulaire ---------- */

const input =
  "w-full rounded-md bg-paper-deep px-4 py-3.5 text-[1rem] text-ink ring-1 ring-ink/10 transition-[box-shadow,background-color] duration-200 placeholder:text-ink-faint focus:bg-white focus:outline-none focus:ring-2 focus:ring-brass aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-[#a4372c]";

function Field({
  id,
  label,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between text-sm font-medium text-ink">
        {label}
        {optional ? <span className="text-xs font-normal text-ink-faint">facultatif</span> : null}
      </label>
      {children}
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}

function FieldError({ id, error }: { id: string; error?: string }) {
  return (
    <div id={id} aria-live="polite" className="grid transition-[grid-template-rows] duration-300 ease-[var(--ease-out)]" style={{ gridTemplateRows: error ? "1fr" : "0fr" }}>
      <p className="overflow-hidden text-sm text-[#a4372c]">
        <span className="block pt-1.5">{error}</span>
      </p>
    </div>
  );
}

function ChipGroup({
  legend,
  name,
  options,
  defaultValue,
  error,
}: {
  legend: string;
  name: string;
  options: { value: string; label: string; detail?: string }[];
  defaultValue?: string;
  error?: string;
}) {
  return (
    <fieldset aria-describedby={`${name}-error`}>
      <legend className="mb-2 text-sm font-medium text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o.value} className="relative cursor-pointer">
            <input type="radio" name={name} value={o.value} defaultChecked={defaultValue === o.value} className="peer sr-only" />
            <span className="press block rounded-md bg-paper-deep px-4 py-2.5 text-sm text-ink ring-1 ring-ink/10 transition-[background-color,color,box-shadow] duration-200 peer-checked:bg-brass peer-checked:text-white peer-checked:ring-brass peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brass hover:ring-ink/30">
              {o.label}
              {o.detail ? <span className="ml-1.5 opacity-60">{o.detail}</span> : null}
            </span>
          </label>
        ))}
      </div>
      <FieldError id={`${name}-error`} error={error} />
    </fieldset>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group press flex w-full items-center justify-between gap-3 rounded-sm bg-brass py-2 pl-7 pr-2 text-[0.82rem] font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-200 hover:bg-brass-dark disabled:opacity-80"
    >
      <span>{pending ? "Envoi en cours…" : "Envoyer ma demande"}</span>
      <span className="grid size-11 place-items-center rounded-sm bg-white/15">
        {pending ? (
          <motion.span
            className="size-4 rounded-full border-2 border-white/30 border-t-white"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px" aria-hidden="true">
            <path d="M7 17 17 7M8.5 7H17v8.5" />
          </svg>
        )}
      </span>
    </button>
  );
}

/* ---------- formulaire ---------- */

function Form({ motifs, availability, onDone }: { motifs: string[]; availability: Availability; onDone: () => void }) {
  const [state, action] = useActionState<BookingState, FormData>(submitBooking, initialBookingState);
  const mounted = useMounted();
  const [days] = useState<Day[]>(() => (typeof window === "undefined" ? [] : upcomingDays(availability)));
  const e = state.errors ?? {};
  const v = state.values ?? {};
  // Une erreur disparaît dès que l'on modifie le champ, jusqu'au prochain envoi.
  const [dismissal, setDismissal] = useState<{ state: BookingState; names: string[] }>({ state, names: [] });
  const dismissed = dismissal.state === state ? dismissal.names : [];
  const err = (k: BookingField) => (dismissed.includes(k) ? undefined : e[k]);
  const dismiss = (name: string) =>
    setDismissal((d) => ({ state, names: [...(d.state === state ? d.names : []), name] }));

  if (state.status === "success") {
    return <Success onDone={onDone} />;
  }

  return (
    <form action={action} noValidate className="space-y-7" onChange={(ev) => dismiss((ev.target as unknown as HTMLInputElement).name)}>
      {/* Champ piège pour les robots, invisible et hors tabulation */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Ne pas remplir
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <AnimatePresence initial={false}>
        {state.message ? (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="rounded-md bg-[#a4372c]/10 px-4 py-3 text-sm text-[#7d2a21] ring-1 ring-[#a4372c]/25"
          >
            {state.message}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <ChipGroup
        legend="Sujet de votre demande"
        name="motif"
        options={motifs.map((m) => ({ value: m, label: m }))}
        defaultValue={v.motif}
        error={err("motif")}
      />

      <ChipGroup legend="Mode de rendez-vous" name="mode" options={[...bookingModes]} defaultValue={v.mode} error={err("mode")} />

      <fieldset aria-describedby="day-error" className="min-w-0">
        <legend className="mb-2 text-sm font-medium text-ink">Jour souhaité</legend>
        <div className="no-scrollbar -mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1" style={{ minHeight: "5.25rem" }}>
          {mounted
            ? days.map((d) => (
                <label key={d.value} className="relative shrink-0 cursor-pointer snap-start">
                  <input type="radio" name="day" value={d.value} defaultChecked={v.day === d.value} className="peer sr-only" />
                  <span className="press flex w-[4.25rem] flex-col items-center rounded-md bg-paper-deep px-2 py-3 ring-1 ring-ink/10 transition-[background-color,color,box-shadow] duration-200 peer-checked:bg-brass peer-checked:text-white peer-checked:ring-brass peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brass hover:ring-ink/30">
                    <span className="text-[0.65rem] uppercase tracking-[0.12em] opacity-60">{d.weekday}</span>
                    <span className="display my-0.5 text-[1.6rem] leading-none">{d.day}</span>
                    <span className="text-[0.65rem] uppercase tracking-[0.12em] opacity-60">{d.month}</span>
                  </span>
                </label>
              ))
            : Array.from({ length: 6 }, (_, i) => <span key={i} className="h-[5.25rem] w-[4.25rem] shrink-0 rounded-md bg-ink/[0.05]" />)}
        </div>
        <FieldError id="day-error" error={err("day")} />
      </fieldset>

      <ChipGroup legend="Moment de la journée" name="window" options={[...bookingWindows]} defaultValue={v.window} error={err("window")} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Nom et prénom" error={err("name")}>
          <input id="name" name="name" type="text" autoComplete="name" defaultValue={v.name} aria-invalid={!!err("name")} aria-describedby="name-error" className={input} />
        </Field>
        <Field id="email" label="Adresse e-mail" error={err("email")}>
          <input id="email" name="email" type="email" autoComplete="email" inputMode="email" defaultValue={v.email} aria-invalid={!!err("email")} aria-describedby="email-error" className={input} />
        </Field>
      </div>

      <Field id="phone" label="Téléphone" optional error={err("phone")}>
        <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" defaultValue={v.phone} aria-invalid={!!err("phone")} aria-describedby="phone-error" className={input} />
      </Field>

      <Field id="message" label="Votre situation en quelques lignes" optional error={err("message")}>
        <textarea id="message" name="message" rows={4} defaultValue={v.message} aria-invalid={!!err("message")} aria-describedby="message-help message-error" className={`${input} resize-y`} />
        <p id="message-help" className="mt-1.5 text-xs text-ink-faint">
          Restez général : n’envoyez pas de pièces ni d’informations sensibles par ce formulaire.
        </p>
      </Field>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink-soft">
          <input type="checkbox" name="consent" defaultChecked={false} aria-invalid={!!err("consent")} aria-describedby="consent-error" className="mt-1 size-4 shrink-0 accent-[#0b49b3]" />
          <span>
            J’accepte que ces informations soient utilisées pour traiter ma demande, conformément à la{" "}
            <a href="/confidentialite" className="link-draw text-ink">politique de confidentialité</a>.
          </span>
        </label>
        <FieldError id="consent-error" error={err("consent")} />
      </div>

      <Submit />
    </form>
  );
}

function Success({ onDone }: { onDone: () => void }) {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="py-10 text-center"
    >
      <svg viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="#0b49b3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto" aria-hidden="true">
        <motion.circle cx="32" cy="32" r="28" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: EASE }} />
        <motion.path d="m21 33 8 8 15-17" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: EASE, delay: 0.5 }} />
      </svg>
      <h3 className="display mt-6 text-[2.25rem]">Demande envoyée.</h3>
      <p className="prose-fr mx-auto mt-3 max-w-sm leading-relaxed text-ink-soft">
        Merci. Le cabinet revient vers vous très prochainement pour confirmer le créneau.
      </p>
      <button type="button" onClick={onDone} className="link-draw press mt-8 text-sm text-ink-soft hover:text-ink">
        Faire une autre demande
      </button>
    </motion.div>
  );
}

export function BookingForm({ motifs, availability }: { motifs: string[]; availability: Availability }) {
  // Changer la clé remonte un formulaire vierge après un succès.
  const [key, setKey] = useState(0);
  return <Form key={key} motifs={motifs} availability={availability} onDone={() => setKey((k) => k + 1)} />;
}
