# Élan — version installable

Élan, ton programme de musculation et de course sur huit semaines.

Application web (PWA) sans compte, sans serveur et sans envoi de données. Tout est dans `index.html` ; les autres fichiers servent à l’installation et au hors-connexion.

```
index.html             l’application complète (polices et illustrations incluses)
manifest.webmanifest   nom, couleurs et icônes pour l’écran d’accueil
sw.js                  copie locale pour fonctionner hors connexion
icons/                 icônes de l’application
```

## L’installer sur ton téléphone

Une vraie installation demande une adresse **https**. Le plus simple et gratuit : GitHub Pages.

1. Crée un compte sur github.com, puis un nouveau dépôt (par exemple `entrainement`).
2. Dans le dépôt : « Add file » → « Upload files », dépose **le contenu** de ce dossier (index.html, manifest.webmanifest, sw.js et le dossier icons), puis valide.
3. « Settings » → « Pages » → source « Deploy from a branch », branche `main`, dossier `/ (root)`, puis « Save ».
4. Après une à deux minutes, l’adresse s’affiche : `https://ton-pseudo.github.io/entrainement/`.
5. Sur le téléphone :
   - **iPhone** : ouvre l’adresse dans **Safari**, bouton Partager, « Sur l’écran d’accueil ».
   - **Android** : ouvre l’adresse dans **Chrome**, menu ⋮, « Installer l’application » (ou « Ajouter à l’écran d’accueil »).
6. Ouvre l’application une fois avec du réseau : ensuite elle fonctionne hors connexion.

**Confidentialité.** `index.html` contient tes valeurs par défaut (prénom, taille, poids de départ). Un site GitHub Pages est consultable par toute personne qui connaît son adresse, et un dépôt gratuit est public. Si tu ne le souhaites pas, remplace ces valeurs dans le fichier avant de le publier. Tes saisies (séances, poids, sorties), elles, ne quittent jamais ton téléphone.

N’importe quel hébergement https de fichiers statiques convient aussi.

## Le coach

Avant chaque séance, trois touches : sommeil, énergie, courbatures. Le coach les croise avec tes dernières saisies (fatigue, douleur, réserve) et propose un niveau : feu vert, plan normal, séance ajustée (1 série de moins sur les compléments, +15 s de repos) ou version allégée. Tu peux toujours garder le plan normal. Les jours de course, le même bilan donne un conseil de durée. Tout est calculé sur le téléphone, sans connexion.

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
