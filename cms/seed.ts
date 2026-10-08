import type { Payload } from "payload";
import { defaultContent as d } from "../app/_lib/content";

/**
 * Amorçage idempotent, exécuté à chaque démarrage :
 * 1. crée le premier administrateur depuis ADMIN_EMAIL / ADMIN_PASSWORD
 *    (évite l'écran « créer le premier utilisateur », ouvert à tout visiteur
 *    qui arriverait avant vous) ;
 * 2. pré-remplit l'admin avec le contenu par défaut si la base est vide.
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

  const { totalDocs: practices } = await payload.count({ collection: "practices" });
  if (practices > 0) return;

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

  await payload.updateGlobal({
    slug: "home",
    data: {
      hero: d.hero,
      about: {
        title: d.about.title,
        paragraphs: d.about.paragraphs.map((text) => ({ text })),
        quote: d.about.quote,
        facts: d.about.facts,
      },
      steps: d.steps,
      fees: { title: d.fees.title, lead: d.fees.lead, items: d.fees.items },
      booking: { title: d.booking.title, lead: d.booking.lead },
    },
  });

  for (const [i, p] of d.practices.entries()) {
    await payload.create({
      collection: "practices",
      data: { title: p.title, icon: p.icon, text: p.text, items: p.items.map((text) => ({ text })), order: (i + 1) * 10 },
    });
  }
  payload.logger.info("Contenu par défaut chargé dans l'administration.");
}
