#!/bin/sh
# Sauvegarde cohérente de la base SQLite et des photos téléversées, puis rotation.
#
#   cabinet-backup            (lancée chaque nuit par backup-loop.sh ; manuellement : docker exec <conteneur> cabinet-backup)
#
# La base est copiée avec l'API de sauvegarde de SQLite (`.backup`) : le résultat est
# cohérent même si le site écrit au même moment. Les copies sont vérifiées avant d'être gardées.
set -eu

DB="${DATABASE_URI#file:}"
MEDIA="${MEDIA_DIR:-/data/media}"
DEST="${BACKUP_DIR:-/data/backups}"
KEEP="${BACKUP_KEEP_DAYS:-14}"

if [ ! -s "$DB" ]; then
  echo "sauvegarde : pas encore de base ($DB), rien à faire."
  exit 0
fi

mkdir -p "$DEST"
STAMP="$(date +%Y-%m-%d_%H%M%S)"
TMP="$DEST/.payload-$STAMP.db"

sqlite3 "$DB" ".backup '$TMP'"
RESULT="$(sqlite3 "$TMP" 'PRAGMA integrity_check;')"
if [ "$RESULT" != "ok" ]; then
  rm -f "$TMP"
  echo "sauvegarde : ÉCHEC, la copie de la base est corrompue ($RESULT)" >&2
  exit 1
fi
gzip -c "$TMP" > "$DEST/payload-$STAMP.db.gz"
rm -f "$TMP"

if [ -d "$MEDIA" ]; then
  tar czf "$DEST/media-$STAMP.tar.gz" -C "$(dirname "$MEDIA")" "$(basename "$MEDIA")"
fi

# Rotation : on garde BACKUP_KEEP_DAYS jours.
find "$DEST" -type f \( -name 'payload-*.db.gz' -o -name 'media-*.tar.gz' \) -mtime "+$KEEP" -delete

echo "sauvegarde : ok ($STAMP) -> $DEST ($(ls "$DEST" | wc -l | tr -d ' ') fichier(s) conservé(s))"
