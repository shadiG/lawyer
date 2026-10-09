import config from "@payload-config";
import { cacheLife, cacheTag } from "next/cache";
import { getPayload } from "payload";
import { CMS_TAG } from "@/cms/hooks/revalidate";
import type { Media } from "@/payload-types";
import { isEmptyRich, pickRich } from "./blog";
import { defaultContent as d, OTHER_MOTIF, toTelHref, type Availability, type PracticeIcon, type SiteContent } from "./content";

/* Fusion « admin > défaut », champ par champ : un champ vidé retombe sur le défaut. */
const str = (v: unknown, fallback: string) => (typeof v === "string" && v.trim() ? v.trim() : fallback);
const rows = <T, R>(v: T[] | null | undefined, map: (x: T) => R | null, fallback: R[]): R[] => {
  const out = (v ?? []).map(map).filter((x): x is R => x !== null);
  return out.length ? out : fallback;
};

/** Jours ouverts valides (0–6), jours fermés au format AAAA-MM-JJ, bornes raisonnables. */
function availabilityFrom(a: { weekdays?: (string | number)[] | null; closedDates?: { date?: string | null; reason?: string | null }[] | null; minNoticeDays?: number | null; daysShown?: number | null } | null | undefined): Availability {
  const clamp = (n: unknown, min: number, max: number, repli: number) =>
    typeof n === "number" && Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : repli;
  const weekdays = (a?.weekdays ?? []).map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
  return {
    // Aucun jour coché = on garde les défauts (sinon le formulaire serait vide).
    weekdays: weekdays.length ? [...new Set(weekdays)] : d.availability.weekdays,
    closedDates: (a?.closedDates ?? []).flatMap((c) => (c.date ? [{ date: c.date.slice(0, 10), reason: c.reason ?? "" }] : [])),
    minNoticeDays: clamp(a?.minNoticeDays, 0, 30, d.availability.minNoticeDays),
    daysShown: clamp(a?.daysShown, 3, 30, d.availability.daysShown),
  };
}

const ICONS: PracticeIcon[] = ["family", "work", "criminal", "property"];

/**
 * Tout le contenu éditable du site, en une lecture mise en cache.
 * Invalidée par `publishChanges()` (cms/hooks/revalidate.ts) quand l'avocat
 * enregistre dans /admin : le site public se régénère à la visite suivante.
 */
export async function getContent(): Promise<SiteContent> {
  "use cache";
  cacheTag(CMS_TAG);

  try {
    const payload = await getPayload({ config });
    const [settings, home, practices] = await Promise.all([
      payload.findGlobal({ slug: "settings", depth: 1 }),
      payload.findGlobal({ slug: "home", depth: 0 }),
      payload.find({ collection: "practices", sort: "order", limit: 12, depth: 1, pagination: false }),
    ]);
    cacheLife("max");

    const photo = typeof settings.portrait === "object" ? (settings.portrait as Media | null) : null;
    const phone = str(settings.phone, d.site.phone);
    const practiceList = rows(
      practices.docs,
      (p) => ({
        id: String(p.id),
        icon: ICONS.includes(p.icon as PracticeIcon) ? (p.icon as PracticeIcon) : "criminal",
        title: str(p.title, ""),
        text: pickRich(p.body, str(p.text, "")),
        items: rows(p.items, (i) => str(i.text, "") || null, []),
        imageUrl: typeof p.image === "object" && p.image ? ((p.image as Media).sizes?.card?.url ?? (p.image as Media).url ?? null) : null,
      }),
      d.practices,
    );

    return {
      site: {
        name: str(settings.name, d.site.name),
        lawyer: str(settings.lawyer, d.site.lawyer),
        monogram: str(settings.monogram, d.site.monogram),
        title: str(settings.title, d.site.title),
        barreau: str(settings.barreau, d.site.barreau),
        address: {
          street: str(settings.address?.street, d.site.address.street),
          postalCode: str(settings.address?.postalCode, d.site.address.postalCode),
          city: str(settings.address?.city, d.site.address.city),
        },
        phone,
        phoneHref: toTelHref(phone),
        email: str(settings.email, d.site.email),
        hours: rows(settings.hours, (h) => (h.days && h.time ? { days: h.days, time: h.time } : null), d.site.hours),
        responseTime: str(settings.responseTime, d.site.responseTime),
        portraitUrl: photo?.sizes?.portrait?.url ?? photo?.url ?? null,
        portraitAlt: photo?.alt ?? null,
      },
      availability: availabilityFrom(settings.availability),
      hero: {
        eyebrow: str(home.hero?.eyebrow, d.hero.eyebrow),
        title: str(home.hero?.title, d.hero.title),
        lead: pickRich(home.hero?.leadRich, str(home.hero?.lead, d.hero.lead as string)),
        highlights: rows(home.hero?.highlights, (h) => (h.title && h.text ? { title: h.title, text: h.text } : null), d.hero.highlights),
      },
      about: {
        eyebrow: d.about.eyebrow,
        title: str(home.about?.title, d.about.title),
        body: pickRich(home.about?.body, rows(home.about?.paragraphs, (p) => str(p.text, "") || null, []).join("\n\n") || d.about.body),
        quote: str(home.about?.quote, d.about.quote),
        facts: rows(home.about?.facts, (f) => (f.label && f.value ? { label: f.label, value: f.value } : null), d.about.facts),
      },
      practices: practiceList,
      steps: rows(
        home.steps,
        (s) => {
          const text = pickRich(s.body, s.text ?? "");
          return s.title && !isEmptyRich(text) ? { title: s.title, text } : null;
        },
        d.steps,
      ),
      fees: {
        eyebrow: d.fees.eyebrow,
        title: str(home.fees?.title, d.fees.title),
        lead: pickRich(home.fees?.leadRich, str(home.fees?.lead, d.fees.lead as string)),
        items: rows(
          home.fees?.items,
          (i) => {
            const text = pickRich(i.body, i.text ?? "");
            return i.title && !isEmptyRich(text) ? { title: i.title, text } : null;
          },
          d.fees.items,
        ),
      },
      booking: {
        eyebrow: d.booking.eyebrow,
        title: str(home.booking?.title, d.booking.title),
        lead: str(home.booking?.lead, d.booking.lead),
        motifs: [...practiceList.map((p) => p.title), OTHER_MOTIF],
      },
      legal: {
        siret: str(settings.siret, d.legal.siret),
        vat: str(settings.vat, d.legal.vat),
        insurer: str(settings.insurer, d.legal.insurer),
        hosting: str(settings.hosting, d.legal.hosting),
        mediator: str(settings.mediator, d.legal.mediator),
        retention: str(settings.retention, d.legal.retention),
        updated: str(settings.updated, d.legal.updated),
      },
    };
  } catch (err) {
    // La base est indisponible : le site reste en ligne avec le contenu par
    // défaut, et on ne fige pas cet état (cache de quelques secondes).
    console.error("CMS indisponible, contenu par défaut utilisé :", err);
    cacheLife("seconds");
    return { ...d, booking: { ...d.booking, motifs: [...d.practices.map((p) => p.title), OTHER_MOTIF] } };
  }
}
