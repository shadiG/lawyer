# Site du cabinet sur le VPS (Coolify)

Le site est une app Next.js avec une administration intégrée (Payload CMS), servie par un seul conteneur construit par Coolify à partir du `Dockerfile` à la racine. Les données (base SQLite et photos téléversées) vivent dans un **volume persistant** monté sur `/data`.

| Adresse | Rôle |
| --- | --- |
| `https://lawyer.shadgramers.com/` | le site public |
| `https://lawyer.shadgramers.com/admin` | l'administration (voir [le guide de l'avocat](../admin-guide.md)) |
| `https://lawyer.shadgramers.com/healthz` | santé du conteneur (200 `ok`) |

Chaque push sur `main` lance `.github/workflows/vps.yml` : le CI d'abord (lint, types, build), puis un appel demande à Coolify de reconstruire. Un build rouge n'atteint jamais le serveur. Tant que les réglages GitHub ci-dessous n'existent pas, le workflow saute le déploiement avec un avis.

> ⚠️ **Avant le premier déploiement de l'administration**, les variables `PAYLOAD_SECRET` et `ADMIN_*` doivent exister dans Coolify. Sans `PAYLOAD_SECRET`, le conteneur s'arrête volontairement avec un message clair (il ne démarre pas à moitié configuré).

## Mise en place (une fois)

### 1. DNS
Un enregistrement `A` pour `lawyer.shadgramers.com` vers le VPS (ou le domaine réel du cabinet).

### 2. L'app dans Coolify
1. Projet → **+ New** → **Private Repository (with GitHub App)** → `shadiG/lawyer`, branche `main`.
2. Build Pack **Dockerfile**, Base Directory `/`, Dockerfile Location `/Dockerfile`.
3. **Ports Exposes `3000`**.
4. Domaine `https://lawyer.shadgramers.com`, sans port.
5. **Persistent Storage** : ajouter un volume, destination dans le conteneur **`/data`**. Sans lui, la base et les photos disparaissent à chaque déploiement.
6. Variables d'environnement :

   | Nom | Valeur | Build Variable ? |
   | --- | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | `https://lawyer.shadgramers.com` | **oui** (figée au build) |
   | `PAYLOAD_SECRET` | `openssl rand -hex 32` (≥ 32 caractères, à garder : il signe les sessions) | non |
   | `ADMIN_EMAIL` | e-mail du premier administrateur | non |
   | `ADMIN_PASSWORD` | mot de passe solide, **à changer dans l'admin après la première connexion** | non |
   | `ADMIN_ALLOWED_ORIGINS` | autres adresses d'accès à l'admin (ex. `https://www.exemple.fr`), séparées par des virgules. Facultatif | non |
   | `RESEND_API_KEY` | clé API Resend. Facultatif | non |
   | `BOOKING_TO_EMAIL` | adresse qui reçoit les notifications. Facultatif | non |
   | `BOOKING_FROM_EMAIL` | `Cabinet <rendez-vous@domaine-verifie>`. Facultatif | non |

   Les trois variables d'envoi sont facultatives : une demande de rendez-vous est **toujours enregistrée** dans l'administration ; l'e-mail est une notification en plus. Si l'enregistrement et l'e-mail échouent tous les deux, le visiteur voit un message l'invitant à téléphoner.
7. Avancé → **Auto Deploy désactivé** : GitHub déclenche le déploiement après le CI.
8. Déployer une première fois à la main. Au premier démarrage, la base est créée (migrations), le compte administrateur est créé depuis `ADMIN_*`, et l'administration est pré-remplie avec le contenu par défaut.

### 3. Première connexion
Ouvrir `/admin`, se connecter avec `ADMIN_EMAIL` / `ADMIN_PASSWORD`, puis **changer le mot de passe** (Administration › Utilisateurs). Remplacer ensuite les textes provisoires (voir le guide de l'avocat) et les champs légaux (Cabinet › Mentions légales).

> Si `ADMIN_EMAIL`/`ADMIN_PASSWORD` sont absents et qu'aucun utilisateur n'existe, `/admin` propose de créer le premier compte **à n'importe quel visiteur**. Le conteneur le signale dans ses logs : ne laissez pas cet état en ligne.

### 4. Resend (facultatif)
Créer un compte, vérifier le domaine d'envoi (enregistrements DNS SPF/DKIM), créer une clé API.

### 5. Laisser GitHub déclencher les déploiements
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
- Revenir en arrière : dans Coolify, onglet Deployments, redéployer une version antérieure. Les données (volume) ne sont pas touchées.
- Vérifier que le site est en ligne :
  ```sh
  for p in / /admin/login /healthz /mentions-legales /confidentialite /robots.txt /sitemap.xml; do
    printf '%-20s ' "$p"; curl -s -o /dev/null -w '%{http_code}\n' "https://lawyer.shadgramers.com$p"; done
  ```
- Construire et lancer l'image en local :
  ```sh
  docker build --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 -t lawyer .
  docker run --rm -p 3000:3000 -v lawyer-data:/data \
    -e PAYLOAD_SECRET=$(openssl rand -hex 32) \
    -e ADMIN_EMAIL=admin@exemple.fr -e ADMIN_PASSWORD=un-mot-de-passe-solide lawyer
  ```

## Sauvegardes (à mettre en place)
Tout ce qui est éditable (textes, photos, demandes de rendez-vous) est dans `/data`. Une perte du volume = perte de ces données, **sauf** les demandes de rendez-vous si l'e-mail de notification est configuré.
- Sauvegarder régulièrement le volume `/data` (sauvegarde du volume Coolify, ou copie planifiée du dossier depuis l'hôte).
- Pour une copie de la base strictement cohérente, la faire conteneur arrêté, ou passer à PostgreSQL (service géré par Coolify avec sauvegardes planifiées) : le changement se limite à l'adaptateur de base dans `payload.config.ts`.
- Conserver `PAYLOAD_SECRET` ailleurs qu'uniquement dans Coolify.

## Si ça ne marche pas
| Symptôme | Cause probable | Correction |
| --- | --- | --- |
| Toutes les URLs en 502 | « Ports Exposes » différent de `3000`, ou build en cours/échoué | Mettre `3000`, enregistrer, redéployer ; sinon lire le log de déploiement |
| Le conteneur s'arrête, log « PAYLOAD_SECRET doit contenir au moins 32 caractères » | Variable absente ou trop courte | La définir (`openssl rand -hex 32`) et redéployer |
| `/admin` : « Vous n'êtes pas autorisé à effectuer cette action » à l'enregistrement, alors que la connexion réussit | Le site est ouvert depuis une adresse absente de `NEXT_PUBLIC_SITE_URL` / `ADMIN_ALLOWED_ORIGINS` (protection CSRF) | Ajouter l'adresse dans `ADMIN_ALLOWED_ORIGINS`, ou corriger `NEXT_PUBLIC_SITE_URL` (variable de build : reconstruire) |
| Les modifications de l'admin disparaissent après un déploiement | Pas de volume sur `/data` | Ajouter le Persistent Storage `/data` ; les données saisies avant sont perdues |
| Erreur d'écriture sur la base ou les photos | Droits du volume | Le conteneur corrige les droits de `/data` à chaque démarrage ; vérifier que le volume est bien monté sur `/data` |
| `No resources found` au déploiement | Mauvais UUID, ou jeton d'une autre équipe | Le workflow liste les apps visibles : copier le bon UUID |
| Liens canoniques en `localhost` | `NEXT_PUBLIC_SITE_URL` absent ou non coché « Build Variable » | Le cocher et redéployer |
