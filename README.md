# Immoland — site web (React)

Front React (Vite + TypeScript + React Router) construit d'après la maquette `Refonte Immoland.pdf` et alimenté par les 304 annonces de `immoland_annonces.json`.

## Lancer

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # sortie dans dist/
npm run preview  # prévisualiser le build
```

## Pages

| Route | Contenu |
| --- | --- |
| `/` | Accueil : hero, recherche, chiffres, coups de cœur, locations, quartiers, section vidéo/Instagram, agences |
| `/acheter`, `/louer`, `/bureaux-et-commerces` | Listes filtrables (zone, type, budget, pièces, surface, "avec vidéo"), tri, pagination, carte, alerte |
| `/bien/:id` | Fiche du bien : galerie + lightbox, chiffres clés, description, prestations, détail, visite vidéo, adresse, formulaire, biens similaires |
| `/videos` | **Immoland Studio** : section dédiée aux vidéos Instagram / TikTok |
| `/agences`, `/contact`, `/deposer`, `/conseils`, `/favoris` | Pages secondaires |

## 🎬 Ajouter les vidéos Instagram de l'agence

Tout se passe dans **`src/data/videos.ts`** :

```ts
export const VIDEOS: VideoItem[] = [
  {
    url: 'https://www.instagram.com/reel/C8xYz123abc/',   // ← lien de partage du reel
    title: 'Visite : villa S+5 avec piscine',
    subtitle: 'Chotrana 3 · Ref4350a',
    ref: 'Ref4350a',        // (optionnel) lie la vidéo à la fiche du bien
    views: '120 K',         // (optionnel)
  },
]
```

- Liens acceptés : reels et posts Instagram, TikTok, YouTube (watch / shorts), fichier `.mp4`.
- Le lecteur intégré s'ouvre au clic sur la vignette (embed officiel de chaque plateforme, aucun token nécessaire).
- Avec `ref`, la vidéo apparaît aussi sur la fiche du bien (bloc « Visite vidéo » + « La visite en vidéo ») et le bien reçoit le badge **Vidéo** dans les listes et le filtre « Avec vidéo ».
- `INSTAGRAM_POSTS` alimente la grille « Les derniers posts » de la page `/videos`.
- `SOCIAL` contient les comptes et le nombre d'abonnés affichés.

Tant qu'une URL contient `REMPLACER`, la vignette s'affiche avec un message « Vidéo à renseigner » au lieu du lecteur.

## 🎨 Logo & charte

- Logo officiel dans `src/assets/` : `logo.svg` (complet), `logo-compact.svg` (sans signature, utilisé dans l'en-tête), `logo-light.svg` (signature blanche, pied de page). Le favicon (`public/favicon.svg`) reprend le bâtiment seul.
- Couleurs tirées du logo dans `src/index.css` (`--blue #1964a5`, `--sky #1ab6df`, `--lime #96c11e`). Titres en Playfair Display, texte en Inter ; angles quasi droits (`--radius: 4px`, `--radius-sm: 2px`) et boutons en capitales espacées.

## 🏠 Page d'accueil : hero & animations

- Le diaporama du hero (`SLIDES` dans `src/pages/Home.tsx`) utilise 4 photos libres de droits (Unsplash) dans `src/assets/hero/`. Remplacez-les par vos propres photos (≈1600 px de large, JPEG) et adaptez les légendes.
- Animations : Ken Burns + fondu entre les slides, entrée en scène du texte, carte "coup de cœur" flottante, compteurs animés, bandeau de quartiers défilant, apparition au scroll (`.reveal` / `.reveal-stagger`, hook `useRevealAll`). Le tout est désactivé si l'utilisateur a activé « réduire les animations ».
- L'en-tête est transparent sur le hero et devient blanc dès qu'on scrolle (`<Header overlay />`).

## Données

- `src/data/annonces.json` : export brut des annonces (copie de `../immoland_annonces.json`). Pour mettre à jour, remplacez le fichier.
- `src/lib/listings.ts` : normalisation (catégorie, sous-type, prestations détectées, titres nettoyés), zones/quartiers, filtres.
- `src/data/agences.ts` : coordonnées des trois agences.

Les photos sont chargées depuis `immoland.tn` ; en cas d'image indisponible, un fond dégradé s'affiche à la place.

## Points à brancher plus tard

- Formulaires (contact, estimation, alerte, demande sur un bien) : actuellement un simple message de confirmation côté client — à relier à un back-end / e-mail.
- Carte : illustration décorative (les annonces n'ont pas de coordonnées GPS). Un lien « Ouvrir dans Google Maps » utilise l'adresse.
- Favoris : stockés dans `localStorage` du navigateur.
