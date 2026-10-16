import { VISITES } from '../data/visites'
import type { Listing } from './listings'

/** Lien de visite virtuelle du bien, s'il y en a une */
export const visiteFor = (l: Listing): string | undefined =>
  VISITES.find((v) => v.ref.toLowerCase() === l.reference.toLowerCase())?.url

/** URL intégrable en iframe (Matterport : lancement automatique) */
export function tourEmbedSrc(url: string): string {
  if (/matterport\.com\/show/.test(url) && !/[?&]play=/.test(url)) return `${url}&play=1`
  return url
}
