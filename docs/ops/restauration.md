# Sauvegardes et restauration

Le conteneur sauvegarde **chaque nuit** (3 h, heure de Paris) :

- la base de données, par la copie cohérente de SQLite (`.backup`), **vérifiée** (`PRAGMA integrity_check`) avant d'être conservée ;
- les photos téléversées (archive `media-….tar.gz`).

Les fichiers sont dans le volume, dossier `/data/backups` (`payload-AAAA-MM-JJ_HHMMSS.db.gz`, `media-….tar.gz`), et gardés **14 jours** par défaut.

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `BACKUP_ENABLED` | `true` | `false` pour désactiver |
| `BACKUP_HOUR` | `3` | Heure de la sauvegarde (0–23, heure de Paris) |
| `BACKUP_KEEP_DAYS` | `14` | Nombre de jours conservés |

> ⚠️ Ces sauvegardes sont **dans le même volume** que les données : elles protègent d'une erreur de manipulation ou d'une corruption, **pas de la perte du serveur ou du disque**. Copiez-les régulièrement ailleurs (voir « Copier hors du serveur »).

## Sauvegarde immédiate

```sh
docker exec cabinet cabinet-backup
```

(sur Coolify : onglet **Terminal** de l'application, puis `cabinet-backup`)

## Copier hors du serveur

```sh
# Depuis votre ordinateur (adaptez le nom du conteneur et le serveur)
ssh serveur 'docker cp cabinet:/data/backups ./sauvegardes-cabinet'
scp -r serveur:./sauvegardes-cabinet ./
```

Une tâche planifiée Coolify (« Scheduled Tasks ») peut aussi lancer `cabinet-backup` puis pousser le dossier vers un stockage S3 ou un autre serveur.

## Restaurer la base

1. Arrêtez le conteneur : `docker stop cabinet`.
2. Choisissez la sauvegarde (la plus récente : `ls -t /data/backups/payload-*.db.gz | head -1`).
3. Remplacez la base par la copie :

   ```sh
   docker run --rm -v cabinet-data:/data cabinet sh -c '
     gunzip -c /data/backups/payload-2026-10-08_030000.db.gz > /data/payload.db &&
     rm -f /data/payload.db-wal /data/payload.db-shm &&
     chown app:app /data/payload.db'
   ```

4. Redémarrez : `docker start cabinet`. Au démarrage, les migrations éventuellement manquantes sont appliquées.

## Restaurer les photos

```sh
docker run --rm -v cabinet-data:/data cabinet sh -c '
  tar xzf /data/backups/media-2026-10-08_030000.tar.gz -C /data && chown -R app:app /data/media'
```

## Mot de passe administrateur perdu

Le mot de passe du premier accès est dans `/data/premiere-connexion.txt` (tant que vous ne l'avez pas supprimé) et dans les logs du premier démarrage. Après l'avoir changé dans l'administration, il n'est plus récupérable : utilisez alors « Mot de passe oublié » (nécessite l'envoi d'e-mails configuré) ou demandez à votre prestataire de le réinitialiser depuis le serveur.
