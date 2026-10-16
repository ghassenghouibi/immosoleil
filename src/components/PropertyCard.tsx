import { Link } from 'react-router-dom'
import Photo from './Photo'
import { Area, Bed, Camera, Check, Heart, Home, Land, Pin, Play, Star, User } from './Icons'
import { formatPrice, shortLocation, type Listing } from '../lib/listings'
import { useFavorites } from '../hooks/useFavorites'
import { hasVideo } from '../lib/videos'
import './PropertyCard.css'

const FEATURE_ICON: Record<string, React.ReactNode> = {
  Piscine: <Star size={16} />,
  Balcon: <Home size={16} />,
  Jardin: <Land size={16} />,
}

function tone(l: Listing): '' | 'ph-lime' | 'ph-sky' {
  const n = Number(l.id) % 3
  return n === 0 ? 'ph-lime' : n === 1 ? 'ph-sky' : ''
}

export default function PropertyCard({ listing: l, compact = false }: { listing: Listing; compact?: boolean }) {
  const { has, toggle } = useFavorites()
  const price = formatPrice(l)
  const fav = has(l.id)
  const video = hasVideo(l)
  const isBureau = l.categorie.startsWith('Bureau')
  const badge = isBureau ? 'badge-bureau' : l.isLocation ? 'badge-location' : 'badge-vente'
  const badgeLabel = isBureau ? 'Commerce' : l.transaction === 'Location' ? "À l'année" : l.transaction
  const highlight = l.features.find((f) => ['Piscine', 'Vue mer', 'Meublé', 'Balcon', 'Jardin', 'Neuf / sur plan', 'Parking', 'Terrasse'].includes(f))
  const surface = l.surface_habitable_m2 || l.surface_m2

  return (
    <article className={`pc card ${compact ? 'pc-compact' : ''}`}>
      <Link to={`/bien/${l.id}`} className="pc-media">
        <Photo src={l.photos[0]} alt={l.titre} tone={tone(l)} className="pc-photo" />
        <div className="pc-badges">
          <span className={`badge ${badge}`}>{badgeLabel}</span>
          {l.isNeuf && !l.isLocation && <span className="badge badge-neuf">Neuf</span>}
          {l.isMeuble && l.isLocation && <span className="badge badge-glass">Meublé</span>}
          {!l.isDisponible && <span className="badge badge-status">{l.disponibilite === 'loue' ? 'Loué' : 'Vendu'}</span>}
        </div>
        <span className="pc-count">
          <Camera size={14} /> {l.photos.length}{video ? ' · vidéo' : compact ? '' : ' photos'}
        </span>
        {video && !compact && (
          <span className="pc-video"><Play size={14} /> Vidéo</span>
        )}
      </Link>
      <button
        className={`pc-fav ${fav ? 'on' : ''}`}
        aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        onClick={() => toggle(l.id)}
      >
        <Heart size={16} filled={fav} />
      </button>
      <div className="pc-body">
        <div className="pc-kicker">{l.reference.toUpperCase()} · {l.kicker}</div>
        <h3 className="h-card pc-title"><Link to={`/bien/${l.id}`}>{l.titre}</Link></h3>
        <div className="pc-loc"><Pin size={15} /> {shortLocation(l)}</div>
        <div className="pc-price">
          {price.main}{price.suffix && <span> {price.suffix}</span>}
        </div>
        <div className="pc-meta">
          {isBureau ? (
            <span><User size={16} /> {l.sousType}</span>
          ) : l.chambres ? (
            <span><Bed size={16} /> {l.chambres} ch.</span>
          ) : l.categorie === 'Terrain' ? (
            <span><Land size={16} /> Terrain</span>
          ) : null}
          {surface ? <span><Area size={16} /> {surface} m²</span> : null}
          {l.categorie.includes('Villa') && l.surface_terrain_m2 && !compact ? (
            <span><Land size={16} /> {l.surface_terrain_m2} m² terrain</span>
          ) : highlight ? (
            <span>{FEATURE_ICON[highlight] ?? <Check size={16} />} {highlight}</span>
          ) : null}
        </div>
      </div>
    </article>
  )
}
