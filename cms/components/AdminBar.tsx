import Link from "next/link";
import type { ServerProps } from "payload";

/** Barre d'administration noire, au-dessus de tout (comme celle de WordPress). */
export async function AdminBar({ payload, user }: ServerProps) {
  // Pas de barre sur l'écran de connexion.
  if (!user) return null;
  let nom = "Cabinet";
  try {
    const s = await payload.findGlobal({ slug: "settings", depth: 0 });
    nom = s.name || nom;
  } catch {
    /* repli sur le nom par défaut */
  }
  const bonjour = (user as { name?: string; email?: string } | null)?.name || (user as { email?: string } | null)?.email || "";

  return (
    <div className="wp-adminbar" role="navigation" aria-label="Barre d’administration">
      <ul className="wp-adminbar__left">
        <li className="wp-adminbar__item wp-adminbar__site">
          <a href="/" target="_blank" rel="noopener">
            <span className="wp-adminbar__icon wp-adminbar__icon--home" aria-hidden="true" />
            {nom}
          </a>
          <ul className="wp-adminbar__sub">
            <li><a href="/" target="_blank" rel="noopener">Voir le site</a></li>
          </ul>
        </li>
        <li className="wp-adminbar__item wp-adminbar__new">
          <Link prefetch={false} href="/admin/collections/posts/create">
            <span className="wp-adminbar__icon wp-adminbar__icon--plus" aria-hidden="true" />
            Nouveau
          </Link>
          <ul className="wp-adminbar__sub">
            <li><Link prefetch={false} href="/admin/collections/posts/create">Article</Link></li>
            <li><Link prefetch={false} href="/admin/collections/practices/create">Domaine d’intervention</Link></li>
            <li><Link prefetch={false} href="/admin/collections/media/create">Média</Link></li>
            <li><Link prefetch={false} href="/admin/collections/users/create">Utilisateur</Link></li>
          </ul>
        </li>
      </ul>
      <ul className="wp-adminbar__right">
        <li className="wp-adminbar__item">
          <Link prefetch={false} href="/admin/account">Bonjour, {bonjour}</Link>
        </li>
      </ul>
    </div>
  );
}
