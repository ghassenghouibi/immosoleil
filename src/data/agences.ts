/**
 * Coordonnées de l'agence : utilisées partout sur le site (en-tête, pied de page,
 * boutons WhatsApp, demandes de réservation).
 * Le numéro WhatsApp reçoit les demandes de réservation des locations vacances.
 */
export type AgencySlug = 'djerba'

export interface Agency {
  slug: AgencySlug
  name: string
  short: string
  initials: string
  phone: string
  phone2?: string
  /** Numéro WhatsApp au format international, chiffres seulement */
  whatsapp: string
  address: string
  hours: string
  mapsQuery: string
}

export const AGENCIES: Agency[] = [
  {
    slug: 'djerba',
    name: 'Immo Soleil Djerba',
    short: 'Djerba',
    initials: 'IS',
    phone: '+216 25 509 998',
    whatsapp: '21625509998',
    address: 'Djerba, Tunisie',
    /** Horaires affichés sur le site : à compléter */
    hours: 'Sur rendez-vous',
    mapsQuery: 'Immo Soleil Djerba',
  },
]

export const AGENCY = AGENCIES[0]
export const agencyBySlug = (slug: AgencySlug) => AGENCIES.find((a) => a.slug === slug) ?? AGENCY

export const CONTACT = {
  phone: AGENCY.phone,
  email: 'contact@immosoleildjerba.com',
  whatsapp: AGENCY.whatsapp,
}

/** Lien WhatsApp avec message pré-rempli */
export const waLink = (text: string, number = CONTACT.whatsapp) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`
