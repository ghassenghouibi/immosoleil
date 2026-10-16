import raw from '../data/annonces.json'
import type { AgencySlug } from '../data/agences'

export type { AgencySlug }

export type Rubrique = 'acheter' | 'louer' | 'bureaux-et-commerces'

export interface RawAnnonce {
  id: string
  reference: string
  titre: string
  transaction: 'Vente' | 'Location'
  disponibilite: string
  type_bien: string
  prix: number | null
  devise: string
  prix_texte: string
  surface_habitable_m2: number | null
  surface_terrain_m2: number | null
  surface_m2: number | null
  chambres: number | null
  suites: number | null
  sdb: number | null
  pays: string
  gouvernorat: string
  delegation: string
  localite: string
  adresse_complete: string
  description: string
  agence: string
  telephones: string[]
  rubriques: Rubrique[]
  photos: string[]
  nb_photos: number
  /** Vidéos mp4 de la fiche WordPress */
  videos: string[]
  url: string
  autres_champs: Record<string, string>
  statut_annonce: string | null
  /** 'm2' quand le prix est au m² (terrains) */
  prix_unite?: 'm2' | null
  /** Description découpée en sections par scripts/import-biens.py */
  sections: Section[]
  points_cles: string[]
}

export interface Section {
  titre: string | null
  texte: string[]
  liste: string[]
}

export interface Listing extends RawAnnonce {
  /** Catégorie principale : Appartement, Maison / Villa, Terrain, Bureau et local, Immeuble */
  categorie: string
  /** Sous-type (Duplex, Villa, Local commercial...) ou catégorie si absent */
  sousType: string
  /** Libellé court en capitales pour la carte : VILLA, DUPLEX, APPARTEMENT... */
  kicker: string
  agenceSlug: AgencySlug
  /** Prestations détectées dans la description */
  features: string[]
  isLocation: boolean
  isDisponible: boolean
  isNeuf: boolean
  isMeuble: boolean
}

const FEATURE_RULES: [RegExp, string][] = [
  [/piscine/i, 'Piscine'],
  [/vue (sur )?mer/i, 'Vue mer'],
  [/meubl/i, 'Meublé'],
  [/balcon/i, 'Balcon'],
  [/terrasse/i, 'Terrasse'],
  [/jardin/i, 'Jardin'],
  [/garage/i, 'Garage'],
  [/parking/i, 'Parking'],
  [/ascenseur/i, 'Ascenseur'],
  [/climatis|clim\b/i, 'Climatisation'],
  [/chauffage central/i, 'Chauffage central'],
  [/jacuzzi/i, 'Jacuzzi'],
  [/titre foncier|titre bleu/i, 'Titre bleu'],
  [/sur plan|promoteur|neuf/i, 'Neuf / sur plan'],
  [/cuisine (équipée|equipée|équipé)/i, 'Cuisine équipée'],
  [/dressing/i, 'Dressing'],
  [/gardien|sécurité|securit/i, 'Gardiennage'],
]

function kickerFor(categorie: string, sousType: string): string {
  const s = sousType.toLowerCase()
  if (s.includes('duplex')) return 'DUPLEX'
  if (s.includes('triplex')) return 'TRIPLEX'
  if (s.includes('rdc')) return 'RDC DE VILLA'
  if (s.includes('étage')) return 'ÉTAGE DE VILLA'
  if (s.includes('commerce')) return 'FONDS DE COMMERCE'
  if (s.includes('local')) return 'LOCAL'
  if (s.includes('bureau')) return 'BUREAU'
  const c = categorie.toLowerCase()
  if (c.includes('villa')) return 'VILLA'
  if (c.includes('terrain')) return 'TERRAIN'
  if (c.includes('immeuble')) return 'IMMEUBLE'
  if (c.includes('bureau')) return 'BUREAU'
  return 'APPARTEMENT'
}

function normalize(a: RawAnnonce): Listing {
  const [categorie, sub] = a.type_bien.split('|').map((s) => s.trim())
  const sousType = sub || categorie
  const text = `${a.titre} ${a.description} ${a.points_cles.join(' ')} ${a.sections.flatMap((s) => s.liste).join(' ')}`
  const features = FEATURE_RULES.filter(([re]) => re.test(text)).map(([, label]) => label)
  return {
    ...a,
    titre: a.titre.replace(/\s+/g, ' ').trim(),
    categorie,
    sousType,
    kicker: kickerFor(categorie, sousType),
    agenceSlug: 'djerba',
    features,
    isLocation: a.transaction === 'Location',
    isDisponible: a.disponibilite === 'disponible' || a.disponibilite === 'inconnu',
    isNeuf: /sur plan|promoteur|villas? neuves?|entièrement neuve/i.test(text),
    isMeuble: /meubl/i.test(text) || a.autres_champs.Ameublement === 'Meublé',
  }
}

const data = raw as unknown as { source: string; date_extraction: string; nb_annonces: number; annonces: RawAnnonce[] }

export const LISTINGS: Listing[] = data.annonces.map(normalize)
export const EXTRACTION_DATE = data.date_extraction
export const TOTAL_PHOTOS = LISTINGS.reduce((n, l) => n + l.photos.length, 0)

export const byId = (id: string) => LISTINGS.find((l) => l.id === id)
export const byRef = (ref: string) =>
  LISTINGS.find((l) => l.reference.toLowerCase() === ref.toLowerCase())

/* ---------- Formatting ---------- */

