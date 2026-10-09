# Déploiement du site du cabinet

**Un seul conteneur contient tout** : le site, l'administration (Payload CMS), la base de données et les sauvegardes nocturnes. Rien à installer ni à configurer sur le serveur, à part un volume persistant : le reste se configure tout seul au premier démarrage.

| Adresse | Rôle |
| --- | --- |
| `https://lawyer.shadgramers.com/` | le site public |
| `https://lawyer.shadgramers.com/admin` | l'administration (voir [le guide de l'avocat](../admin-guide.md)) |
| `https://lawyer.shadgramers.com/healthz` | santé du conteneur (200 `ok`) |

## Pourquoi pas de conteneur de base de données ?

La base est **SQLite** : un fichier (`/data/payload.db`) dans le volume, pas un service séparé. Pour un site de cabinet c'est le choix le plus fiable : rien à démarrer, à relier ni à surveiller, et la sauvegarde est une copie de fichier (déjà automatisée). PostgreSQL ne se justifierait que pour partager la base entre plusieurs serveurs : ce serait une tranche de travail à part (adaptateur, migrations réécrites).

## Ce qui est automatique

Au premier démarrage, le conteneur :

1. **génère la clé de session** et la garde dans le volume (`/data/.payload-secret`) ;
2. **crée le premier administrateur** (`admin@cabinet.local`, mot de passe aléatoire de 20 caractères) affiché **une fois** dans les logs, et écrit dans `/data/premiere-connexion.txt` ;
3. **crée la base, applique les migrations** et charge le contenu par défaut **avant** d'accepter la moindre requête. Si une étape échoue, le conteneur ne démarre pas : Coolify garde l'ancienne version en ligne ;
4. **lance les sauvegardes nocturnes** (voir [restauration](restauration.md)).

Toute variable fournie l'emporte sur la valeur automatique. Redémarrages et redéploiements conservent tout (clé, comptes, contenu) : tout vit dans le volume. Le site ne fige aucun contenu à la construction : les pages sont rendues à la requête depuis la base.

## Voie A : Coolify

À faire une fois :

1. **DNS** : un enregistrement `A` pour le domaine vers le VPS.
2. Projet → **+ New** → **Private Repository (with GitHub App)** → `shadiG/lawyer`, branche `main`.
3. Build Pack **Dockerfile**, Base Directory `/`, Dockerfile Location `/Dockerfile`.
4. **Ports Exposes** : `3000`.
5. **Domains** : `https://lawyer.shadgramers.com` (sans port).
6. **Persistent Storage** : un volume, destination **`/data`**. C'est le seul réglage indispensable : un Dockerfile ne peut pas imposer un volume (c'est une propriété de l'hôte). Sans lui, base, photos, clé et sauvegardes disparaissent à chaque déploiement.
7. **Environment Variables** : une seule recommandée, `NEXT_PUBLIC_SITE_URL=https://lawyer.shadgramers.com`, avec **Build Variable** coché (liens canoniques et plan du site).
8. Avancé → **Auto Deploy désactivé** (GitHub déclenche le déploiement après le CI).
9. **Deploy**.

**Première connexion** : logs du premier déploiement (bandeau « PREMIÈRE CONNEXION »), ou onglet Terminal puis `cat /data/premiere-connexion.txt`. Se connecter sur `/admin`, **changer le mot de passe** (Administration › Utilisateurs), puis `rm /data/premiere-connexion.txt`. Remplacer ensuite les textes provisoires et les champs légaux (Cabinet › Mentions légales).

### Variables facultatives

| Nom | Rôle |
| --- | --- |
| `PAYLOAD_SECRET` | Imposer sa propre clé de session (≥ 32 caractères, `openssl rand -hex 32`). Sinon générée |
| `ADMIN_EMAIL` | Identifiant du premier administrateur (défaut `admin@cabinet.local`) |
| `ADMIN_PASSWORD` | Mot de passe du premier administrateur (défaut : aléatoire). Utilisé **seulement** au tout premier démarrage |
| `ADMIN_ALLOWED_ORIGINS` | Autres adresses d'accès à l'admin (ex. `https://www.exemple.fr`), séparées par des virgules |
| `RESEND_API_KEY`, `BOOKING_TO_EMAIL`, `BOOKING_FROM_EMAIL` | E-mails de rendez-vous (ci-dessous) |
| `BACKUP_ENABLED`, `BACKUP_HOUR`, `BACKUP_KEEP_DAYS` | Sauvegardes (voir [restauration](restauration.md)) |

