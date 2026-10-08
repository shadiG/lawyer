# Site du cabinet sur le VPS (Coolify)

Le site est une app Next.js servie par un seul conteneur, construit par Coolify à partir du `Dockerfile` à la racine. Le serveur Node est nécessaire : le formulaire de rendez-vous est une Server Action.

| Adresse | Rôle |
| --- | --- |
| `https://lawyer.shadgramers.com/` | le site |
| `https://lawyer.shadgramers.com/healthz` | santé du conteneur (200 `ok`) |

Chaque push sur `main` lance `.github/workflows/vps.yml` : le CI d'abord (lint, types, build), puis un appel demande à Coolify de reconstruire. Un build rouge n'atteint jamais le serveur. Tant que les réglages GitHub ci-dessous n'existent pas, le workflow saute le déploiement avec un avis.

## Mise en place (une fois)

### 1. DNS
Un enregistrement `A` pour `lawyer.shadgramers.com` vers le VPS (ou le domaine réel du cabinet).

### 2. L'app dans Coolify
1. Projet → **+ New** → **Private Repository (with GitHub App)** → `shadiG/lawyer`, branche `main`.
2. Build Pack **Dockerfile**, Base Directory `/`, Dockerfile Location `/Dockerfile`.
3. **Ports Exposes `3000`** (le conteneur écoute sur 3000, pas 80).
4. Domaine `https://lawyer.shadgramers.com`, sans port.
5. Variables d'environnement :

   | Nom | Valeur | Build Variable ? |
   | --- | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | `https://lawyer.shadgramers.com` | **oui** (figée au build) |
   | `RESEND_API_KEY` | clé API Resend | non (exécution seulement) |
   | `BOOKING_TO_EMAIL` | adresse qui reçoit les demandes | non |
   | `BOOKING_FROM_EMAIL` | `Cabinet <rendez-vous@domaine-verifie>` | non |

   Sans les trois variables d'envoi, le formulaire affiche un message invitant à téléphoner : rien n'est perdu en silence.
6. Avancé → **Auto Deploy désactivé** : GitHub déclenche le déploiement après le CI.
7. Déployer une première fois à la main. Le conteneur déclare un `HEALTHCHECK` sur `/healthz`.

### 3. Resend
Créer un compte, vérifier le domaine d'envoi (enregistrements DNS SPF/DKIM), créer une clé API.

### 4. Laisser GitHub déclencher les déploiements
1. Coolify → Keys & Tokens → API tokens → créer un jeton avec **deploy**, dans l'équipe qui possède l'app.
2. Copier l'**UUID** de l'application.
3. GitHub → Settings → Environments → **New environment** `vps` :

| Type | Nom | Valeur |
| --- | --- | --- |
| Variable | `COOLIFY_URL` | `https://coolify.shadgramers.com` |
| Variable | `COOLIFY_RESOURCE_UUID` | l'UUID |
| Secret | `COOLIFY_TOKEN` | le jeton d'API |

## Au quotidien
- Redéployer à la main : Actions → **VPS deploy** → Run workflow, ou Deploy dans Coolify.
- Revenir en arrière : dans Coolify, onglet Deployments, redéployer une version antérieure.
- Vérifier que le site est en ligne :
  ```sh
  for p in / /healthz /mentions-legales /confidentialite /robots.txt /sitemap.xml; do
    printf '%-20s ' "$p"; curl -s -o /dev/null -w '%{http_code}\n' "https://lawyer.shadgramers.com$p"; done
  ```
- Construire et lancer l'image en local :
  ```sh
  docker build --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 -t lawyer .
  docker run --rm -p 3000:3000 lawyer     # http://localhost:3000
  ```

## Si ça ne marche pas
| Symptôme | Cause probable | Correction |
| --- | --- | --- |
| Toutes les URLs en 502 | « Ports Exposes » laissé sur une autre valeur, ou build en cours/échoué | Mettre `3000`, enregistrer, redéployer ; sinon lire le log de déploiement |
| `No resources found` au déploiement | Mauvais UUID, ou jeton d'une autre équipe | Le workflow liste les apps visibles : copier le bon UUID |
| Le formulaire dit « envoi indisponible » | `RESEND_API_KEY`, `BOOKING_TO_EMAIL` ou `BOOKING_FROM_EMAIL` manquant | Les définir (variables d'exécution) et redéployer |
| Liens canoniques en `localhost` | `NEXT_PUBLIC_SITE_URL` absent ou non coché « Build Variable » | Le cocher et redéployer |
