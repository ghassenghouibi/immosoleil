/**
 * Transforme un lien de partage (Instagram, TikTok, YouTube, mp4) en
 * lecteur intégrable. Aucun token ni API nécessaire : on utilise les
 * URLs d'embed publiques de chaque plateforme.
 */

export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'video' | 'unknown'

export interface Embed {
  platform: Platform
  /** URL à charger dans l'iframe (ou src du <video>) */
  src: string
  /** Ratio d'affichage : reels verticaux 9/16, YouTube 16/9 */
  vertical: boolean
  /** Vrai tant que l'URL est encore un placeholder "REMPLACER_..." */
  placeholder: boolean
}

export function parseEmbed(url: string): Embed {
  const placeholder = /REMPLACER/i.test(url)
  let m: RegExpMatchArray | null

  // Instagram reel / post / tv  →  https://www.instagram.com/reel/<code>/embed/
  if ((m = url.match(/instagram\.com\/(?:[^/]+\/)?(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/))) {
    const kind = m[1] === 'reels' ? 'reel' : m[1]
    return { platform: 'instagram', src: `https://www.instagram.com/${kind}/${m[2]}/embed/`, vertical: true, placeholder }
  }
  // TikTok  →  https://www.tiktok.com/embed/v2/<id>
  if ((m = url.match(/tiktok\.com\/.*\/video\/(\d+)/)) || (m = url.match(/tiktok\.com\/embed\/(?:v2\/)?(\d+)/))) {
    return { platform: 'tiktok', src: `https://www.tiktok.com/embed/v2/${m[1]}`, vertical: true, placeholder }
  }
  // YouTube (watch, youtu.be, shorts)
  if ((m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/))) {
    const vertical = /shorts\//.test(url)
    return { platform: 'youtube', src: `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0`, vertical, placeholder }
  }
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) {
    return { platform: 'video', src: url, vertical: true, placeholder }
  }
  return { platform: 'unknown', src: url, vertical: true, placeholder }
}

export const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  video: 'Vidéo',
  unknown: 'Lien',
}