**E-mails.** Une demande de rendez-vous est toujours enregistrée dans l'administration. `BOOKING_TO_EMAIL` ajoute une notification à l'avocat ; `RESEND_API_KEY` et `BOOKING_FROM_EMAIL` (domaine vérifié chez [Resend](https://resend.com), SPF/DKIM) permettent d'écrire au client (accusé de réception, confirmation, refus). Sans eux, l'admin affiche « E-mail non configuré » et le client n'est pas prévenu.

## Voie B : `docker compose` sur n'importe quel serveur

```sh
git clone https://github.com/shadiG/lawyer.git && cd lawyer
docker compose up -d --build          # http://IP-du-serveur:3000
docker compose logs app               # identifiant et mot de passe du premier accès
```

Avec HTTPS (Caddy, certificat Let's Encrypt automatique ; le domaine doit pointer sur le serveur, ports 80 et 443 ouverts) :

```sh
SITE_URL=https://exemple.fr DOMAIN=exemple.fr APP_BIND=127.0.0.1:3000 \
  docker compose --profile https up -d --build
```

Compose lit un éventuel `.env` du dossier (voir `.env.example`).

## Déploiement continu depuis GitHub (Coolify)

Chaque push sur `main` lance `.github/workflows/vps.yml` : CI d'abord (lint, types, tests, build), puis appel à Coolify. Un build rouge n'atteint jamais le serveur. Sans les réglages ci-dessous, le workflow saute le déploiement avec un avis.

1. Coolify → Keys & Tokens → API tokens → jeton avec **deploy**, dans l'équipe qui possède l'app.
2. Copier l'**UUID** de l'application.
3. GitHub → Settings → Environments → **New environment** `vps` :

| Type | Nom | Valeur |
| --- | --- | --- |
| Variable | `COOLIFY_URL` | `https://coolify.shadgramers.com` |
| Variable | `COOLIFY_RESOURCE_UUID` | l'UUID |
| Secret | `COOLIFY_TOKEN` | le jeton d'API |

## Au quotidien

- Redéployer à la main : Actions → **VPS deploy** → Run workflow, ou Deploy dans Coolify.
- Revenir en arrière : Coolify → Deployments, redéployer une version antérieure. Les données (volume) ne sont pas touchées.
- Sauvegarder / restaurer : [restauration.md](restauration.md).
- Vérifier que le site est en ligne :
  ```sh
  for p in / /actualites /admin/login /healthz /mentions-legales /confidentialite /robots.txt /sitemap.xml; do
    printf '%-20s ' "$p"; curl -s -o /dev/null -w '%{http_code}\n' "https://lawyer.shadgramers.com$p"; done
  ```
- Tester l'image de bout en bout (démarrage sans configuration, persistance, redéploiement, sauvegarde, restauration) : `sh scripts/docker-smoke.sh`

## Si ça ne marche pas

| Symptôme | Cause probable | Correction |
| --- | --- | --- |
| Toutes les URLs en 502 | « Ports Exposes » différent de `3000`, ou build en cours/échoué | Mettre `3000`, redéployer ; sinon lire le log de déploiement |
| Contenu d'usine retrouvé, ou nouveau mot de passe, après chaque déploiement | Pas de volume sur `/data` | Ajouter le Persistent Storage `/data` (étape 6) ; les données saisies avant sont perdues |
| Le conteneur s'arrête : « PAYLOAD_SECRET doit contenir au moins 32 caractères » | Variable fournie mais trop courte | La corriger, ou la supprimer pour qu'elle soit générée |
| Le conteneur s'arrête dans les migrations | Migration en échec | Lire l'erreur dans les logs ; l'ancienne version reste en ligne ; restaurer au besoin |
| Mot de passe du premier accès introuvable | Logs purgés | `cat /data/premiere-connexion.txt` dans le Terminal (s'il n'a pas été supprimé) |
| `/admin` : « Vous n'êtes pas autorisé… » à l'enregistrement, alors que la connexion réussit | Adresse absente de `NEXT_PUBLIC_SITE_URL` / `ADMIN_ALLOWED_ORIGINS` (CSRF) | Ajouter l'adresse dans `ADMIN_ALLOWED_ORIGINS`, ou corriger `NEXT_PUBLIC_SITE_URL` (variable de build : reconstruire) |
| Liens canoniques en `localhost` | `NEXT_PUBLIC_SITE_URL` absent ou non coché « Build Variable » | Le cocher et redéployer |
| Erreur d'écriture sur la base ou les photos | Volume mal monté | Le conteneur corrige les droits de `/data` au démarrage ; vérifier que le volume est monté sur `/data` |
| `No resources found` au déploiement | Mauvais UUID, ou jeton d'une autre équipe | Le workflow liste les apps visibles : copier le bon UUID |
