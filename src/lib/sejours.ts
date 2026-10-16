import raw from '../data/sejours.json'
import { DELAI_ARRIVEE_JOURS, MIN_NUITS, RESERVATIONS } from '../data/reservations'
import type { Section } from './listings'

/* ---------- Données ---------- */

/** Ligne de la grille tarifaire : prix par nuit pour un ou plusieurs mois (éventuellement une quinzaine) */
export interface Tarif {
  label: string
  mois: number[]
  du?: number
  au?: number
  prix: number
}

export interface RawSejour {
  id: string
  slug: string
  nom: string
  url: string
  localite: string
  lieu: string
  accroche: string
  points_cles: string[]
  sections: Section[]
  equipements: string[]
  photos: string[]
  videos: string[]
  chambres: number | null
  suites: number | null
  voyageurs: number | null
  tarifs: Tarif[]
  /** Prix unique par nuit quand la villa n'a pas de grille par saison */
  prix_nuit: number | null
  piscine: boolean
  jacuzzi: boolean
  plage_km: number | null
}

export interface Sejour extends RawSejour {
  /** « Villa Alba » (le nom WordPress complet peut contenir un sous-titre après « – ») */
  titre: string
  sousTitre?: string
  /** Prix par nuit le plus bas de l'année, null si tarif sur demande */
  prixMin: number | null
  /** Mois ouverts à la location (1-12) ; vide = toute l'année */
  saison: number[]
  /** Équipements / atouts dédoublonnés pour l'affichage */
  atouts: string[]
  /** Clé favoris (distincte des ids d'annonces) */
  favKey: string
}

const data = raw as unknown as { date_extraction: string; sejours: RawSejour[] }

function normalize(s: RawSejour): Sejour {
  const [titre, ...rest] = s.nom.split(/\s+[–-]\s+/)
  const prixs = s.tarifs.map((t) => t.prix)
  const atouts: string[] = []
  const seen = new Set<string>()
  const key = (a: string) => a.toLowerCase().replace(/[^a-zà-ÿ]/g, '')
  // les libellés les plus longs d'abord : « Piscine privée avec cascade » absorbe « Piscine privée »
  const candidates = [...s.points_cles, ...s.equipements].filter((a) => !/voyageurs|chambres?$|^\d+ (suite|chambre|lit|salle)/i.test(a))
  for (const a of [...candidates].sort((x, y) => y.length - x.length)) {
    const k = key(a)
    if ([...seen].some((o) => o.includes(k))) continue
    seen.add(k)
  }
  for (const a of candidates) if (seen.delete(key(a))) atouts.push(a)
  return {
    ...s,
    titre: titre.trim(),
    sousTitre: rest.join(' – ') || undefined,
    prixMin: prixs.length ? Math.min(...prixs) : s.prix_nuit,
    saison: [...new Set(s.tarifs.flatMap((t) => t.mois))].sort((a, b) => a - b),
    atouts,
    favKey: `s:${s.slug}`,
  }
}

export const SEJOURS: Sejour[] = data.sejours.map(normalize)
export const sejourBySlug = (slug: string) => SEJOURS.find((s) => s.slug === slug)
export const sejourById = (id: string) => SEJOURS.find((s) => s.id === id)

export const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

/* ---------- Dates (chaînes locales AAAA-MM-JJ, pas de fuseau horaire) ---------- */

export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const parseIso = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const addDays = (s: string, n: number) => {
  const d = parseIso(s)
  d.setDate(d.getDate() + n)
  return iso(d)
}
export const nightsBetween = (a: string, b: string) => Math.round((parseIso(b).getTime() - parseIso(a).getTime()) / 86400000)
export const today = () => iso(new Date())
export const firstBookable = () => addDays(today(), DELAI_ARRIVEE_JOURS)
export const isValidIso = (s: string | null | undefined): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(parseIso(s).getTime())

