import type { Payload } from "payload";
import type { Practice } from "../payload-types";
import { isEmptyRich, plainToLexical, simpleLexical } from "../app/_lib/blog";
import { defaultContent as d } from "../app/_lib/content";

const text = (v: unknown) => (typeof v === "string" ? v : "");
/** Une ancienne saisie à convertir : du texte, et pas encore de contenu riche à sa place. */
const needsConversion = (legacy: unknown, rich: unknown) => text(legacy).trim() !== "" && isEmptyRich(rich);

/**
 * Conversion des anciens textes (saisis avant l'éditeur WYSIWYG) vers l'éditeur riche.
 *
 * Idempotente et sans perte : le texte est copié dans le champ riche, puis l'ancien champ
 * est vidé pour qu'il ne puisse pas « ressusciter » si l'avocat efface le texte riche.
 * Elle ne fait rien quand tout est déjà converti (cas courant, une simple lecture).
 */
export async function convertLegacyText(payload: Payload) {
  let converted = 0;

  const home = await payload.findGlobal({ slug: "home", depth: 0 });
  const patch: Record<string, unknown> = {};

  if (needsConversion(home.hero?.lead, home.hero?.leadRich)) {
    patch.hero = { leadRich: plainToLexical(text(home.hero?.lead)), lead: null };
    converted++;
  }

  const paragraphs = (home.about?.paragraphs ?? []).map((p) => text(p.text).trim()).filter(Boolean);
  if (paragraphs.length > 0 && isEmptyRich(home.about?.body)) {
    patch.about = { body: plainToLexical(paragraphs.join("\n\n")), paragraphs: [] };
    converted++;
  }

  const steps = home.steps ?? [];
  if (steps.some((s) => needsConversion(s.text, s.body))) {
    patch.steps = steps.map((s) =>
      needsConversion(s.text, s.body) ? { id: s.id, title: s.title, body: plainToLexical(text(s.text)), text: "" } : s,
    );
    converted++;
  }

  const fees: Record<string, unknown> = {};
  if (needsConversion(home.fees?.lead, home.fees?.leadRich)) {
    fees.leadRich = plainToLexical(text(home.fees?.lead));
    fees.lead = null;
  }
  const items = home.fees?.items ?? [];
  if (items.some((i) => needsConversion(i.text, i.body))) {
    fees.items = items.map((i) =>
      needsConversion(i.text, i.body) ? { id: i.id, title: i.title, body: plainToLexical(text(i.text)), text: "" } : i,
    );
  }
  if (Object.keys(fees).length) {
    patch.fees = fees;
    converted++;
  }

  if (Object.keys(patch).length) {
    await payload.updateGlobal({ slug: "home", data: patch as never });
  }

  const { docs: practices } = await payload.find({ collection: "practices", limit: 100, pagination: false, depth: 0 });
  for (const p of practices) {
    if (needsConversion(p.text, p.body)) {
      await payload.update({ collection: "practices", id: p.id, data: { body: plainToLexical(text(p.text)) as never, text: "" } });
      converted++;
    }
  }

  if (converted > 0) payload.logger.info(`Textes convertis vers l'éditeur riche : ${converted} bloc(s).`);
}

/**
 * Amorçage idempotent, exécuté à chaque démarrage :
 * 1. crée le premier administrateur depuis ADMIN_EMAIL / ADMIN_PASSWORD
 *    (évite l'écran « créer le premier utilisateur », ouvert à tout visiteur
 *    qui arriverait avant vous) ;
 * 2. convertit les anciens textes vers l'éditeur riche (voir convertLegacyText) ;
 * 3. pré-remplit l'admin avec le contenu par défaut si la base est vide.
 */
export async function seed(payload: Payload) {
  const { totalDocs: users } = await payload.count({ collection: "users" });
  if (users === 0) {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (email && password) {
      await payload.create({ collection: "users", data: { email, password, name: "Administrateur" } });
      payload.logger.info(`Administrateur créé : ${email}`);
    } else if (process.env.NODE_ENV === "production") {
      payload.logger.error(
        "Aucun utilisateur et ADMIN_EMAIL/ADMIN_PASSWORD absents : /admin propose de créer le premier compte à n'importe quel visiteur. Définissez ces variables et redéployez.",
      );
    }
  }

  await convertLegacyText(payload);

  const { totalDocs: practices } = await payload.count({ collection: "practices" });
  if (practices > 0) return;

  // Premier démarrage seulement : un article d'exemple publié (à modifier ou supprimer).
  // Il garantit aussi que le build a au moins une page d'article à pré-rendre.
  await payload.create({
    collection: "posts",
    draft: false,
    data: {
      title: "Bienvenue sur le blog du cabinet",
      excerpt: "Un exemple d’article, à modifier ou à supprimer depuis l’administration.",
      publishedAt: new Date().toISOString(),
      _status: "published",
      content: simpleLexical([
        { p: "Ceci est un exemple d’article. Vous pouvez le modifier, le remplacer ou le supprimer depuis l’administration, dans Contenu › Articles." },
        { h2: "Rédiger un article" },
        { p: "L’éditeur fonctionne comme un traitement de texte : titres, listes, liens, citations et images. Enregistrez un brouillon pour y revenir plus tard ; l’article n’apparaît sur le site qu’après avoir cliqué sur « Publier »." },
      ]) as never,
    },
  });

  const s = d.site;
  await payload.updateGlobal({
    slug: "settings",
    data: {
      name: s.name,
      lawyer: s.lawyer,
      monogram: s.monogram,
      title: s.title,
      barreau: s.barreau,
      address: s.address,
      phone: s.phone,
      email: s.email,
      hours: s.hours,
      responseTime: s.responseTime,
      ...d.legal,
    },
  });

  const rich = (v: unknown) => plainToLexical(text(v)) as unknown as NonNullable<Practice["body"]>;
  await payload.updateGlobal({
    slug: "home",
    data: {
      hero: { eyebrow: d.hero.eyebrow, title: d.hero.title, leadRich: rich(d.hero.lead), highlights: d.hero.highlights },
      about: { title: d.about.title, body: rich(d.about.body), quote: d.about.quote, facts: d.about.facts },
      steps: d.steps.map((st) => ({ title: st.title, body: rich(st.text), text: "" })),
      fees: {
        title: d.fees.title,
        leadRich: rich(d.fees.lead),
        items: d.fees.items.map((i) => ({ title: i.title, body: rich(i.text), text: "" })),
      },
      booking: { title: d.booking.title, lead: d.booking.lead },
    },
  });

  for (const [i, p] of d.practices.entries()) {
    await payload.create({
      collection: "practices",
      data: { title: p.title, icon: p.icon, body: rich(p.text), text: "", items: p.items.map((t) => ({ text: t })), order: (i + 1) * 10 },
    });
  }
  payload.logger.info("Contenu par défaut chargé dans l'administration.");
}
