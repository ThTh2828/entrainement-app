# Élan — version installable

Élan, ton programme de musculation et de course sur huit semaines.

Application web (PWA) sans compte, sans serveur et sans envoi de données. Pas de compilation : les fichiers sont servis tels quels.

```
index.html               la page : structure de l’écran et chargement des fichiers ci-dessous
css/polices.css          polices incluses (hors connexion)
css/elan.css             tout le style, thèmes compris
js/figure.js             silhouettes articulées des illustrations
js/programme.js          les 8 semaines, les séances A et B, les exercices et leurs consignes
js/etat.js               outils de dates, profil par défaut, lecture et enregistrement des données
js/cloud.js              sauvegarde cloud chiffrée (Gist)
js/calendrier-coach.js   calendrier, règles de progression, coach, série et badges
js/mannequin3d.js        mannequin 3D (Three.js chargé à la demande)
js/interface.js          composants, écran Aujourd’hui, écran Programme, feuilles
js/progression-profil.js écrans Progression et Profil
js/seance.js             séance plein écran et minuteur de repos
js/voix.js               mode mains libres (annonces vocales)
js/impression.js         version A4 imprimable
js/accueil.js            écran d’accueil du premier lancement
js/app.js                navigation, actions, démarrage (toujours en dernier)
manifest.webmanifest     nom, couleurs et icônes pour l’écran d’accueil
sw.js                    copie locale pour fonctionner hors connexion
icons/, vendor/          icônes, Three.js
```

Les scripts partagent les mêmes variables globales et se chargent dans l’ordre de `index.html` : garde `app.js` en dernier, car c’est lui qui démarre l’application.

## Mettre à jour l’application

1. Modifie les fichiers, puis envoie-les sur GitHub.
2. Dans `sw.js`, **incrémente le numéro de `CACHE`** (`elan-v5` → `elan-v6`…). Si tu as créé un fichier, ajoute-le aussi à la liste `CODE` de `sw.js` et dans `index.html`.
3. Sur le téléphone, ouvre l’application avec du réseau, ferme-la complètement, puis rouvre-la : la nouvelle version est installée.

Le code (HTML, CSS, JS) est toujours relu sur le réseau quand il y en a ; le numéro de cache sert à renouveler la copie hors connexion et à supprimer l’ancienne.

## L’installer sur ton téléphone

Une vraie installation demande une adresse **https**. Le plus simple et gratuit : GitHub Pages.

1. Crée un compte sur github.com, puis un nouveau dépôt (par exemple `entrainement`).
2. Dans le dépôt : « Add file » → « Upload files », dépose **le contenu** de ce dossier (index.html, manifest.webmanifest, sw.js et les dossiers css, js, icons et vendor), puis valide.
3. « Settings » → « Pages » → source « Deploy from a branch », branche `main`, dossier `/ (root)`, puis « Save ».
4. Après une à deux minutes, l’adresse s’affiche : `https://ton-pseudo.github.io/entrainement/`.
5. Sur le téléphone :
   - **iPhone** : ouvre l’adresse dans **Safari**, bouton Partager, « Sur l’écran d’accueil ».
   - **Android** : ouvre l’adresse dans **Chrome**, menu ⋮, « Installer l’application » (ou « Ajouter à l’écran d’accueil »).
6. Ouvre l’application une fois avec du réseau : ensuite elle fonctionne hors connexion.

**Confidentialité.** Les fichiers publiés ne contiennent aucune donnée personnelle : au premier lancement, un écran d’accueil demande ton prénom, ta taille et ton poids, enregistrés uniquement sur le téléphone. Tes saisies (séances, poids, sorties) ne quittent jamais ton téléphone, sauf si tu actives la sauvegarde cloud chiffrée.

N’importe quel hébergement https de fichiers statiques convient aussi.

## Le coach

