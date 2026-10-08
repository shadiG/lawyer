import assert from "node:assert/strict";
import { test } from "node:test";
import { addDays, availableDays, isDayAvailable, todayParis, weekdayOf } from "../app/_lib/availability";
import type { Availability } from "../app/_lib/content";

// Mercredi 7 octobre 2026
const TODAY = "2026-10-07";
const base: Availability = { weekdays: [1, 2, 3, 4, 5], closedDates: [], minNoticeDays: 1, daysShown: 12 };

test("addDays traverse les fins de mois et d'année", () => {
  assert.equal(addDays("2026-10-31", 1), "2026-11-01");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
});

test("weekdayOf : 7 octobre 2026 est un mercredi", () => {
  assert.equal(weekdayOf("2026-10-07"), 3);
  assert.equal(weekdayOf("2026-10-10"), 6);
  assert.equal(weekdayOf("2026-10-11"), 0);
});

test("todayParis suit l'heure de Paris, pas UTC", () => {
  // 22 h 30 UTC le 8 octobre = 00 h 30 le 9 octobre à Paris (heure d'été)
  assert.equal(todayParis(new Date("2026-10-08T22:30:00Z")), "2026-10-09");
  assert.equal(todayParis(new Date("2026-10-08T10:00:00Z")), "2026-10-08");
});

test("jours ouvrés seulement : samedi et dimanche refusés par défaut", () => {
  assert.equal(isDayAvailable("2026-10-09", base, TODAY), true); // vendredi
  assert.equal(isDayAvailable("2026-10-10", base, TODAY), false); // samedi
  assert.equal(isDayAvailable("2026-10-11", base, TODAY), false); // dimanche
});

test("jours de consultation personnalisés (lundi à mercredi)", () => {
  const a = { ...base, weekdays: [1, 2, 3] };
  assert.equal(isDayAvailable("2026-10-15", a, TODAY), false); // jeudi
  assert.equal(isDayAvailable("2026-10-14", a, TODAY), true); // mercredi
});

test("jours fermés refusés", () => {
  const a = { ...base, closedDates: [{ date: "2026-10-14", reason: "Congés" }] };
  assert.equal(isDayAvailable("2026-10-14", a, TODAY), false);
  assert.equal(isDayAvailable("2026-10-13", a, TODAY), true);
});

test("délai minimum : 0 = aujourd'hui, 1 = demain, 2 = après-demain", () => {
  assert.equal(isDayAvailable("2026-10-07", { ...base, minNoticeDays: 0 }, TODAY), true);
  assert.equal(isDayAvailable("2026-10-07", { ...base, minNoticeDays: 1 }, TODAY), false);
  assert.equal(isDayAvailable("2026-10-08", { ...base, minNoticeDays: 1 }, TODAY), true);
  assert.equal(isDayAvailable("2026-10-08", { ...base, minNoticeDays: 2 }, TODAY), false);
  assert.equal(isDayAvailable("2026-10-09", { ...base, minNoticeDays: 2 }, TODAY), true);
});

test("jours passés, trop lointains et dates impossibles refusés", () => {
  assert.equal(isDayAvailable("2026-10-06", base, TODAY), false);
  assert.equal(isDayAvailable("2027-06-01", base, TODAY), false); // au-delà de l'horizon
  assert.equal(isDayAvailable("2026-02-31", base, TODAY), false);
  assert.equal(isDayAvailable("2026-13-01", base, TODAY), false);
  assert.equal(isDayAvailable("pas-une-date", base, TODAY), false);
  assert.equal(isDayAvailable("2026-10-09'; DROP", base, TODAY), false);
});

test("availableDays : ordre, nombre, et mêmes règles que isDayAvailable", () => {
  const a: Availability = { weekdays: [1, 2, 3], closedDates: [{ date: "2026-10-14", reason: "" }], minNoticeDays: 2, daysShown: 6 };
  const days = availableDays(a, TODAY);
  assert.deepEqual(days, ["2026-10-12", "2026-10-13", "2026-10-19", "2026-10-20", "2026-10-21", "2026-10-26"]);
  for (const d of days) assert.equal(isDayAvailable(d, a, TODAY), true);
});

test("availableDays ne boucle pas quand aucun jour n'est proposable", () => {
  const a: Availability = { weekdays: [], closedDates: [], minNoticeDays: 1, daysShown: 12 };
  assert.deepEqual(availableDays(a, TODAY), []);
});