/** « 3 juil. » / « 3 juil. 2027 » */
export function shortDate(s: string, withYear = false): string {
  return parseIso(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) })
}
export const longDate = (s: string) => parseIso(s).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
export const dt = (n: number) => `${n.toLocaleString('fr-FR').replace(/ | /g, ' ')} DT`

/* ---------- Prix & disponibilités ---------- */

/** Prix de la nuit qui commence ce jour-là ; null = hors saison ou tarif sur demande */
export function nightPrice(s: Sejour, day: string): number | null {
  if (!s.tarifs.length) return s.prix_nuit
  const d = parseIso(day)
  const m = d.getMonth() + 1
  const t = s.tarifs.find((t) => t.mois.includes(m) && (t.du === undefined || (d.getDate() >= t.du && d.getDate() <= (t.au ?? 31))))
  return t?.prix ?? null
}

/** La villa n'est louée que sur certains mois (grille de tarifs) */
export const isInSeason = (s: Sejour, day: string) => !s.saison.length || s.saison.includes(parseIso(day).getMonth() + 1)

export function isReserved(s: Sejour, day: string): boolean {
  return (RESERVATIONS[s.slug] ?? []).some(([a, b]) => day >= a && day < b)
}

export type NightStatus = 'ok' | 'past' | 'reserved' | 'closed'

/** Peut-on dormir à la villa la nuit qui commence ce jour-là ? */
export function nightStatus(s: Sejour | undefined, day: string): NightStatus {
  if (day < firstBookable()) return 'past'
  if (!s) return 'ok'
  if (isReserved(s, day)) return 'reserved'
  if (!isInSeason(s, day)) return 'closed'
  return 'ok'
}

export function rangeAvailable(s: Sejour | undefined, start: string, end: string): boolean {
  for (let d = start; d < end; d = addDays(d, 1)) if (nightStatus(s, d) !== 'ok') return false
  return true
}

export interface QuoteLine {
  prix: number | null
  nuits: number
  label: string
}

export interface Quote {
  nuits: number
  lignes: QuoteLine[]
  /** null si au moins une nuit est « sur demande » */
  total: number | null
  ok: boolean
  erreur?: string
}

/** Devis d'un séjour : nuits groupées par prix (« 450 DT × 4 nuits (juillet) ») */
export function quote(s: Sejour, start: string, end: string): Quote {
  const nuits = nightsBetween(start, end)
  const lignes: QuoteLine[] = []
  for (let d = start; d < end; d = addDays(d, 1)) {
    const prix = nightPrice(s, d)
    const mois = MOIS[parseIso(d).getMonth()]
    const last = lignes[lignes.length - 1]
    if (last && last.prix === prix) {
      last.nuits++
      if (!last.label.includes(mois)) last.label += ` – ${mois}`
    } else lignes.push({ prix, nuits: 1, label: mois })
  }
  const total = lignes.some((l) => l.prix === null) ? null : lignes.reduce((n, l) => n + l.prix! * l.nuits, 0)
  let erreur: string | undefined
  if (nuits < MIN_NUITS) erreur = `Séjour de ${MIN_NUITS} nuits minimum`
  else if (!rangeAvailable(s, start, end)) erreur = 'Certaines nuits ne sont pas disponibles'
  return { nuits, lignes, total, ok: !erreur, erreur }
}

/** « Mai → septembre » / « Juillet, août » / « Toute l'année » */
export function saisonLabel(s: Sejour): string {
  if (!s.saison.length) return "Toute l'année"
  const m = s.saison
  const contiguous = m.every((x, i) => i === 0 || x === m[i - 1] + 1)
  const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)
  if (contiguous && m.length > 2) return `${cap(MOIS[m[0] - 1])} → ${MOIS[m[m.length - 1] - 1]}`
  return cap(m.map((x) => MOIS[x - 1]).join(', '))
}

/* ---------- Recherche ---------- */