Avant chaque séance, trois touches : sommeil, énergie, courbatures. Le coach les croise avec tes dernières saisies (fatigue, douleur, réserve) et propose un niveau : feu vert, plan normal, séance ajustée (1 série de moins sur les compléments, +15 s de repos) ou version allégée. Tu peux toujours garder le plan normal. Les jours de course, le même bilan donne un conseil de durée. Tout est calculé sur le téléphone, sans connexion.

## Premier lancement

Un écran d’accueil demande ton prénom (obligatoire), ta taille et ton poids actuel (facultatifs). Le repère protéines est calculé à environ 1,6 g par kg ; tout se modifie ensuite dans Profil. Si tu as déjà une sauvegarde (cloud ou fichier `.json`), restaure-la directement depuis cet écran.

Les données d’une version précédente sont reprises telles quelles : l’accueil ne s’affiche pas.

## Mode mains libres

Pendant une séance, le bouton haut-parleur (à côté de pause) active une voix qui annonce :

- l’exercice, le nombre de séries et la fourchette de répétitions ;
- la série validée et la durée du repos ;
- « 10 secondes » avant la fin du repos, puis la série ou l’exercice suivant ;
- le chrono des gainages, toutes les 10 secondes ;
- la fin de la séance.

Le réglage se trouve aussi dans Profil → Affichage et son. La voix est celle du téléphone, sans connexion. Comme pour la sonnerie, rien n’est garanti écran verrouillé : laisse l’application ouverte (l’écran reste allumé pendant la séance).

## Sauvegarde cloud

Profil → Sauvegarde cloud. Il faut un jeton GitHub avec le seul droit « gist » (le bouton « Ouvrir GitHub » le pré-coche) et un code secret de ton choix. Ensuite, chaque modification part toute seule, quelques secondes après, dans un Gist secret de ton compte.

- Le contenu est chiffré sur le téléphone (AES-256, clé tirée de ton code secret) : GitHub ne voit qu’un bloc illisible. Sans le code secret, personne ne peut relire la sauvegarde, toi compris : note-le.
- Le jeton et le code restent sur le téléphone ; ils ne font pas partie des sauvegardes.
- Nouveau téléphone : installe Élan, Profil → Sauvegarde cloud, même jeton et même code, puis « La restaurer ici ».
- Si le jeton expire, la fiche passe en « À vérifier » : crée-en un nouveau et reconnecte-toi.

## Série et badges

La flamme compte les activités prévues faites d’affilée (séance ou sortie) ; les jours de repos ne la cassent pas. Une semaine parfaite, c’est 3 séances et 2 sorties. 18 badges à débloquer, visibles en touchant la flamme.

## Tes données

- Elles sont enregistrées dans le navigateur du téléphone, pour cette adresse uniquement.
- Elles disparaissent si tu effaces les données du site, changes de navigateur ou de téléphone, ou si le système purge un site peu utilisé (Safari peut le faire après plusieurs semaines sans ouverture).
- Sur iPhone, l’application installée a un stockage séparé de Safari : installe-la d’abord, puis utilise-la depuis l’icône.
- Profil → « Télécharger la sauvegarde » crée un fichier `.json`. Fais-le chaque semaine et range-le hors du téléphone. « Restaurer » vérifie le fichier avant de remplacer quoi que ce soit, et garde une copie de sécurité.

## PDF du programme

Programme → « Ouvrir la version A4 » → « Imprimer ou enregistrer en PDF ». Choisis A4, échelle 100 %, et coche « Graphiques d’arrière-plan ». Cette version reprend ta date de départ et tes saisies.

## Limites réelles

- Le minuteur de repos garde son heure de fin : il reste juste après une mise en arrière-plan ou une fermeture. En revanche, un navigateur ne garantit ni sonnerie ni notification écran éteint. La vibration n’existe pas sur iPhone.
- Les illustrations sont des silhouettes schématiques fidèles aux positions et à la trajectoire, pas des vidéos : en cas de doute, les consignes écrites font foi.
- L’application ne donne aucun avis médical.
