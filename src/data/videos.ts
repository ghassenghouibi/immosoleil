/**
 * ============================================================
 *  VIDÉOS & RÉSEAUX SOCIAUX — C'EST ICI QUE VOUS AJOUTEZ VOS CONTENUS
 * ============================================================
 *
 *  1. Ouvrez le reel sur Instagram (ou TikTok / YouTube), copiez le lien
 *     de partage, ex :
 *        https://www.instagram.com/reel/C8xYz123abc/
 *        https://www.tiktok.com/@compte/video/7351234567890123456
 *        https://www.youtube.com/watch?v=dQw4w9WgXcQ
 *
 *  2. Ajoutez une entrée dans VIDEOS ci-dessous avec ce lien dans `url`.
 *     Le site détecte automatiquement la plateforme et affiche le lecteur
 *     intégré au clic sur la vignette.
 *
 *  3. (Optionnel) `ref` = référence du bien (ex. "ISD3907") : la vidéo
 *     apparaît alors aussi sur la fiche du bien et le bien reçoit le badge
 *     "Vidéo" dans les listes.
 *
 *  4. (Optionnel) `cover` = URL d'une image de couverture. Sans cover, le
 *     site utilise la 1ère photo du bien lié, sinon un fond dégradé.
 *
 *  Les vidéos sont affichées dans l'ordre de ce tableau (la première en
 *  premier). Les vidéos mp4 importées avec les biens (biens_immosoleildjerba.json)
 *  sont déjà rattachées automatiquement à leur fiche : inutile de les ajouter ici.
 */

export interface VideoItem {
  /** Lien Instagram reel / post, TikTok, YouTube, ou fichier .mp4 direct */
  url: string
  /** Titre affiché sous la vignette */
  title: string
  /** Sous-titre (quartier · référence) */
  subtitle?: string
  /** Référence du bien lié (facultatif) */
  ref?: string
  /** Image de couverture (facultatif) */
  cover?: string
  /** Nombre de vues à afficher, ex. "120 K" (facultatif) */
  views?: string
  /** Format : visite | quartier | coulisses | bien-du-jour (facultatif) */
  format?: 'visite' | 'quartier' | 'coulisses' | 'bien-du-jour'
}

export const VIDEOS: VideoItem[] = [
  // Exemple :
  // { url: 'https://www.instagram.com/reel/XXXXXXXX/', title: 'Visite de la Villa Ilef', ref: 'ISD688', format: 'visite' },
]

/** Comptes affichés dans l'en-tête, le pied de page et les fiches. Ajoutez TikTok / Facebook ici si besoin. */
export const SOCIAL = {
  instagram: { handle: '@agence_immo_soleil_djerba', url: 'https://www.instagram.com/agence_immo_soleil_djerba/' },
}
