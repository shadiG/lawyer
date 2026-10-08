import type { Availability } from "./content";

/** Horizon maximal : on ne propose ni n'accepte rien au-delà de ~4 mois. */
export const HORIZON_DAYS = 130;

const PARIS_DAY = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Paris" }); // AAAA-MM-JJ

/** Le jour calendaire d'aujourd'hui à Paris (le cabinet raisonne en heure de Paris). */
export const todayParis = (now: Date = new Date()) => PARIS_DAY.format(now);

/** Ajoute `n` jours à une date AAAA-MM-JJ (calcul à midi UTC : insensible aux changements d'heure). */
export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** 0 = dimanche … 6 = samedi, pour une date AAAA-MM-JJ. */
export const weekdayOf = (iso: string) => new Date(`${iso}T12:00:00Z`).getUTCDay();

/**
 * Ce jour peut-il être demandé ?
 * Mêmes règles pour le formulaire (affichage) et le serveur (validation, qui fait foi) :
 * date réelle, jour ouvré, jour non fermé, délai minimum respecté, dans l'horizon.
 */
export function isDayAvailable(iso: string, a: Availability, today: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const date = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso) return false; // ex. 31 février
  if (!a.weekdays.includes(weekdayOf(iso))) return false;
  if (a.closedDates.some((c) => c.date === iso)) return false;
  return iso >= addDays(today, a.minNoticeDays) && iso <= addDays(today, HORIZON_DAYS);
}

/** Les `daysShown` premiers jours proposables, dans l'ordre chronologique. */
export function availableDays(a: Availability, today: string): string[] {
  const out: string[] = [];
  for (let i = a.minNoticeDays; i <= HORIZON_DAYS && out.length < a.daysShown; i++) {
    const iso = addDays(today, i);
    if (isDayAvailable(iso, a, today)) out.push(iso);
  }
  return out;
}
