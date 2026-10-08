import Link from "next/link";
import type { ServerProps } from "payload";

/**
 * Haut du menu latéral : « Tableau de bord » + pastille des nouvelles demandes.
 *
 * La pastille (comme celle des commentaires en attente dans WordPress) est un
 * pseudo-élément CSS posé sur le lien « Demandes de rendez-vous » : on injecte
 * seulement une règle `content` côté serveur, sans toucher au DOM géré par React.
 */
export async function NavTop({ payload, user }: ServerProps) {
  let nouvelles = 0;
  try {
    const r = await payload.count({
      collection: "bookings",
      where: { status: { equals: "nouveau" } },
      overrideAccess: false,
      user,
    });
    nouvelles = r.totalDocs;
  } catch {
    /* pas de pastille si la base ne répond pas */
  }

  return (
    <>
      {nouvelles > 0 ? (
        <style>{`#nav-bookings::after{content:"${nouvelles > 99 ? "99+" : nouvelles}"}`}</style>
      ) : null}
      <Link prefetch={false} className="nav__link wp-nav-dashboard" id="nav-dashboard" href="/admin">
        <span className="nav__link-label">Tableau de bord</span>
      </Link>
    </>
  );
}
