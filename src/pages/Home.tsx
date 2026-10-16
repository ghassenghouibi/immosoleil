import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import PropertyCard from '../components/PropertyCard'
import SejourCard from '../components/SejourCard'
import Photo from '../components/Photo'
import { AgenciesSection } from '../components/Blocks'
import { ArrowRight, Briefcase, Calendar, Camera, Check, Instagram, Pin, Pool, Users, WhatsApp } from '../components/Icons'
import { LISTINGS } from '../lib/listings'
import { SEJOURS, dt, sejourBySlug } from '../lib/sejours'
import { SOCIAL } from '../data/videos'
import { CONTACT } from '../data/agences'
import { useCountUp, useRevealAll } from '../hooks/useReveal'
import plage from '../assets/djerba/plage.jpg'
import plage3 from '../assets/djerba/plage-3.jpg'
import houch from '../assets/djerba/houch.jpg'
import flamants from '../assets/djerba/flamants.jpg'
import port from '../assets/djerba/port.jpg'
import houmtSouk from '../assets/djerba/houmt-souk.jpg'
import poterie from '../assets/djerba/poterie.jpg'
import houchCour from '../assets/djerba/houch-cour.jpg'
import './Home.css'

/** Diaporama du hero : photos de Djerba (Wikimedia Commons, voir /credits-photos) — effet Ken Burns + fondu. */
const SLIDES = [
  { src: plage, caption: 'Les plages de sable fin de Djerba' },
  { src: houch, caption: "Le houch, l'architecture blanche de l'île" },
  { src: plage3, caption: 'Une mer turquoise, de mai à octobre' },
  { src: flamants, caption: 'Flamants roses dans les lagunes de Guellala' },
]
const SLIDE_MS = 6500

const MARQUEE = ['Midoun', 'Houmt Souk', 'Tezdaine', 'Aghir', 'Guellala', 'Erriadh', 'La Lagune', 'Sidi Mahrez', 'Mezraya', 'Beni Maaguel']

const ILE = [
  { photo: houmtSouk, titre: 'Houmt Souk', texte: 'La capitale de l’île, ses souks et son port de pêche.' },
  { photo: poterie, titre: 'Guellala', texte: 'Le village des potiers, au sud de l’île.' },
  { photo: houchCour, titre: 'Le houch', texte: 'La maison djerbienne traditionnelle, blanche et fraîche.' },
  { photo: port, titre: 'La mer', texte: 'Sorties en bateau, plages et lagunes tout autour de l’île.' },
]

function Stat({ value, label }: { value: number; label: string }) {
  const { ref, n } = useCountUp(value)
  return (
    <div>
      <strong ref={ref as React.RefObject<HTMLElement>}>{n.toLocaleString('fr-FR')}</strong>
      <span>{label}</span>
    </div>
  )
}

const FEATURED_SLUG = 'villa-ilef'

