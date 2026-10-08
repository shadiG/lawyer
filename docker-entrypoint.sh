#!/bin/sh
# Démarrage du conteneur : prépare le volume persistant, génère les secrets manquants,
# lance les sauvegardes nocturnes, puis abandonne les droits root avant de lancer le serveur.
#
# Objectif : `docker run -v données:/data image` suffit. Rien à saisir pour démarrer ;
# chaque réglage fourni (variable d'environnement) l'emporte sur l'automatique.
set -eu

DATA=/data
SECRET_FILE="$DATA/.payload-secret"
LOGIN_FILE="$DATA/premiere-connexion.txt"
DB="${DATABASE_URI#file:}"

# Un volume monté peut appartenir à root : on le rend inscriptible par l'utilisateur de l'app.
mkdir -p "$DATA/media" "$DATA/backups"
chown -R app:app "$DATA"

random() { # random <alphabet> <longueur>
  head -c 8192 /dev/urandom | tr -dc "$1" | head -c "$2"
}

# 1) Clé de session (≥ 32 caractères) : fournie, sinon générée une fois et conservée dans le
#    volume (les sessions restent valides d'un redémarrage et d'un déploiement à l'autre).
if [ -z "${PAYLOAD_SECRET:-}" ]; then
  if [ ! -s "$SECRET_FILE" ]; then
    random 'a-f0-9' 64 > "$SECRET_FILE"
    chmod 600 "$SECRET_FILE"
    chown app:app "$SECRET_FILE"
    echo "Clé de session générée et conservée dans le volume ($SECRET_FILE)."
  fi
  PAYLOAD_SECRET="$(cat "$SECRET_FILE")"
  export PAYLOAD_SECRET
elif [ "${#PAYLOAD_SECRET}" -lt 32 ]; then
  echo "ERREUR : PAYLOAD_SECRET doit contenir au moins 32 caractères (ou laissez-le vide : il sera généré)." >&2
  exit 1
fi

# 2) Premier administrateur. Sans lui, /admin proposerait de créer le premier compte à n'importe
#    quel visiteur : on le crée donc toujours au tout premier démarrage.
: "${ADMIN_EMAIL:=admin@cabinet.local}"
export ADMIN_EMAIL
if [ ! -s "$DB" ] && [ -z "${ADMIN_PASSWORD:-}" ]; then
  ADMIN_PASSWORD="$(random 'A-Za-z0-9' 20)"
  export ADMIN_PASSWORD
  umask 077
  {
    echo "Première connexion à l'administration du cabinet"
    echo "  Adresse    : /admin"
    echo "  Identifiant: $ADMIN_EMAIL"
    echo "  Mot de passe: $ADMIN_PASSWORD"
    echo
    echo "Changez ce mot de passe (Administration > Utilisateurs) puis supprimez ce fichier."
  } > "$LOGIN_FILE"
  chown app:app "$LOGIN_FILE"
  echo "=============================================================="
  echo " PREMIÈRE CONNEXION À L'ADMINISTRATION (affichée une seule fois)"
  echo "   Identifiant  : $ADMIN_EMAIL"
  echo "   Mot de passe : $ADMIN_PASSWORD"
  echo " Aussi conservée dans le volume : $LOGIN_FILE"
  echo " Changez ce mot de passe à la première connexion."
  echo "=============================================================="
fi

# 3) Sauvegardes nocturnes (désactivables : BACKUP_ENABLED=false).
if [ "${BACKUP_ENABLED:-true}" = "true" ]; then
  su-exec app backup-loop.sh &
fi

exec su-exec app "$@"
