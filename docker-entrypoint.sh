#!/bin/sh
# Démarrage du conteneur : vérifie la configuration, prépare le volume
# persistant, puis abandonne les droits root avant de lancer le serveur.
set -eu

if [ -z "${PAYLOAD_SECRET:-}" ] || [ "${#PAYLOAD_SECRET}" -lt 32 ]; then
  echo "ERREUR : PAYLOAD_SECRET doit contenir au moins 32 caractères (docs/ops/vps.md)." >&2
  echo "Générez-en un avec : openssl rand -hex 32" >&2
  exit 1
fi

# Un volume monté par Coolify peut appartenir à root : on le rend inscriptible
# par l'utilisateur de l'app (base SQLite + médias téléversés).
mkdir -p /data/media
chown -R app:app /data

exec su-exec app "$@"
