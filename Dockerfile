# Image Coolify pour le site du cabinet (Next.js, sortie « standalone »).
# Règles : DEPLOY-2 (aucun secret dans l'image servie), DEPLOY-3 (HEALTHCHECK),
# DEPLOY-7 (dépendances en couche séparée). Procédure : docs/ops/vps.md
#
#   docker build --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 -t lawyer .
#   docker run --rm -p 3000:3000 -v lawyer-data:/data \
#     -e PAYLOAD_SECRET=$(openssl rand -hex 32) \
#     -e ADMIN_EMAIL=admin@exemple.fr -e ADMIN_PASSWORD=un-mot-de-passe-solide lawyer
#   -> http://localhost:3000  (admin : http://localhost:3000/admin)

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
# Les secrets (PAYLOAD_SECRET, RESEND_API_KEY, ADMIN_PASSWORD…) sont des
# variables d'exécution Coolify : ils n'entrent jamais dans l'image.
# /data est le volume persistant : base SQLite + médias téléversés.
FROM node:${NODE_VERSION}-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URI=file:/data/payload.db \
    MEDIA_DIR=/data/media

RUN apk add --no-cache su-exec \
 && addgroup -S app && adduser -S app -G app \
 && mkdir -p /data/media && chown -R app:app /data
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

VOLUME /data

# Coolify : « Ports Exposes » = 3000.
EXPOSE 3000
# start-period large : la migration de la base s'exécute au premier démarrage.
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/healthz || exit 1

# Démarre en root pour préparer /data, puis le script passe à l'utilisateur « app ».
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
