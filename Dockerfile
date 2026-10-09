# Image autonome du site du cabinet (Next.js « standalone » + Payload CMS + base SQLite).
#
# Un seul conteneur contient tout : le site, l'administration, la base de données
# (SQLite : un fichier dans le volume /data) et les sauvegardes nocturnes.
# Rien à installer ni à configurer sur le serveur à part ce volume :
#
#   docker build -t cabinet .
#   docker run -d --name cabinet -p 3000:3000 -v cabinet-data:/data cabinet
#   docker logs cabinet        # affiche l'identifiant et le mot de passe du premier accès
#
# Au premier démarrage : la clé de session et le mot de passe administrateur sont générés
# (et conservés dans le volume), la base est créée et migrée, le contenu par défaut est chargé.
# Toute variable d'environnement fournie l'emporte sur la valeur automatique : voir .env.example.
#
# Règles : DEPLOY-2 (aucun secret dans l'image), DEPLOY-3 (HEALTHCHECK), DEPLOY-7 (couches).
# Procédure complète : docs/ops/vps.md

ARG NODE_VERSION=22

# ---- Dépendances -----------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build -----------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# L'adresse publique est figée au build (balises canoniques, sitemap).
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Le build pré-rend la page : Payload s'initialise donc, sur une base jetable
# qui reste dans cette étape (elle n'atteint jamais l'image servie).
RUN PAYLOAD_SECRET=secret-de-build-jetable-sans-valeur-0123456789 \
    DATABASE_URI=file:/tmp/build.db \
    MEDIA_DIR=/tmp/build-media \
    npm run build

# ---- Exécution -------------------------------------------------------------
# Aucun secret dans l'image : PAYLOAD_SECRET, ADMIN_PASSWORD, RESEND_API_KEY… sont fournis à
# l'exécution, ou générés au premier démarrage (docker-entrypoint.sh).
# /data est le volume persistant : base SQLite, médias, sauvegardes, clé de session.
FROM node:${NODE_VERSION}-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URI=file:/data/payload.db \
    MEDIA_DIR=/data/media \
    TZ=Europe/Paris \
    BACKUP_ENABLED=true \
    BACKUP_HOUR=3 \
    BACKUP_KEEP_DAYS=14

# su-exec : abandon des droits root ; tini : signaux et processus zombies ; sqlite : sauvegardes
# cohérentes ; tzdata : sauvegardes à l'heure de Paris.
RUN apk add --no-cache su-exec tini sqlite tzdata \
 && addgroup -S app && adduser -S app -G app \
 && mkdir -p /data/media && chown -R app:app /data
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY docker/backup.sh /usr/local/bin/cabinet-backup
COPY docker/backup-loop.sh /usr/local/bin/backup-loop.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh /usr/local/bin/cabinet-backup /usr/local/bin/backup-loop.sh

VOLUME /data

# Coolify : « Ports Exposes » = 3000, et un « Persistent Storage » sur /data.
EXPOSE 3000
# start-period large : la migration de la base s'exécute au premier démarrage.
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/healthz || exit 1

# Démarre en root pour préparer /data, puis le script passe à l'utilisateur « app ».
# tini (-g) transmet l'arrêt à tout le groupe de processus : le site et les sauvegardes.
ENTRYPOINT ["/sbin/tini", "-g", "--", "docker-entrypoint.sh"]
CMD ["node", "server.js"]
