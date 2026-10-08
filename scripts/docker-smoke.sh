#!/bin/sh
# Test de bout en bout de l'image Docker, exactement comme un serveur la fait tourner :
#
#   sh scripts/docker-smoke.sh            # construit l'image puis lance les vérifications
#   SKIP_BUILD=1 sh scripts/docker-smoke.sh
#
# Vérifie : démarrage SANS configuration, première connexion, persistance après redémarrage
# ET après remplacement du conteneur (comme un redéploiement), sauvegarde + rotation,
# restauration, refus d'une clé trop courte, droits (pas root), arrêt rapide.
# Sort avec un code non nul si une vérification échoue.
set -u

IMG="${IMG:-cabinet-smoke}"
NAME=cabinet-smoke
VOL=cabinet-smoke-data
VOL2=cabinet-smoke-restore
PORT="${PORT:-3000}"
BASE="http://localhost:$PORT"
ORIGIN="Origin: http://localhost:3000"   # = NEXT_PUBLIC_SITE_URL par défaut de l'image
TMP="$(mktemp -d)"
PASS=0
FAIL=0

check() { # check <description> <commande...>
  DESC="$1"; shift
  if "$@" >/dev/null 2>&1; then PASS=$((PASS + 1)); echo "  ✔ $DESC"; else FAIL=$((FAIL + 1)); echo "  ✘ ÉCHEC : $DESC"; fi
}
cleanup() { docker rm -f "$NAME" "$NAME-2" >/dev/null 2>&1; docker volume rm "$VOL" "$VOL2" >/dev/null 2>&1; rm -rf "$TMP"; }
trap cleanup EXIT
cleanup_start() { docker rm -f "$NAME" "$NAME-2" >/dev/null 2>&1; docker volume rm "$VOL" "$VOL2" >/dev/null 2>&1; }

wait_healthy() { # wait_healthy <conteneur> : jusqu'à 3 minutes
  i=0
  while [ "$i" -lt 90 ]; do
    [ "$(docker inspect -f '{{.State.Health.Status}}' "$1" 2>/dev/null)" = "healthy" ] && return 0
    i=$((i + 1)); sleep 2
  done
  return 1
}
http() { curl -s -o /dev/null -m 30 -w '%{http_code}' "$@"; }
login() { http -H "$ORIGIN" -H 'Content-Type: application/json' -d "{\"email\":\"admin@cabinet.local\",\"password\":\"$1\"}" -c "$TMP/cookies" "$BASE/api/users/login"; }

cleanup_start

if [ "${SKIP_BUILD:-}" != "1" ]; then
  echo "== Construction de l'image =="
  docker build -t "$IMG" . >"$TMP/build.log" 2>&1 || { tail -20 "$TMP/build.log"; echo "ÉCHEC de la construction"; exit 1; }
fi

echo "== 1. Démarrage sans aucune configuration =="
docker run -d --name "$NAME" -p "$PORT:3000" -v "$VOL:/data" "$IMG" >/dev/null
check "le conteneur devient sain" wait_healthy "$NAME"
PW="$(docker exec "$NAME" sed -n 's/.*Mot de passe: //p' /data/premiere-connexion.txt)"
check "un mot de passe a été généré (20 caractères)" test "${#PW}" -eq 20
check "il est affiché dans les logs" sh -c "docker logs $NAME 2>&1 | grep -q 'PREMIÈRE CONNEXION'"
check "la clé de session est générée (64 caractères)" sh -c "[ \$(docker exec $NAME cat /data/.payload-secret | wc -c) -ge 64 ]"
check "les 5 migrations sont appliquées" sh -c "[ \$(docker logs $NAME 2>&1 | grep -c 'Migrated:') -ge 5 ]"
check "le serveur ne tourne pas en root" sh -c "docker exec $NAME ps -o user,args | grep -E 'next-server|node' | grep -qv '^root'"
check "la clé et le mot de passe sont en lecture privée (600)" sh -c "docker exec $NAME ls -l /data/.payload-secret /data/premiere-connexion.txt | awk '{print \$1}' | sort -u | grep -qx -- '-rw-------'"

echo "== 2. Pages et connexion =="
for u in / /actualites /mentions-legales /confidentialite /healthz /sitemap.xml /actualites/rss.xml; do
  check "GET $u → 200" test "$(http "$BASE$u")" = 200
done
check "une adresse inconnue → 404" test "$(http "$BASE/n-importe-quoi")" = 404
check "connexion avec le mot de passe affiché" test "$(login "$PW")" = 200
check "mauvais mot de passe refusé" test "$(login "mauvais-mot-de-passe")" = 401
login "$PW" >/dev/null

