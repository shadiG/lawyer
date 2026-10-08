#!/bin/sh
# Boucle de sauvegarde : une fois par nuit, à BACKUP_HOUR (heure de Paris, défaut 3 h).
# Lancée en arrière-plan par docker-entrypoint.sh ; arrêtée avec le conteneur.
set -u

HOUR="${BACKUP_HOUR:-3}"

while true; do
  # Secondes avant la prochaine occurrence de HOUR:00 (sh/busybox : pas de `date -d`).
  H="$(date +%H | sed 's/^0*//')"; M="$(date +%M | sed 's/^0*//')"; S="$(date +%S | sed 's/^0*//')"
  H="${H:-0}"; M="${M:-0}"; S="${S:-0}"
  WAIT=$(( (HOUR * 3600) - (H * 3600 + M * 60 + S) ))
  [ "$WAIT" -le 0 ] && WAIT=$(( WAIT + 86400 ))
  sleep "$WAIT"
  cabinet-backup || echo "sauvegarde : échec, nouvelle tentative demain."
done
