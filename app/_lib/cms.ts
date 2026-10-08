import config from "@payload-config";
import { cacheLife, cacheTag } from "next/cache";
import { getPayload } from "payload";
import { CMS_TAG } from "@/cms/hooks/revalidate";
import type { Media } from "@/payload-types";
import { defaultContent as d, OTHER_MOTIF, toTelHref, type PracticeIcon, type SiteContent } from "./content";

/* Fusion « admin > défaut », champ par champ : un champ vidé retombe sur le défaut. */
const str = (v: unknown, fallback: string) => (typeof v === "string" && v.trim() ? v.trim() : fallback);
const rows = <T, R>(v: T[] | null | undefined, map: (x: T) => R | null, fallback: R[]): R[] => {
  const out = (v ?? []).map(map).filter((x): x is R => x !== null);
  return out.length ? out : fallback;
};

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
        text: str(p.text, ""),
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
      hero: {
        eyebrow: str(home.hero?.eyebrow, d.hero.eyebrow),
        title: str(home.hero?.title, d.hero.title),
        lead: str(home.hero?.lead, d.hero.lead),
        highlights: rows(home.hero?.highlights, (h) => (h.title && h.text ? { title: h.title, text: h.text } : null), d.hero.highlights),
      },
      about: {
        eyebrow: d.about.eyebrow,
        title: str(home.about?.title, d.about.title),
        paragraphs: rows(home.about?.paragraphs, (p) => str(p.text, "") || null, d.about.paragraphs),
        quote: str(home.about?.quote, d.about.quote),
        facts: rows(home.about?.facts, (f) => (f.label && f.value ? { label: f.label, value: f.value } : null), d.about.facts),
      },
      practices: practiceList,
      steps: rows(home.steps, (s) => (s.title && s.text ? { title: s.title, text: s.text } : null), d.steps),
      fees: {
        eyebrow: d.fees.eyebrow,
        title: str(home.fees?.title, d.fees.title),
        lead: str(home.fees?.lead, d.fees.lead),
        items: rows(home.fees?.items, (i) => (i.title && i.text ? { title: i.title, text: i.text } : null), d.fees.items),
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