echo "== 3. Modification dans l'administration =="
TITRE="Titre du test $(date +%s)"
check "enregistrement du titre" test "$(http -b "$TMP/cookies" -H "$ORIGIN" -H 'Content-Type: application/json' -d "{\"hero\":{\"title\":\"$TITRE\"}}" "$BASE/api/globals/home")" = 200
sleep 1
check "le site affiche la modification" sh -c "curl -s -m 30 $BASE/ | grep -q '$TITRE'"

echo "== 4. Redémarrage du conteneur =="
SECRET1="$(docker exec "$NAME" cat /data/.payload-secret)"
docker restart "$NAME" >/dev/null
check "de nouveau sain" wait_healthy "$NAME"
check "même clé de session" test "$(docker exec "$NAME" cat /data/.payload-secret)" = "$SECRET1"
check "la session ouverte avant est toujours valide" test "$(http -b "$TMP/cookies" -H "$ORIGIN" "$BASE/api/users/me")" = 200
check "le mot de passe n'est pas ré-affiché" sh -c "[ \$(docker logs $NAME 2>&1 | grep -c 'PREMIÈRE CONNEXION') -eq 1 ]"
check "la modification est toujours visible" sh -c "curl -s -m 30 $BASE/ | grep -q '$TITRE'"

echo "== 5. Remplacement du conteneur (comme un redéploiement) =="
docker rm -f "$NAME" >/dev/null
docker run -d --name "$NAME" -p "$PORT:3000" -v "$VOL:/data" "$IMG" >/dev/null
check "le nouveau conteneur devient sain" wait_healthy "$NAME"
check "la modification de l'admin est visible (rien de figé au build)" sh -c "curl -s -m 30 $BASE/ | grep -q '$TITRE'"
check "le même mot de passe fonctionne (aucun nouveau compte)" test "$(login "$PW")" = 200
check "aucune page d'accueil avec le contenu d'usine n'est figée dans l'image" docker exec "$NAME" sh -c '! grep -q "Défendre vos droits" .next/server/app/index.html'

echo "== 6. Sauvegarde =="
docker exec "$NAME" sh -c 'touch -t 202001010000 /data/backups/payload-2020-01-01_000000.db.gz /data/backups/media-2020-01-01_000000.tar.gz'
check "cabinet-backup s'exécute" docker exec "$NAME" cabinet-backup
LAST="$(docker exec "$NAME" sh -c 'ls -t /data/backups/payload-*.db.gz | head -1')"
check "une sauvegarde de la base existe" test -n "$LAST"
check "elle est valide (integrity_check = ok)" sh -c "[ \"\$(docker exec $NAME sh -c \"gunzip -c $LAST > /tmp/v.db && sqlite3 /tmp/v.db 'PRAGMA integrity_check;'\")\" = ok ]"
check "elle contient la modification" sh -c "docker exec $NAME sh -c \"gunzip -c $LAST > /tmp/v.db && sqlite3 /tmp/v.db 'select hero_title from home;'\" | grep -q '$TITRE'"
check "une archive des photos existe" sh -c "docker exec $NAME ls /data/backups | grep -q '^media-2'"
check "la rotation supprime les vieilles sauvegardes" sh -c "! docker exec $NAME ls /data/backups | grep -q '2020-01-01'"

echo "== 7. Restauration sur un volume neuf =="
docker cp "$NAME:$LAST" "$TMP/restore.db.gz" >/dev/null
docker rm -f "$NAME" >/dev/null
docker run --rm -v "$VOL2:/data" -v "$TMP:/in" --entrypoint sh "$IMG" -c 'gunzip -c /in/restore.db.gz > /data/payload.db && chown app:app /data/payload.db' >/dev/null
docker run -d --name "$NAME-2" -p "$PORT:3000" -v "$VOL2:/data" "$IMG" >/dev/null
check "le conteneur restauré devient sain" wait_healthy "$NAME-2"
check "le contenu est restauré" sh -c "curl -s -m 30 $BASE/ | grep -q '$TITRE'"
check "le mot de passe d'origine fonctionne" test "$(login "$PW")" = 200
check "aucun nouveau mot de passe généré (base existante)" sh -c "! docker logs $NAME-2 2>&1 | grep -q 'PREMIÈRE CONNEXION'"
START=$(date +%s); docker stop "$NAME-2" >/dev/null; STOP=$(( $(date +%s) - START ))
check "arrêt propre en moins de 10 s (${STOP} s)" test "$STOP" -lt 10

echo "== 8. Configuration invalide =="
docker rm -f "$NAME-2" >/dev/null 2>&1
check "une clé de session trop courte est refusée" sh -c "! docker run --rm -e PAYLOAD_SECRET=trop-court -v $VOL2:/data $IMG >/dev/null 2>&1"

echo
echo "Résultat : $PASS vérification(s) réussie(s), $FAIL échec(s)."
[ "$FAIL" -eq 0 ]
