import Link from "next/link";
import type { ServerProps } from "payload";

type Booking = {
  id: number | string;
  name: string;
  motif: string;
  day: string;
  status?: string | null;
  createdAt: string;
};

const STATUTS: Record<string, string> = {
  nouveau: "Nouvelle",
  confirme: "Confirmée",
  "sans-suite": "Sans suite",
  archive: "Archivée",
};

const fmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Tableau de bord façon WordPress : bienvenue, « D'un coup d'œil », activité. */
export async function Dashboard({ payload, user }: ServerProps) {
  const opts = { overrideAccess: false as const, user };
  const safe = async <T,>(fn: () => Promise<T>, repli: T): Promise<T> => {
    try {
      return await fn();
    } catch {
      return repli;
    }
  };

  const [articles, domaines, medias, demandes, nouvelles, recentes] = await Promise.all([
    safe(async () => (await payload.count({ collection: "posts", ...opts })).totalDocs, 0),
    safe(async () => (await payload.count({ collection: "practices", ...opts })).totalDocs, 0),
    safe(async () => (await payload.count({ collection: "media", ...opts })).totalDocs, 0),
    safe(async () => (await payload.count({ collection: "bookings", ...opts })).totalDocs, 0),
    safe(
      async () =>
        (await payload.count({ collection: "bookings", where: { status: { equals: "nouveau" } }, ...opts })).totalDocs,
      0,
    ),
    safe(
      async () =>
        (await payload.find({ collection: "bookings", sort: "-createdAt", limit: 6, depth: 0, ...opts })).docs as unknown as Booking[],
      [] as Booking[],
    ),
  ]);

  return (
    <div className="wp-dashboard">
      <h1 className="wp-title">Tableau de bord</h1>

      <section className="wp-welcome">
        <h2>Bienvenue sur l’administration du cabinet !</h2>
        <p className="wp-welcome__lead">Voici quelques liens pour démarrer :</p>
        <div className="wp-welcome__cols">
          <div>
            <h3>Pour commencer</h3>
            <Link prefetch={false} className="wp-btn wp-btn--primary wp-btn--lg" href="/admin/globals/home">Modifier la page d’accueil</Link>
            <p className="wp-welcome__or">ou <Link prefetch={false} href="/admin/globals/settings">modifier les coordonnées du cabinet</Link></p>
          </div>
          <div>
            <h3>Actions rapides</h3>
            <ul className="wp-links">
              <li><Link prefetch={false} href="/admin/collections/posts/create">Rédiger un article</Link></li>
              <li><Link prefetch={false} href="/admin/collections/practices/create">Ajouter un domaine d’intervention</Link></li>
              <li><Link prefetch={false} href="/admin/collections/media/create">Ajouter une photo</Link></li>
              <li><Link prefetch={false} href="/admin/collections/bookings">Gérer les demandes de rendez-vous</Link></li>
            </ul>
          </div>
          <div>
            <h3>Et ensuite</h3>
            <ul className="wp-links">
              <li><a href="/" target="_blank" rel="noopener">Voir votre site</a></li>
              <li><Link prefetch={false} href="/admin/globals/settings">Mentions légales et confidentialité</Link></li>
              <li><Link prefetch={false} href="/admin/collections/users">Gérer les utilisateurs</Link></li>
            </ul>
          </div>
        </div>
      </section>

      <div className="wp-widgets">
        <section className="wp-postbox">
          <h2 className="wp-postbox__title">D’un coup d’œil</h2>
          <div className="wp-postbox__body">
            <ul className="wp-glance">
              <li className="wp-glance__item wp-glance__item--articles">
                <Link prefetch={false} href="/admin/collections/posts">{articles} article{articles > 1 ? "s" : ""}</Link>
              </li>
              <li className="wp-glance__item wp-glance__item--domaines">
                <Link prefetch={false} href="/admin/collections/practices">{domaines} domaine{domaines > 1 ? "s" : ""} d’intervention</Link>
              </li>
              <li className="wp-glance__item wp-glance__item--media">
                <Link prefetch={false} href="/admin/collections/media">{medias} média{medias > 1 ? "s" : ""}</Link>
              </li>
              <li className="wp-glance__item wp-glance__item--demandes">
                <Link prefetch={false} href="/admin/collections/bookings">{demandes} demande{demandes > 1 ? "s" : ""} de rendez-vous</Link>
              </li>
              {nouvelles > 0 ? (
                <li className="wp-glance__item wp-glance__item--nouvelles">
                  <Link prefetch={false} href="/admin/collections/bookings">
                    <strong>{nouvelles} nouvelle{nouvelles > 1 ? "s" : ""}</strong> à traiter
                  </Link>
                </li>
              ) : null}
            </ul>
            <p className="wp-muted">Vos modifications sont visibles sur le site dès l’enregistrement.</p>
          </div>
        </section>

        <section className="wp-postbox">
          <h2 className="wp-postbox__title">Activité : dernières demandes</h2>
          <div className="wp-postbox__body">
            {recentes.length === 0 ? (
              <p className="wp-muted">Aucune demande pour le moment. Elles apparaîtront ici dès qu’un visiteur remplira le formulaire.</p>
            ) : (
              <ul className="wp-activity">
                {recentes.map((b) => (
                  <li key={b.id}>
                    <span className="wp-activity__date">{fmt.format(new Date(b.createdAt))}</span>
                    <span className="wp-activity__text">
                      <Link prefetch={false} href={`/admin/collections/bookings/${b.id}`}>{b.name}</Link>
                      <span className="wp-muted"> · {b.motif}</span>
                    </span>
                    <span className={`wp-pill wp-pill--${b.status ?? "nouveau"}`}>{STATUTS[b.status ?? "nouveau"] ?? b.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
