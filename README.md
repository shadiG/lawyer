# Cabinet d'avocat : site vitrine et prise de rendez-vous

Site en français pour un cabinet d'avocat : présentation, domaines d'intervention, déroulé, honoraires et formulaire de demande de rendez-vous.

**Stack :** Next.js (App Router) · React 19 · Tailwind CSS v4 · Motion · Zod · Resend.

## Démarrer

```sh
npm install
npm run dev        # http://localhost:3000
```

En développement, sans clé Resend, une demande de rendez-vous s'affiche dans la console au lieu d'être envoyée.

## Personnaliser

Tous les textes (nom, barreau, adresse, téléphone, domaines, honoraires…) sont dans [app/_lib/content.ts](app/_lib/content.ts). **Ce sont des textes provisoires** : remplacez-les avant la mise en ligne, ainsi que les champs entre crochets des pages [mentions légales](app/mentions-legales/page.tsx) et [confidentialité](app/confidentialite/page.tsx).

Variables d'environnement : voir [.env.example](.env.example).

## Structure

| Dossier | Contenu |
| --- | --- |
| `app/_components` | sections de la page, navigation, bouton, formulaire |
| `app/_lib` | contenu, schéma Zod, Server Action de réservation |
| `docs/ops/vps.md` | déploiement Coolify + Docker |

## Déploiement

Docker sur le VPS via Coolify : voir [docs/ops/vps.md](docs/ops/vps.md).

## Prochaine tranche

Espace d'administration (connexion, édition des contenus, médiathèque, suivi des demandes de rendez-vous) pour gérer le site sans toucher au code.
