/**
 * Exécuté une fois au démarrage du serveur, avant qu'il accepte la moindre requête.
 *
 * On initialise Payload ici pour que les migrations de la base, la création du premier
 * administrateur et la conversion des anciens textes (cms/seed.ts) se fassent au démarrage
 * du conteneur, pas à la première requête qui touche la base. Si l'une de ces étapes échoue,
 * le serveur ne démarre pas : le déploiement échoue franchement (Coolify garde l'ancienne
 * version) au lieu de servir un site à moitié migré.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const [{ getPayload }, { default: config }] = await Promise.all([import("payload"), import("@payload-config")]);
  await getPayload({ config });
}