export interface SejourFilters {
  arrivee?: string
  depart?: string
  voyageurs?: number
  zone?: string
  piscine?: boolean
  jacuzzi?: boolean
  chambres?: number
  budgetNuit?: number
  sort?: 'reco' | 'prix-asc' | 'prix-desc' | 'capacite'
}

export const SEJOUR_ZONES = [...new Set(SEJOURS.map((s) => s.localite))].filter((z) => z !== 'Djerba')

export function searchSejours(f: SejourFilters): { dispo: Sejour[]; indispo: Sejour[] } {
  let out = SEJOURS
  if (f.voyageurs) out = out.filter((s) => !s.voyageurs || s.voyageurs >= f.voyageurs!)
  if (f.zone) out = out.filter((s) => s.localite === f.zone || s.localite.includes(f.zone!))
  if (f.piscine) out = out.filter((s) => s.piscine)
  if (f.jacuzzi) out = out.filter((s) => s.jacuzzi)
  if (f.chambres) out = out.filter((s) => (s.chambres ?? 0) >= f.chambres!)
  if (f.budgetNuit) out = out.filter((s) => s.prixMin !== null && s.prixMin <= f.budgetNuit!)
  const hasDates = isValidIso(f.arrivee) && isValidIso(f.depart) && f.depart! > f.arrivee!
  const total = (s: Sejour) => (hasDates ? quote(s, f.arrivee!, f.depart!).total : null) ?? s.prixMin ?? Infinity
  const sorted = [...out]
  switch (f.sort) {
    case 'prix-asc': sorted.sort((a, b) => total(a) - total(b)); break
    case 'prix-desc': sorted.sort((a, b) => (total(b) === Infinity ? -1 : total(b)) - (total(a) === Infinity ? -1 : total(a))); break
    case 'capacite': sorted.sort((a, b) => (b.voyageurs ?? 0) - (a.voyageurs ?? 0)); break
    default: sorted.sort((a, b) => Number(b.prixMin !== null) - Number(a.prixMin !== null) || b.photos.length - a.photos.length)
  }
  if (!hasDates) return { dispo: sorted, indispo: [] }
  return {
    dispo: sorted.filter((s) => rangeAvailable(s, f.arrivee!, f.depart!)),
    indispo: sorted.filter((s) => !rangeAvailable(s, f.arrivee!, f.depart!)),
  }
}

/** Lecture des paramètres d'URL partagés entre la liste et la fiche (?arrivee=&depart=&voyageurs=) */
export function stayFromParams(sp: URLSearchParams) {
  const a = sp.get('arrivee')
  const d = sp.get('depart')
  // l'arrivée seule est conservée (sélection en cours dans le calendrier)
  const arrivee = isValidIso(a) && a >= firstBookable() ? a : undefined
  const depart = arrivee && isValidIso(d) && d > arrivee ? d : undefined
  return {
    arrivee,
    depart,
    adultes: Math.max(1, Number(sp.get('adultes')) || Number(sp.get('voyageurs')) || 2),
    enfants: Math.max(0, Number(sp.get('enfants')) || 0),
    bebes: Math.max(0, Number(sp.get('bebes')) || 0),
  }
}

export { MIN_NUITS }

/* ---------- Voyageurs ---------- */

export interface Guests { adultes: number; enfants: number; bebes: number }

export const guestsLabel = (g: Guests) => {
  const n = g.adultes + g.enfants
  return `${n} voyageur${n > 1 ? 's' : ''}${g.bebes ? `, ${g.bebes} bébé${g.bebes > 1 ? 's' : ''}` : ''}`
}

/** Paramètres de recherche (dates, voyageurs) conservés d'une page à l'autre */
export const stayQuery = (sp?: URLSearchParams) => {
  if (!sp) return ''
  const keep = new URLSearchParams()
  for (const k of ['arrivee', 'depart', 'adultes', 'enfants', 'bebes']) {
    const v = sp.get(k)
    if (v) keep.set(k, v)
  }
  const q = keep.toString()
  return q ? `?${q}` : ''
}
