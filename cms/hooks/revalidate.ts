import { revalidateTag } from "next/cache";

/** Tag partagé par toutes les lectures du CMS (voir app/_lib/cms.ts). */
export const CMS_TAG = "cms";

/**
 * Publie un changement : le site public se régénère à la prochaine visite.
 * `expire: 0` = jamais de contenu périmé : l'avocat enregistre, ouvre son site
 * et voit tout de suite le changement (avec "max", la 1re visite verrait
 * encore l'ancienne version).
 * Hors d'une requête Next (amorçage au démarrage, scripts), l'appel lève :
 * on l'ignore, il n'y a alors rien en cache à invalider.
 */
export function publishChanges() {
  try {
    revalidateTag(CMS_TAG, { expire: 0 });
  } catch {
    /* hors contexte de requête */
  }
}
