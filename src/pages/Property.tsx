import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import Photo from '../components/Photo'
import PropertyCard from '../components/PropertyCard'
import { MapMock } from '../components/Blocks'
import SatelliteMap from '../components/SatelliteMap'
import { EmbedFrame, VideoModal } from '../components/VideoPlayer'
import { ArrowRight, Camera, Check, ChevronLeft, ChevronRight, Clock, Heart, Instagram, Phone, Pin, Play, PlayFilled, Share, Sun, Tour, WhatsApp, X } from '../components/Icons'
import { byId, formatPrice, pricePerM2, similar, zoneOf, RUBRIQUE_LABEL } from '../lib/listings'
import { videosFor } from '../lib/videos'
import { tourEmbedSrc, visiteFor } from '../lib/visites'
import { proximiteFor } from '../lib/proximite'
import Proximity from '../components/Proximity'
import { agencyBySlug, waLink } from '../data/agences'
import { SOCIAL, type VideoItem } from '../data/videos'
import { useFavorites } from '../hooks/useFavorites'
import { sejourById } from '../lib/sejours'
import './Sejours.css'



export default function Property() {
  const { id = '' } = useParams()
  const l = byId(id)
  const { has, toggle } = useFavorites()
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [video, setVideo] = useState<VideoItem | null>(null)
  const [copied, setCopied] = useState(false)
  const [media, setMedia] = useState<'photos' | 'video' | 'visite'>('photos')
  const [vidIdx, setVidIdx] = useState(0)

  useEffect(() => { window.scrollTo({ top: 0 }); setMedia('photos'); setVidIdx(0) }, [id])
  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') setLightbox((i) => (i === null ? null : (i + 1) % l!.photos.length))
      if (e.key === 'ArrowLeft') setLightbox((i) => (i === null ? null : (i - 1 + l!.photos.length) % l!.photos.length))
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [lightbox, l])

  if (!l) return <Navigate to="/acheter" replace />

  const price = formatPrice(l)
  const perM2 = pricePerM2(l)
  const agency = agencyBySlug(l.agenceSlug)
  const vids = videosFor(l)
  const mainVideo = vids[0]
  const tour = visiteFor(l)
  const activeVideo = vids[vidIdx] ?? mainVideo
  const hasMediaTabs = Boolean(mainVideo || tour)
  const prox = proximiteFor(l)
  const fav = has(l.id)
  const sejour = sejourById(l.id)
  const zone = zoneOf(l)
  const rubrique = l.rubriques[0]
  const details: [string, string][] = Object.entries(l.autres_champs).filter(([k]) => !['Pays', 'Gouvernorat', 'Délégation'].includes(k))
  const waText = encodeURIComponent(`Bonjour, je suis intéressé(e) par le bien "${l.titre}" (${l.reference}). Pouvez-vous m'en dire plus ?`)

  const share = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: l.titre, url }) } catch { /* annulé */ }
    } else {
      await navigator.clipboard?.writeText(url)
      setCopied(true); setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <div className="container pp">
      <div className="small muted pp-crumb">
        <Link to="/">Accueil</Link> · <Link to={`/${rubrique}`}>{RUBRIQUE_LABEL[rubrique]}</Link> · {l.categorie}{zone && <> · <Link to={`/${rubrique}?zone=${zone.slug}`}>{l.localite}</Link></>}
      </div>

      <div className="row wrap" style={{ gap: 8 }}>
        <span className={`badge ${l.categorie.startsWith('Bureau') ? 'badge-bureau' : l.isLocation ? 'badge-location' : 'badge-vente'}`}>{l.transaction}</span>
        {l.features.includes('Titre foncier') && <span className="badge badge-soft">Titre foncier individuel</span>}
        {l.isMeuble && <span className="badge badge-soft">Meublé</span>}
        {!l.isDisponible && <span className="badge badge-status">{l.disponibilite === 'loue' ? 'Loué' : 'Vendu'}</span>}
        <span className="small" style={{ color: 'var(--muted-2)', letterSpacing: '.08em', fontWeight: 600 }}>{l.reference.toUpperCase()}</span>
      </div>

      <div className="pp-head">
        <div>
          <h1 className="pp-title">{l.titre}</h1>
          <div className="row muted mt-8" style={{ gap: 6 }}><Pin size={17} /> {l.adresse_complete.replace(', Tunisie', '')}</div>
        </div>
        <div className="pp-pricebox">
          <div className="pp-price">{price.main}{price.suffix && <span> {price.suffix}</span>}</div>
          {perM2 && <div className="small muted">{perM2}</div>}
        </div>
      </div>

      {/* ---------- Médias : photos / vidéo / visite virtuelle ---------- */}
      {hasMediaTabs && (
        <div className="pp-tabs" role="tablist" aria-label="Médias du bien">
          <button role="tab" aria-selected={media === 'photos'} className={media === 'photos' ? 'on' : ''} onClick={() => setMedia('photos')}>
            <Camera size={16} /> Photos <span>{l.photos.length}</span>
          </button>
          {mainVideo && (
            <button role="tab" aria-selected={media === 'video'} className={media === 'video' ? 'on' : ''} onClick={() => setMedia('video')}>
              <Play size={16} /> Vidéo{vids.length > 1 && <span>{vids.length}</span>}
            </button>
          )}
          {tour && (
            <button role="tab" aria-selected={media === 'visite'} className={media === 'visite' ? 'on' : ''} onClick={() => setMedia('visite')}>
              <Tour size={16} /> Visite virtuelle 360°
            </button>
          )}
        </div>
      )}

      {media === 'video' && activeVideo ? (
        <div className="pp-stage pp-stage-video">
          <div className="pp-reel"><EmbedFrame key={activeVideo.url} url={activeVideo.url} title={activeVideo.title} /></div>
          <div className="pp-reel-info">
            <span className="eyebrow">Visite vidéo</span>
            <strong>{activeVideo.title}</strong>
            {activeVideo.subtitle && <span className="small">{activeVideo.subtitle}</span>}
            {vids.length > 1 && (
              <div className="row wrap mt-16">
                {vids.map((v, i) => (
                  <button key={v.url} className={`chip chip-dark ${i === vidIdx ? 'on' : ''}`} onClick={() => setVidIdx(i)}><Play size={14} /> {v.title}</button>
                ))}
              </div>
            )}
            <a className="link small mt-16" href={activeVideo.url} target="_blank" rel="noreferrer">Ouvrir sur les réseaux <ArrowRight size={15} /></a>
          </div>
        </div>
      ) : media === 'visite' && tour ? (
        <div className="pp-stage">
          {/REMPLACER/i.test(tour) ? (
            <div className="vp-placeholder">
              <Tour size={28} />
              <p><strong>Visite virtuelle à renseigner</strong></p>
              <p className="small">Collez le lien de la visite dans <code>src/data/visites.ts</code>.</p>
            </div>
          ) : (
            <iframe
              className="pp-tour"
              src={tourEmbedSrc(tour)}
              title={`Visite virtuelle 360° — ${l.titre}`}
              allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer; autoplay"
              allowFullScreen
            />
          )}
        </div>
      ) : (
        <div className={`pp-gallery ${l.photos.length < 2 ? 'single' : ''}`}>
          <button className="pp-g-main" onClick={() => setLightbox(0)}>
            <Photo src={l.photos[0]} alt={l.titre} />
            <span className="pp-g-count"><Camera size={16} /> Voir les {l.photos.length} photos</span>
          </button>
          {l.photos.length >= 2 && (
            <button className="pp-g-side" onClick={() => setLightbox(1)}>
              <Photo src={l.photos[1]} alt="" tone="ph-lime" />
            </button>
          )}
          {mainVideo ? (
            <button className="pp-g-side pp-g-video" onClick={() => setMedia('video')}>
              <Photo src={l.photos[2]} alt="" tone="ph-dark"><span className="pp-g-shade" /></Photo>
              <span className="vc-play"><PlayFilled size={22} /></span>
              <span className="btn btn-gold btn-sm pp-g-cta"><Play size={15} /> Visite vidéo</span>
            </button>
          ) : tour ? (
            <button className="pp-g-side pp-g-video" onClick={() => setMedia('visite')}>
              <Photo src={l.photos[2] ?? l.photos[0]} alt="" tone="ph-dark"><span className="pp-g-shade" /></Photo>
              <span className="vc-play"><Tour size={24} /></span>
              <span className="btn btn-gold btn-sm pp-g-cta"><Tour size={15} /> Visite 360°</span>
            </button>
          ) : l.photos.length >= 3 ? (
            <button className="pp-g-side" onClick={() => setLightbox(2)}>
              <Photo src={l.photos[2]} alt="" tone="ph-sky" />
            </button>
          ) : null}
        </div>
      )}

      <div className="pp-layout">
        <div className="pp-main">
          {/* ---------- Chiffres clés ---------- */}
          <div className="card pp-kpis">
            {(l.surface_habitable_m2 || l.surface_m2) && <div><span className="label">Surface</span><strong>{l.surface_habitable_m2 || l.surface_m2} m²</strong></div>}
            {l.surface_terrain_m2 ? <div><span className="label">Terrain</span><strong>{l.surface_terrain_m2} m²</strong></div> : null}
            {l.chambres ? <div><span className="label">Chambres</span><strong>{l.chambres}</strong></div> : null}
            {l.suites ? <div><span className="label">Suites</span><strong>{l.suites}</strong></div> : null}
            {l.sdb ? <div><span className="label">Salles de bain</span><strong>{l.sdb}</strong></div> : null}
            {!l.chambres && !l.suites && <div><span className="label">Type</span><strong>{l.sousType}</strong></div>}
          </div>

          <section className="pp-block">
            <h2 className="pp-h2">Description</h2>
            {l.sections.map((sec, i) => (
              <div key={i} className="sv-sec">
                {sec.titre && <h3>{sec.titre}</h3>}
                {sec.texte.map((t) => <p key={t} className="pp-desc">{t}</p>)}
                {sec.liste.length > 0 && <ul>{sec.liste.map((t) => <li key={t}>{t}</li>)}</ul>}
              </div>
            ))}
            {sejour && (
              <Link to={`/sejour/${sejour.slug}`} className="sj-tb mt-24">
                <span className="sj-tb-ico"><Sun size={22} /></span>
                <span><strong>Aussi en location vacances.</strong> <span className="muted">Réservez {sejour.titre} à la nuit, dates et prix en ligne.</span></span>
                <ArrowRight size={18} />
              </Link>
            )}
          </section>

          {l.features.length > 0 && (
            <section className="pp-block">
              <h2 className="pp-h2">Ce que comprend le bien</h2>
              <ul className="pp-features">
                {l.features.map((f) => <li key={f}><Check size={17} /> {f}</li>)}
              </ul>
            </section>
          )}

          <section className="pp-block">
            <h2 className="pp-h2">Détail du bien</h2>
            <dl className="pp-details">
              {details.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
              <div><dt>Agence</dt><dd>{agency.name}</dd></div>
            </dl>
          </section>

          {mainVideo && (
            <section className="pp-block">
              <h2 className="pp-h2">La visite en vidéo</h2>
              <button className="vwide" onClick={() => setVideo(mainVideo)}>
                <Photo src={l.photos[3] ?? l.photos[0]} tone="ph-dark"><span className="pp-g-shade" /></Photo>
                <span className="vc-play"><PlayFilled size={22} /></span>
                <span className="vwide-text">
                  <span className="small"><Play size={13} /> Vidéo de la visite{mainVideo.views ? ` · ${mainVideo.views} vues` : ''}</span>
                  <strong>{mainVideo.title}</strong>
                </span>
              </button>
              {vids.length > 1 && (
                <div className="row wrap mt-16">
                  {vids.slice(1).map((v) => (
                    <button key={v.url} className="chip" onClick={() => setVideo(v)}><Play size={14} /> {v.title}</button>
                  ))}
                </div>
              )}
            </section>
          )}

          <Proximity prox={prox} centre={prox?.precise ? l.localite : l.delegation} />

          <section className="pp-block">
            <h2 className="pp-h2">Adresse</h2>
            {prox ? (
              <SatelliteMap lat={prox.lat} lng={prox.lng} seed={l.id} label={l.localite} height={340} />
            ) : (
              <MapMock single height={300} />
            )}
            <div className="row wrap mt-16 small">
              <span className="muted">{l.adresse_complete.split(', ').reverse().join(' · ')}</span>
              <a className="link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.adresse_complete)}`} target="_blank" rel="noreferrer">
                Ouvrir dans Google Maps <ArrowRight size={15} />
              </a>
            </div>
          </section>
        </div>

        {/* ---------- Sidebar ---------- */}
        <aside className="pp-side">
          <div className="card pp-contact">
            <div className="row" style={{ gap: 14 }}>
              <span className="pp-avatar">{agency.initials}</span>
              <div>
                <div style={{ fontWeight: 700 }}>{agency.name}</div>
                <div className="small muted">votre agence à Djerba</div>
              </div>
            </div>
            <div className="grid grid-2 mt-24" style={{ gap: 10 }}>
              <a className="btn btn-primary" href={`tel:${(l.telephones[0] ?? agency.phone).replace(/\s/g, '')}`}><Phone size={16} /> Appeler</a>
              <a className="btn btn-gold" href={`https://wa.me/${(l.telephones[0] ?? agency.whatsapp).replace(/\D/g, '')}?text=${waText}`} target="_blank" rel="noreferrer"><WhatsApp size={16} /> WhatsApp</a>
            </div>
            <form className="pp-form" onSubmit={(e) => {
              e.preventDefault()
              const f = new FormData(e.currentTarget)
              const text = `${f.get('message')}\n\n${f.get('nom')} — ${f.get('tel')}${f.get('email') ? ` — ${f.get('email')}` : ''}\n${window.location.href}`
              window.open(waLink(text, agency.whatsapp), '_blank', 'noopener')
            }}>
              <input className="input" name="nom" placeholder="Nom et prénom" required />
              <input className="input" name="tel" type="tel" placeholder="Téléphone" required />
              <input className="input" name="email" type="email" placeholder="E-mail" />
              <textarea className="input" name="message" defaultValue={`Bonjour, je souhaiterais plus d'informations sur ce bien : ${l.titre} (${l.reference}).`} />
              <button className="btn btn-primary btn-block"><WhatsApp size={16} /> Envoyer ma demande</button>
              <div className="row small muted" style={{ gap: 6 }}><Clock size={14} /> Votre message s'ouvre dans WhatsApp, prêt à envoyer</div>
            </form>
          </div>

          <div className="row" style={{ gap: 10 }}>
            <button className={`btn btn-outline ${fav ? 'pp-fav-on' : ''}`} style={{ flex: 1 }} onClick={() => toggle(l.id)}>
              <Heart size={16} filled={fav} /> {fav ? 'Dans mes favoris' : 'Ajouter aux favoris'}
            </button>
            <button className="btn btn-outline" onClick={share}><Share size={16} /> {copied ? 'Lien copié' : 'Partager'}</button>
          </div>

          <div className="card-dark pp-social">
            <div className="row" style={{ gap: 8, fontWeight: 700 }}><Instagram size={16} style={{ color: 'var(--sky)' }} /> Ce bien sur nos réseaux</div>
            <p className="small mt-8" style={{ color: '#aab6c8' }}>
              {mainVideo ? 'La visite du bien en vidéo, et nos autres biens sur Instagram.' : 'Retrouvez nos biens et nos villas en vidéo sur Instagram.'}
            </p>
            <div className="row mt-16">
              {mainVideo ? (
                <button className="btn btn-gold btn-sm" onClick={() => setVideo(mainVideo)}><Play size={15} /> Voir la vidéo</button>
              ) : (
                <a className="btn btn-gold btn-sm" href={SOCIAL.instagram.url} target="_blank" rel="noreferrer"><Instagram size={15} /> Instagram</a>
              )}
              <button className="btn btn-ghost-dark btn-sm" onClick={share}><Share size={15} /> Partager</button>
            </div>
          </div>
        </aside>
      </div>

      {/* ---------- Similaires ---------- */}
      {similar(l).length > 0 && (
      <section className="section-tight" style={{ paddingBottom: 0 }}>
        <div className="section-head">
          <h2 className="h-section" style={{ fontSize: 30 }}>{l.isLocation ? 'Autres locations à l’année' : 'Autres biens à vendre'}</h2>
          {zone && <Link to={`/${rubrique}?zone=${zone.slug}`} className="link">Voir les biens du secteur <ArrowRight size={16} /></Link>}
        </div>
        <div className="grid grid-4">
          {similar(l).map((s) => <PropertyCard key={s.id} listing={s} compact />)}
        </div>
      </section>
      )}

      {/* ---------- Lightbox ---------- */}
      {lightbox !== null && (
        <div className="lb" onClick={() => setLightbox(null)}>
          <button className="lb-close" aria-label="Fermer"><X size={22} /></button>
          <button className="lb-nav lb-prev" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + l.photos.length) % l.photos.length) }} aria-label="Précédente"><ChevronLeft size={26} /></button>
          <img src={l.photos[lightbox]} alt={`${l.titre} — photo ${lightbox + 1}`} onClick={(e) => e.stopPropagation()} />
          <button className="lb-nav lb-next" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % l.photos.length) }} aria-label="Suivante"><ChevronRight size={26} /></button>
          <div className="lb-count">{lightbox + 1} / {l.photos.length}</div>
        </div>
      )}
      {video && <VideoModal video={video} onClose={() => setVideo(null)} />}
    </div>
  )
}