export default function Home() {
  const [slide, setSlide] = useState(0)
  const page = useRevealAll<HTMLDivElement>()
  const hero = sejourBySlug(FEATURED_SLUG) ?? SEJOURS[0]

  useEffect(() => {
    const t = setInterval(() => setSlide((i) => (i + 1) % SLIDES.length), SLIDE_MS)
    return () => clearInterval(t)
  }, [])

  const sejours = [...SEJOURS].sort((a, b) => Number(b.prixMin !== null) - Number(a.prixMin !== null) || b.photos.length - a.photos.length).slice(0, 8)
  const ventes = LISTINGS.filter((l) => !l.isLocation && l.isDisponible && l.photos.length >= 4).sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 4)
  const annuelles = LISTINGS.filter((l) => l.isLocation && l.isDisponible)
  const nbVentes = LISTINGS.filter((l) => !l.isLocation).length
  const nbPiscines = SEJOURS.filter((s) => s.piscine).length

  return (
    <div ref={page}>
      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          {SLIDES.map((sl, i) => (
            <div key={sl.src} className={`hero-slide${i === slide ? ' on' : ''}`} style={{ backgroundImage: `url(${sl.src})` }} />
          ))}
          <div className="hero-veil" />
          <div className="hero-grain" />
        </div>

        <div className="container hero-inner">
          <div className="hero-copy">
            <div className="eyebrow hero-anim">Locations vacances · Vente · Team building</div>
            <h1 className="h-display">
              <span className="hero-line hero-anim">Vos vacances</span>
              <span className="hero-line hero-anim">au <em>soleil</em></span>
              <span className="hero-line hero-anim">de <em>Djerba</em>.</span>
            </h1>
            <p className="lead hero-lead hero-anim">
              Villas avec piscine privée à réserver en ligne, maisons à vendre et séjours d'entreprise : une agence installée sur l'île, qui connaît chaque maison.
            </p>
            <div className="row wrap hero-actions hero-anim">
              <Link to="/locations-vacances" className="btn btn-gold btn-lg">Réserver une villa <ArrowRight size={18} /></Link>
              <Link to="/team-building" className="btn btn-outline-white btn-lg">Team building</Link>
            </div>
            <div className="row hero-social hero-anim">
              <span className="small" style={{ color: '#c8d2d9' }}>Suivez-nous</span>
              <a href={SOCIAL.instagram.url} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={17} /></a>
              <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp"><WhatsApp size={17} /></a>
            </div>
          </div>

          <Link to={`/sejour/${hero.slug}`} className="hero-feature hide-mobile hero-anim">
            <Photo src={hero.photos[0]} alt={hero.titre} tone="ph-dark" className="hero-feature-media">
              <span className="hero-photos"><Camera size={13} /> {hero.photos.length} photos</span>
              {hero.piscine && <span className="hero-media-tags"><span><Pool size={12} /> Piscine privée</span></span>}
            </Photo>
            <div className="hero-feature-body">
              <div className="row" style={{ gap: 8 }}>
                <span className="badge badge-location">Coup de cœur</span>
                <span className="small" style={{ color: 'var(--muted-2)', letterSpacing: '.1em', fontWeight: 600 }}>LOCATION VACANCES</span>
              </div>
              <div className="h-card mt-8">{hero.titre}</div>
              <div className="row small muted mt-8" style={{ gap: 6 }}><Pin size={14} /> {hero.lieu} · <Users size={14} /> {hero.voyageurs} voyageurs</div>
              {hero.prixMin !== null && (
                <div className="row between mt-8">
                  <span className="hero-price"><span className="small muted" style={{ fontWeight: 400 }}>dès </span>{dt(hero.prixMin)}</span>
                  <span className="small muted">/ nuit</span>
                </div>
              )}
              <span className="hero-feature-cta">Voir les disponibilités <ArrowRight size={15} /></span>
            </div>
          </Link>
        </div>

        <div className="container hero-bottom hero-anim">
          <div className="hero-dots" role="tablist" aria-label="Diaporama">
            {SLIDES.map((sl, i) => (
              <button key={sl.src} className={i === slide ? 'on' : ''} onClick={() => setSlide(i)} aria-label={sl.caption} role="tab" aria-selected={i === slide} />
            ))}
            <span className="hero-caption">{SLIDES[slide].caption}</span>
          </div>
          <a href="#recherche" className="hero-scroll" aria-label="Défiler"><span /></a>
        </div>

        <div className="container hero-search" id="recherche">
          <SearchBar />
        </div>
      </section>

      {/* ---------- STATS ---------- */}
      <section className="container stats-wrap">
        <div className="stats card reveal">
          <Stat value={SEJOURS.length} label="villas à louer pour les vacances" />
          <Stat value={nbPiscines} label="avec piscine privée" />
          <Stat value={nbVentes} label="biens à vendre sur l'île" />
          <Stat value={annuelles.length} label="locations à l'année" />
        </div>
      </section>

      {/* ---------- BANDEAU DÉFILANT ---------- */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((z, i) => <span key={i}>{z}<i /></span>)}
        </div>
      </div>

      {/* ---------- LOCATIONS VACANCES ---------- */}
      <section className="section-tight">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Location vacances</div>
              <h2 className="h-section">Nos villas pour l'été</h2>
            </div>
            <Link to="/locations-vacances" className="link">Voir les {SEJOURS.length} villas <ArrowRight size={16} /></Link>
          </div>
          <div className="home-sejours reveal reveal-stagger">
            {sejours.map((s) => <SejourCard key={s.slug} sejour={s} />)}
          </div>
        </div>
      </section>

      {/* ---------- RÉSERVER EN 3 ÉTAPES ---------- */}
      <section className="section" style={{ background: '#fff', borderBlock: '1px solid var(--line)' }}>
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Réserver</div>
              <h2 className="h-section">Simple comme une conversation</h2>
            </div>
            <p className="muted" style={{ maxWidth: 420 }}>Pas de plateforme intermédiaire : vous réservez directement auprès de l'agence qui gère la villa.</p>
          </div>
          <div className="steps reveal reveal-stagger">
            <div><span className="steps-ico"><Calendar size={22} /></span><strong>1. Choisissez vos dates</strong><p>Le calendrier montre les nuits libres et le prix exact de votre séjour, saison par saison.</p></div>
            <div><span className="steps-ico"><WhatsApp size={22} /></span><strong>2. Envoyez votre demande</strong><p>Elle arrive directement sur le WhatsApp de l'agence, avec vos dates et le nombre de voyageurs.</p></div>
            <div><span className="steps-ico"><Check size={22} /></span><strong>3. On confirme</strong><p>Nous vérifions la disponibilité, vous confirmons la réservation et convenons de l'acompte.</p></div>
          </div>
        </div>
      </section>

      {/* ---------- TEAM BUILDING ---------- */}
      <section className="section section-dark tb-band">
        <div className="tb-band-bg" style={{ backgroundImage: `url(${port})` }} aria-hidden="true" />
        <div className="container">
          <div className="reveal" style={{ maxWidth: 640 }}>
            <div className="eyebrow">Team building & séminaires</div>
            <h2 className="h-section">Votre équipe à Djerba,<br />on s'occupe de tout.</h2>
            <p className="lead mt-16">
              Villas avec piscine privatisées, sortie en mer, rallye dans la médina de Houmt Souk, soirée djerbienne : un programme sur mesure et un devis en quelques jours.
            </p>
            <div className="row wrap mt-32">
              <Link to="/team-building" className="btn btn-gold btn-lg"><Briefcase size={18} /> Découvrir les formules</Link>
              <Link to="/team-building#devis" className="btn btn-ghost-dark btn-lg">Demander un devis</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- À VENDRE ---------- */}
      {ventes.length > 0 && (
        <section className="section-tight">
          <div className="container">
            <div className="section-head reveal">
              <div>
                <div className="eyebrow">Acheter à Djerba</div>
                <h2 className="h-section">Villas et terrains à vendre</h2>
              </div>
              <Link to="/acheter" className="link">Voir les {nbVentes} biens <ArrowRight size={16} /></Link>
            </div>
            <div className="grid grid-4 reveal reveal-stagger">
              {ventes.map((l) => <PropertyCard key={l.id} listing={l} />)}
            </div>
            {annuelles.length > 0 && (
              <Link to="/louer" className="link mt-24 reveal" style={{ display: 'inline-flex' }}>
                Et {annuelles.length} villas meublées à louer à l'année <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ---------- L'ÎLE ---------- */}
      <section className="section" style={{ background: '#fff', borderTop: '1px solid var(--line)' }}>
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">L'île</div>
              <h2 className="h-section">Djerba, l'île des rêves</h2>
            </div>
            <p className="muted" style={{ maxWidth: 420 }}>Plages, médina, villages de potiers et lagunes : tout est à moins de 30 minutes de nos villas.</p>
          </div>
          <div className="ile reveal reveal-stagger">
            {ILE.map((z) => (
              <div key={z.titre} className="zc">
                <Photo src={z.photo} alt={z.titre} className="zc-media">
                  <span className="zc-shade" />
                  <span className="zc-text">
                    <span className="zc-name">{z.titre}</span>
                    <span className="zc-count">{z.texte}</span>
                  </span>
                </Photo>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AgenciesSection />
    </div>
  )
}
