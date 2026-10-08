# Image Coolify pour le site du cabinet (Next.js, sortie « standalone »).
# Règles : DEPLOY-2 (aucun secret dans l'image servie), DEPLOY-3 (HEALTHCHECK),
# DEPLOY-7 (dépendances en couche séparée). Procédure : docs/ops/vps.md
#
#   docker build --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 -t lawyer .
#   docker run --rm -p 3000:3000 lawyer      # http://localhost:3000

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
RUN npm run build

# ---- Exécution -------------------------------------------------------------
# Les clés (RESEND_API_KEY…) sont des variables d'exécution Coolify : elles
# n'entrent jamais dans l'image.
FROM node:${NODE_VERSION}-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
USER app

# Coolify : « Ports Exposes » = 3000.
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/healthz || exit 1

CMD ["node", "server.js"]
