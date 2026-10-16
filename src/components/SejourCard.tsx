import { useState } from 'react'
import { Link } from 'react-router-dom'
import Photo from './Photo'
import { Bed, Car, Check, ChevronLeft, ChevronRight, Flame, Heart, Kitchen, Pin, Pool, Snow, Sun, Tv, Users, Wave, Wifi } from './Icons'
import { dt, quote, type Sejour } from '../lib/sejours'
import { useFavorites } from '../hooks/useFavorites'
import './SejourCard.css'

/** Icône d'un équipement d'après son libellé */
export function AmenityIcon({ label, size = 18 }: { label: string; size?: number }) {
  const l = label.toLowerCase()
  if (/piscine|cascade/.test(l)) return <Pool size={size} />
  if (/jacuzzi|plage|\bmer\b/.test(l)) return <Wave size={size} />
  if (/wi-?fi|internet/.test(l)) return <Wifi size={size} />
  if (/clim/.test(l)) return <Snow size={size} />
  if (/parking|garage|voiture/.test(l)) return <Car size={size} />
  if (/barbecue/.test(l)) return <Flame size={size} />
  if (/cuisine|four|vaisselle|réfrigérateur|repas/.test(l)) return <Kitchen size={size} />
  if (/tv|télévision/.test(l)) return <Tv size={size} />
  if (/transat|terrasse|pergola|jardin|extérieur|détente|soleil/.test(l)) return <Sun size={size} />
  if (/lit|linge|serviette|chambre|suite/.test(l)) return <Bed size={size} />
  return <Check size={size} />
}

export default function SejourCard({ sejour: s, arrivee, depart, query = '', unavailable = false }: {
  sejour: Sejour
  arrivee?: string
  depart?: string
  query?: string
  unavailable?: boolean
}) {
  const { has, toggle } = useFavorites()
  const [i, setI] = useState(0)
  const photos = s.photos.slice(0, 6)
  const fav = has(s.favKey)
  const q = arrivee && depart ? quote(s, arrivee, depart) : null
  const href = `/sejour/${s.slug}${query}`
  const go = (d: number) => (e: React.MouseEvent) => { e.preventDefault(); setI((x) => (x + d + photos.length) % photos.length) }

  return (
    <article className={`sc ${unavailable ? 'sc-off' : ''}`}>
      <Link to={href} className="sc-media" aria-label={s.titre}>
        <div className="sc-track" style={{ transform: `translateX(-${i * 100}%)` }}>
          {photos.map((p, k) => <Photo key={p} src={p} alt={k === 0 ? s.titre : ''} className="sc-photo" />)}
        </div>
        {photos.length > 1 && (
          <>
            <button className="sc-nav sc-prev" onClick={go(-1)} aria-label="Photo précédente"><ChevronLeft size={16} /></button>
            <button className="sc-nav sc-next" onClick={go(1)} aria-label="Photo suivante"><ChevronRight size={16} /></button>
            <span className="sc-dots">{photos.map((_, k) => <i key={k} className={k === i ? 'on' : ''} />)}</span>
          </>
        )}
        <span className="sc-tags">
          {s.piscine && <span><Pool size={13} /> Piscine privée</span>}
          {s.jacuzzi && <span>Jacuzzi</span>}
          {unavailable && <span className="sc-tag-off">Indisponible à ces dates</span>}
        </span>
      </Link>
      <button className={`sc-fav ${fav ? 'on' : ''}`} onClick={() => toggle(s.favKey)} aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
        <Heart size={18} filled={fav} />
      </button>
      <Link to={href} className="sc-body">
        <div className="row between" style={{ alignItems: 'flex-start' }}>
          <h3 className="sc-title">{s.titre}</h3>
          {s.voyageurs && <span className="sc-cap"><Users size={14} /> {s.voyageurs}</span>}
        </div>
        <div className="sc-line"><Pin size={14} /> {s.lieu}</div>
        <div className="sc-line">
          {[s.chambres && `${s.chambres} chambre${s.chambres > 1 ? 's' : ''}`, s.voyageurs && `${s.voyageurs} voyageurs`, s.plage_km && `plage à ${s.plage_km} km`].filter(Boolean).join(' · ')}
        </div>
        <div className="sc-price">
          {q && q.total !== null && q.ok ? (
            <><strong>{dt(q.total)}</strong> <span>au total · {q.nuits} nuits</span></>
          ) : s.prixMin !== null ? (
            <><span>à partir de</span> <strong>{dt(s.prixMin)}</strong> <span>/ nuit</span></>
          ) : (
            <strong>Tarif sur demande</strong>
          )}
        </div>
      </Link>
    </article>
  )
}
