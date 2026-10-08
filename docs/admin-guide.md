# Guide de l'administration du site

Pour l'avocat et son équipe. Aucune connaissance technique n'est nécessaire.

## Se connecter
Rendez-vous sur **votre-site.fr/admin** et entrez votre e-mail et votre mot de passe. Après 5 essais erronés, le compte est bloqué 10 minutes (protection contre le piratage).

## Repères dans l'administration
L'espace ressemble à celui de WordPress :
- **Barre noire en haut :** le nom du cabinet (un clic ouvre le site dans un nouvel onglet), « Nouveau » (ajouter un domaine, un média ou un utilisateur) et votre nom.
- **Menu à gauche :** « Tableau de bord », puis Rendez-vous, Contenu et Administration. Une **pastille rouge** sur « Demandes de rendez-vous » indique le nombre de demandes nouvelles à traiter.
- **Tableau de bord :** un panneau de bienvenue avec les actions courantes, « D'un coup d'œil » (nombre de domaines, médias, demandes) et « Activité » (les dernières demandes reçues).
- **Écrans d'édition :** le contenu à gauche, une boîte « Options » à droite, et le bouton bleu **Enregistrer** en haut.

## Modifier les textes
Menu **Contenu** :

| Je veux changer… | Où |
| --- | --- |
| mon nom, mon titre, ma photo, mon adresse, mon téléphone, mes horaires | **Cabinet** |
| le titre et l'introduction de la page, les 3 atouts du bandeau bleu, ma présentation, les étapes, les honoraires | **Page d'accueil** (un onglet par section) |
| un article du blog | **Articles** (voir « Publier un article » plus bas) |
| les cartes « Domaines d'intervention » (ajouter, retirer, réordonner, ajouter une image) | **Domaines d'intervention** : le champ « Ordre d'affichage » trie les cartes ; « Image de la carte » est facultatif (format paysage) |
| le SIRET, l'assurance, l'hébergeur (pages légales) | **Cabinet › Mentions légales** |

Cliquez sur **Enregistrer** : le changement est visible tout de suite sur le site. Un champ laissé vide reprend le texte d'origine du site.

## Changer la photo
1. **Médiathèque › Ajouter** : glissez la photo (format portrait conseillé), écrivez une courte description (lue par les lecteurs d'écran), sauvegardez.
2. **Cabinet › Identité › Photo de portrait** : choisissez-la, sauvegardez.

## Suivre les demandes de rendez-vous
Menu **Rendez-vous › Demandes de rendez-vous**. Chaque demande du formulaire y est enregistrée (et envoyée par e-mail si l'envoi est configuré).
- Changez le **statut** : Nouvelle, Confirmée, Refusée / sans suite, Archivée.
- La **note interne** n'est visible que par vous.
- Les informations du visiteur ne sont pas modifiables : elles restent fidèles à sa demande.
- Supprimez les demandes anciennes selon la durée annoncée dans la politique de confidentialité.

## Publier un article
Dans **Contenu › Articles › Ajouter** :
1. Saisissez le **titre** et un **résumé** (une à deux phrases : il s'affiche dans la liste et dans les résultats de recherche).
2. Ajoutez, si vous voulez, une **image à la une** (format paysage).
3. Rédigez dans l'éditeur, qui fonctionne comme un traitement de texte : **intertitres**, gras, italique, listes, citations, liens et images (barre d'outils au-dessus du texte, ou tapez « / »).
4. Dans la boîte « Options » : le **domaine concerné** (affiché comme catégorie), la **date de publication** (modifiable) et l'**adresse** de l'article, générée depuis le titre.
5. **Enregistrer le brouillon** garde l'article invisible sur le site ; **Publier** le met en ligne tout de suite.

Bon à savoir :
- L'article apparaît dans la page **Actualités**, dans les trois derniers articles de l'accueil, dans le plan du site et dans le **flux RSS** (`/actualites/rss.xml`).
- Changer le titre ne change pas l'adresse : les liens déjà partagés restent valides.
- Pour retirer un article du site sans le supprimer, repassez-le en brouillon (action « Annuler la publication » du bouton de publication).
- Les liens dangereux (par exemple `javascript:`) sont automatiquement neutralisés à l'affichage.
- Un article d'exemple, « Bienvenue sur le blog du cabinet », est fourni : modifiez-le ou supprimez-le.

## Traiter une demande de rendez-vous
Dans **Rendez-vous › Demandes de rendez-vous**, ouvrez une demande, puis dans la boîte « Options » :
1. Passez le **Statut** à « Confirmée » et renseignez le **Créneau confirmé** (date et heure). Ajoutez si besoin un **Message au client**.
2. Laissez cochée la case **Prévenir le client par e-mail**, puis cliquez sur **Enregistrer** : le client reçoit un e-mail avec le créneau, le mode et l'adresse du cabinet. La date d'envoi apparaît dans « Client prévenu le ».
3. Pour décliner : statut « Refusée / sans suite » (un e-mail courtois est envoyé, avec votre message éventuel).

L'e-mail ne part qu'une fois par changement de statut : modifier la note ou le message ensuite n'en renvoie pas. Décochez « Prévenir le client » pour changer le statut sans envoyer d'e-mail. Si l'envoi échoue (ou n'est pas configuré), l'erreur s'affiche dans « Erreur d'envoi » : la demande, elle, est bien enregistrée.

Le client reçoit aussi un **accusé de réception** dès qu'il envoie sa demande.

## Régler les disponibilités
**Contenu › Cabinet › onglet Disponibilités** contrôle les jours proposés dans le formulaire :
- **Jours de consultation** : les jours de la semaine ouverts.
- **Jours fermés** : congés et jours fériés, qui ne seront plus proposés.
- **Délai minimum** : 1 = à partir de demain, 2 = à partir d'après-demain…
- **Nombre de jours proposés** dans le formulaire.

Ces règles sont aussi vérifiées côté serveur : un jour fermé ne peut pas être demandé, même en trafiquant le formulaire.

## Exporter les demandes
En haut de la liste des demandes, **Exporter en CSV (Excel)** télécharge toutes les demandes, avec leur statut et le créneau confirmé. Le fichier s'ouvre directement dans Excel.

## Ajouter un collaborateur
**Administration › Utilisateurs › Créer** : e-mail et mot de passe. Tout utilisateur a accès à l'ensemble de l'administration.

## En cas de problème
- Mot de passe oublié : « Mot de passe oublié ? » sur la page de connexion nécessite un envoi d'e-mail configuré ; sinon, demandez à votre prestataire technique de le réinitialiser.
- Une modification n'apparaît pas : actualisez la page (Ctrl/Cmd + Maj + R) puis contactez votre prestataire.
