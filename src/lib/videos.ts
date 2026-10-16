import { VIDEOS, type VideoItem } from '../data/videos'
import { LISTINGS, byRef, type Listing } from './listings'

/** Vidéos d'un bien : celles de src/data/videos.ts + les mp4 importés avec la fiche */
export const videosFor = (l: Listing): VideoItem[] => [
  ...VIDEOS.filter((v) => v.ref && v.ref.toLowerCase() === l.reference.toLowerCase()),
  ...l.videos.map((url, i) => ({ url, title: l.videos.length > 1 ? `Visite vidéo ${i + 1}` : 'Visite vidéo', subtitle: l.titre, ref: l.reference })),
]

/** Références (minuscules) des biens qui ont au moins une vidéo */
export const VIDEO_REFS = new Set([
  ...VIDEOS.filter((v) => v.ref).map((v) => v.ref!.toLowerCase()),
  ...LISTINGS.filter((l) => l.videos.length).map((l) => l.reference.toLowerCase()),
])

export const hasVideo = (l: Listing) => VIDEO_REFS.has(l.reference.toLowerCase())

/** Bien lié à une vidéo, si la référence existe dans les annonces */
export const listingOf = (v: VideoItem): Listing | undefined => (v.ref ? byRef(v.ref) : undefined)