export function formatPrice(l: Pick<Listing, 'prix' | 'isLocation' | 'prix_unite'>): { main: string; suffix?: string } {
  if (!l.prix) return { main: 'Prix sur demande' }
  const main = `${l.prix.toLocaleString('fr-FR').replace(/ | /g, ' ')} DT`
  if (l.prix_unite === 'm2') return { main, suffix: '/ m²' }
  return l.isLocation ? { main, suffix: '/ mois' } : { main }
}

export function pricePerM2(l: Listing): string | null {
  const s = l.surface_habitable_m2 || l.surface_m2
  if (!l.prix || !s || l.isLocation || l.prix_unite) return null
  return `≈ ${Math.round(l.prix / s).toLocaleString('fr-FR')} DT / m² habitable`
}

export function shortLocation(l: Listing): string {
  return l.localite === 'Djerba' ? 'Djerba' : `${l.localite}, Djerba`
}

/* ---------- Zones (quartiers) ---------- */

export interface Zone {
  slug: string
  name: string
  /** Délégations regroupées dans cette zone */
  delegations: string[]
  tagline?: string
}

/** Quartiers de Djerba présents dans les annonces, du plus fourni au moins fourni ("Djerba" = quartier non précisé). */
export const slugify = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const countIn = (d: string) => LISTINGS.filter((l) => l.delegation === d).length
export const ZONES: Zone[] = [...new Set(LISTINGS.map((l) => l.delegation))]
  .filter((d) => d !== 'Djerba')
  .sort((a, b) => countIn(b) - countIn(a))
  .map((d) => ({ slug: slugify(d), name: d, delegations: [d] }))

export const zoneBySlug = (slug: string) => ZONES.find((z) => z.slug === slug)
export const zoneOf = (l: Listing) => ZONES.find((z) => z.delegations.includes(l.delegation))
export const zoneCount = (z: Zone) => LISTINGS.filter((l) => z.delegations.includes(l.delegation)).length

/* ---------- Filtering ---------- */

export interface Filters {
  rubrique: Rubrique
  zone?: string
  type?: string
  budgetMax?: number
  pieces?: number
  surfaceMin?: number
  video?: boolean
  sort?: 'recent' | 'price-asc' | 'price-desc' | 'surface-desc'
  q?: string
}

export const CATEGORIES = ['Maison / Villa', 'Terrain', 'Bureau et local...']
export const CATEGORY_LABEL: Record<string, string> = {
  'Appartement': 'Appartement',
  'Maison / Villa': 'Maison / Villa',
  'Terrain': 'Terrain',
  'Bureau et local...': 'Commerce & local',
  'Immeuble': 'Immeuble',
}

export function applyFilters(all: Listing[], f: Filters, videoRefs: Set<string> = new Set()): Listing[] {
  let out = all.filter((l) => l.rubriques.includes(f.rubrique))
  // cohérence rubrique / transaction : "acheter" n'affiche que des ventes, "louer" que des locations
  if (f.rubrique === 'acheter') out = out.filter((l) => !l.isLocation)
  if (f.rubrique === 'louer') out = out.filter((l) => l.isLocation)
  if (f.zone) {
    const z = zoneBySlug(f.zone)
    if (z) out = out.filter((l) => z.delegations.includes(l.delegation))
  }
  if (f.type) out = out.filter((l) => l.categorie === f.type)
  if (f.budgetMax) out = out.filter((l) => !l.prix || l.prix <= f.budgetMax!)
  if (f.pieces) out = out.filter((l) => (l.chambres ?? 0) >= f.pieces!)
  if (f.surfaceMin) out = out.filter((l) => (l.surface_habitable_m2 ?? l.surface_m2 ?? 0) >= f.surfaceMin!)
  if (f.video) out = out.filter((l) => videoRefs.has(l.reference.toLowerCase()))
  if (f.q) {
    const q = f.q.toLowerCase()
    out = out.filter((l) => `${l.titre} ${l.reference} ${l.adresse_complete}`.toLowerCase().includes(q))
  }
  // disponibles d'abord
  out = [...out].sort((a, b) => Number(b.isDisponible) - Number(a.isDisponible))
  switch (f.sort) {
    case 'price-asc':
      out.sort((a, b) => (a.prix || Infinity) - (b.prix || Infinity))
      break
    case 'price-desc':
      out.sort((a, b) => (b.prix || 0) - (a.prix || 0))
      break
    case 'surface-desc':
      out.sort((a, b) => (b.surface_m2 || 0) - (a.surface_m2 || 0))
      break
    default:
      // "récents" : l'id WordPress est croissant avec la date de publication
      out.sort((a, b) => Number(b.isDisponible) - Number(a.isDisponible) || Number(b.id) - Number(a.id))
  }
  return out
}

export const RUBRIQUE_LABEL: Record<Rubrique, string> = {
  acheter: 'Acheter',
  louer: 'Louer',
  'bureaux-et-commerces': 'Commerces',
}

export const RUBRIQUE_TITLE: Record<Rubrique, string> = {
  acheter: 'Biens à vendre',
  louer: "Locations à l'année",
  'bureaux-et-commerces': 'Commerces et fonds de commerce',
}

export const BUDGETS_VENTE = [200000, 400000, 600000, 900000, 1500000, 2500000]
export const BUDGETS_LOCATION = [1000, 1500, 2000, 3000, 5000]

export function similar(l: Listing, n = 4): Listing[] {
  return LISTINGS.filter((o) => o.id !== l.id && o.isDisponible && o.transaction === l.transaction)
    .sort((a, b) => Number(b.delegation === l.delegation) - Number(a.delegation === l.delegation) || Number(b.categorie === l.categorie) - Number(a.categorie === l.categorie))
    .slice(0, n)
}
