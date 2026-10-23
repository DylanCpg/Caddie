# Caddie

# Caddie

Une appli de courses et de dépenses pour la famille : listes partagées en direct, suggestions de ce qu'il faut racheter, partage des frais façon Tricount et statistiques. Elle fonctionne dans le navigateur, s'installe sur le téléphone comme une appli, et marche aussi hors ligne.

## Fonctionnalités

**Listes**
- Plusieurs listes, rangées dans des dossiers
- Articles classés par rayon, avec un ordre des rayons réglable selon son magasin
- Ajout rapide, autocomplétion, dictée vocale et scan de code-barres
- Section « À prévoir ? » : Caddie apprend le rythme d'achat de chaque produit et propose de le racheter au bon moment
- Prix à l'unité, total estimé, et bouton pour noter la dépense correspondante
- Modifier un article, le déplacer vers une autre liste, dupliquer une liste, créer une liste à partir d'un modèle

**Dépenses**
- Personnes, groupes de dépenses (par exemple un par voyage) et catégories Courses, Voyage, Autre
- Répartition à parts égales ou inégales
- Soldes de chacun, remboursements proposés et remboursements notés
- Export en tableur (CSV)

**Stats**
- Produits les plus achetés et les plus ajoutés, achats par rayon, jour de la semaine, rythme sur 12 semaines
- Qui remplit la liste, produits qui coûtent le plus
- Dépenses par mois et par catégorie, qui avance le plus d'argent, plus grosses dépenses
- Filtre par période (30 jours, 3 mois, 1 an, tout)

**Partage et sauvegarde**
- Une liste partagée par code ou lien d'invitation : tous les appareils voient les mêmes données en direct
- Sert aussi de sauvegarde en ligne, même si on est seul(e)
- Export et import d'une sauvegarde (fichier JSON)

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Toute l'application (page, style et code) |
| `manifest.json` | Nom, couleurs et icônes pour l'installation |
| `sw.js` | Fonctionnement hors ligne |
| `firebase-config.js` | Configuration Firebase du projet |
| `firestore.rules` | Règles de sécurité à coller dans Firebase |
| `icon-192.png`, `icon-512.png` | Icônes de l'appli |

Il n'y a rien à installer ni à compiler : ce sont des fichiers statiques.

## Mise en ligne avec GitHub Pages (gratuit)

1. Crée un dépôt **public** sur GitHub et envoie-y tous les fichiers à la racine.
2. Dans le dépôt : **Settings > Pages**, choisis la branche `main` et le dossier `/ (root)`, puis **Save**.
3. Après 1 à 2 minutes, l'appli est disponible à l'adresse `https://TON-NOM.github.io/NOM-DU-DEPOT/`.
4. Sur le téléphone, ouvre l'adresse dans Chrome, puis **⋮ > Ajouter à l'écran d'accueil** (ou **Installer l'application**).

Sans configuration Firebase, l'appli fonctionne seule sur chaque téléphone, sans partage.

## Activer le partage (Firebase, formule gratuite Spark)

1. Crée un projet sur [console.firebase.google.com](https://console.firebase.google.com) et reste sur la formule **Spark** (aucune carte bancaire).
2. **Authentication > Sign-in method** : active **Anonyme**.
3. **Firestore Database** : crée une base (mode production, emplacement en Europe), puis dans l'onglet **Règles**, colle ceci et publie :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /households/{code} {
      allow read, write: if request.auth != null;
    }
    match /households/{code}/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. **Paramètres du projet > Vos applications > Web (`</>`)** : enregistre une appli et copie la configuration.
5. Ouvre `firebase-config.js` et remplace `null` par cette configuration :

```js
window.CADDIE_FIREBASE = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

6. Envoie le fichier modifié sur GitHub.
7. Dans l'appli : **Réglages > Sauvegarde et partage > Créer une liste partagée**, puis envoie le code ou le lien aux autres personnes du foyer.

## Obtenir un fichier APK (Android)

1. Ouvre [pwabuilder.com](https://www.pwabuilder.com) et colle l'adresse de ton site.
2. Choisis **Package for stores**, puis **Android**.
3. Garde la clé de signature sur **New**, puis télécharge le paquet.
4. Extrais le zip et installe le fichier `.apk` (autorise les sources inconnues).
5. Conserve le zip : il contient la clé de signature, utile pour de futures versions.

L'APK ouvre ton site en ligne : les mises à jour du site apparaissent donc sans régénérer l'APK. Gmail bloque les `.apk` : envoie-le par Google Drive, Quick Share ou Telegram.

## Mettre à jour l'appli

1. Remplace les fichiers modifiés sur GitHub (Add file > Upload files, mêmes noms).
2. Dans `sw.js`, augmente le numéro de version (`caddie-v6` devient `caddie-v7`) pour forcer la mise à jour.
3. Ferme complètement l'appli et rouvre-la deux fois.

## Données et confidentialité

- Sans partage, les données restent dans le navigateur de l'appareil (stockage local).
- Avec le partage, elles sont stockées dans ton projet Firebase, dans l'espace d'un « foyer » identifié par un code secret de 10 caractères. Quiconque possède le code peut lire et modifier la liste : ne le publie pas.
- Les identifiants de `firebase-config.js` ne sont pas des secrets : ils sont visibles dans toute appli web. Ce qui protège les données, ce sont les règles Firestore et le code du foyer. Tu peux restreindre la clé API à ton site dans la console Google Cloud (Identifiants).
- Le scan de code-barres interroge le service public [Open Food Facts](https://world.openfoodfacts.org) pour retrouver le nom du produit.

## Limites connues

- Pas de notifications quand l'appli est fermée (il faudrait la formule payante de Firebase).
- Les quotas gratuits de Firebase (lectures et écritures par jour) suffisent largement pour un foyer. En cas de dépassement, le service s'arrête jusqu'au lendemain, sans facturation.
- Le scan et la dictée vocale dépendent du navigateur et peuvent ne pas fonctionner dans l'APK.
- Tout est en euros et en français.
