# Cabinet d'avocat : site vitrine et prise de rendez-vous

Site en français pour un cabinet d'avocat : présentation, domaines d'intervention, déroulé, honoraires et formulaire de demande de rendez-vous.

**Stack :** Next.js (App Router) · React 19 · Tailwind CSS v4 · Motion · Payload CMS (admin, SQLite) · Zod · Resend.

## Démarrer

```sh
npm install
cp .env.example .env     # puis renseigner PAYLOAD_SECRET (≥ 32 car.), ADMIN_EMAIL, ADMIN_PASSWORD
npm run dev              # site : http://localhost:3000 · admin : http://localhost:3000/admin
```

Si le navigateur affiche « module factory is not available » ou « stale browser cache » (cache de développement périmé), lancez `npm run dev:clean` puis rechargez la page sans cache (Cmd/Ctrl + Maj + R).

Au premier démarrage la base est créée dans `data/`, le compte administrateur est créé depuis `ADMIN_*` et l'admin est pré-remplie avec le contenu par défaut. Sans clé Resend, une demande de rendez-vous est enregistrée dans l'admin et affichée dans la console.

## Personnaliser

L'avocat modifie tout dans l'administration (`/admin`) : voir le [guide](docs/admin-guide.md). Le contenu par défaut, utilisé comme repli et pour pré-remplir l'admin, est dans [app/_lib/content.ts](app/_lib/content.ts). **Ce sont des textes provisoires** : remplacez-les dans l'admin avant la mise en ligne.

Variables d'environnement : voir [.env.example](.env.example).

### Schéma de la base
Après avoir modifié une collection ou un global (`cms/`) : `npx payload generate:types`, `npx payload generate:importmap`, puis `npx payload migrate:create <nom>` et committer la migration. En production le schéma évolue uniquement par migrations, exécutées au démarrage.

## Structure

| Dossier | Contenu |
| --- | --- |
| `app/_components` | sections de la page, navigation, bouton, formulaire |
| `app/_lib` | contenu par défaut, lecture du CMS (`cms.ts`), Server Action de réservation |
| `cms` | collections et globaux Payload, hooks, amorçage |
| `migrations` | migrations de la base (générées) |
| `docs/ops/vps.md` | déploiement Coolify + Docker |

## Déploiement

Docker sur le VPS via Coolify : voir [docs/ops/vps.md](docs/ops/vps.md).
