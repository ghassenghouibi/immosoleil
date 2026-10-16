import raw from '../data/proximite.json'
import type { Listing } from './listings'

export type ProxCategory = 'commerces' | 'ecoles' | 'sante' | 'transports' | 'hotels' | 'loisirs'

export interface Place {
  name: string
  /** Type lisible : Supermarché, Pharmacie, École… */
  kind: string
  /** Distance à vol d'oiseau en mètres */
  m: number
}

interface Entry {
  lat: number
  lng: number
  /** Faux si la localité n'a pas été trouvée et qu'on a pris le centre de la délégation */
  precise: boolean
  places: Partial<Record<ProxCategory, Place[]>>
}

const DATA = raw as Record<string, Entry>

export const PROX_LABEL: Record<ProxCategory, string> = {
  commerces: 'Commerces',
  ecoles: 'Écoles',
  sante: 'Santé',
  transports: 'Transports',
  hotels: 'Hôtels',
  loisirs: 'Loisirs & restauration',
}

/** Lieux autour du bien (générés depuis OpenStreetMap par scripts/build-proximite.py) */
export const proximiteFor = (l: Listing): Entry | undefined => DATA[`${l.localite}|${l.delegation}`]

/** Pour les séjours : « Midoun – Houmt Souk » → Midoun */
export function proximiteForLocalite(localite: string): Entry | undefined {
  const loc = localite.split(' – ')[0].trim()
  return DATA[`${loc}|${loc}`]
}

/** "350 m · 4 min à pied" / "2,4 km · 4 min en voiture" */
export function formatDistance(m: number): string {
  const d = m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`
  return m <= 1500
    ? `${d} · ${Math.max(1, Math.round(m / 80))} min à pied`
    : `${d} · ${Math.max(1, Math.round(m / 500))} min en voiture`
}
