import { useEffect, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import Photo from '../components/Photo'
import SejourCard, { AmenityIcon } from '../components/SejourCard'
import { DatesField, GuestsField, RangeCalendar } from '../components/Booking'
import { EmbedFrame } from '../components/VideoPlayer'
import {
  ArrowRight, Calendar, Camera, Check, ChevronLeft, ChevronRight, Heart, Home, Mail, Pin, Pool, Share, Shield, Sun, Users, Wave, WhatsApp, X,
} from '../components/Icons'
import {
  SEJOURS, dt, guestsLabel, longDate, quote, saisonLabel, sejourBySlug, stayFromParams, stayQuery, MIN_NUITS, type Guests, type Quote, type Sejour,
} from '../lib/sejours'
import { byId } from '../lib/listings'
import { proximiteForLocalite } from '../lib/proximite'
import Proximity from '../components/Proximity'
import { AGENCY, CONTACT, waLink } from '../data/agences'
import { useFavorites } from '../hooks/useFavorites'
import './Sejours.css'

/* ---------- Demande de réservation ---------- */

interface Demande {
  nom: string
  tel: string
  email: string
  message: string
}

function requestText(s: Sejour, arrivee: string, depart: string, g: Guests, q: Quote, d: Demande, url: string) {
  const enfants = g.enfants ? `, ${g.enfants} enfant${g.enfants > 1 ? 's' : ''}` : ''
  const bebes = g.bebes ? `, ${g.bebes} bébé${g.bebes > 1 ? 's' : ''}` : ''
  const detail = q.lignes.map((l) => (l.prix === null ? `${l.nuits} nuit(s) en ${l.label} : tarif à confirmer` : `${dt(l.prix)} × ${l.nuits} nuit(s) (${l.label})`)).join(' + ')
  return [
    `Bonjour ${AGENCY.name},`,
    `Je souhaite réserver *${s.titre}*.`,
    '',
    `📅 Arrivée : ${longDate(arrivee)}`,
    `📅 Départ : ${longDate(depart)} (${q.nuits} nuits)`,
    `👥 Voyageurs : ${g.adultes} adulte${g.adultes > 1 ? 's' : ''}${enfants}${bebes}`,
    `💰 ${q.total !== null ? `Total estimé : ${dt(q.total)}` : 'Total : à confirmer'} — ${detail}`,
    '',
    `Nom : ${d.nom}`,
    `Téléphone : ${d.tel}`,
    d.email ? `E-mail : ${d.email}` : null,
    d.message ? `Message : ${d.message}` : null,
    '',
    url,
  ].filter((l) => l !== null).join('\n')
}

const DEMANDES_KEY = 'immosoleil:demandes'
function saveDemande(entry: object) {
  try {
    const prev = JSON.parse(localStorage.getItem(DEMANDES_KEY) ?? '[]') as object[]
    localStorage.setItem(DEMANDES_KEY, JSON.stringify([{ ...entry, date: new Date().toISOString() }, ...prev].slice(0, 20)))
  } catch { /* stockage indisponible */ }
}

function RequestModal({ s, arrivee, depart, guests, q, onClose }: {
  s: Sejour; arrivee: string; depart: string; guests: Guests; q: Quote; onClose: () => void
}) {
  const [d, setD] = useState<Demande>({ nom: '', tel: '', email: '', message: '' })
  const [text, setText] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const url = `${window.location.origin}/sejour/${s.slug}?arrivee=${arrivee}&depart=${depart}&adultes=${guests.adultes}&enfants=${guests.enfants}`
    const t = requestText(s, arrivee, depart, guests, q, d, url)
    saveDemande({ villa: s.titre, arrivee, depart, voyageurs: guests, total: q.total, nom: d.nom, tel: d.tel })
    setText(t)
    window.open(waLink(t), '_blank', 'noopener')
  }
  const field = (k: keyof Demande) => ({ value: d[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setD({ ...d, [k]: e.target.value }) })

  return (
    <div className="rq-back" onClick={onClose} role="dialog" aria-modal="true" aria-label="Demande de réservation">
      <div className="rq" onClick={(e) => e.stopPropagation()}>
        <div className="rq-head">
          <h2>{text ? 'Demande prête' : 'Demander à réserver'}</h2>
          <button onClick={onClose} aria-label="Fermer"><X size={18} /></button>
        </div>
        <div className="rq-body">
          <div className="rq-recap">
            <Photo src={s.photos[0]} alt="" />
            <div>
              <strong>{s.titre}</strong>
              <span className="muted">{longDate(arrivee)} → {longDate(depart)}</span>
              <span className="muted">{q.nuits} nuits · {guestsLabel(guests)}</span>
              <span><strong>{q.total !== null ? dt(q.total) : 'Total à confirmer'}</strong></span>
            </div>
          </div>
          {text ? (
            <div className="rq-done mt-8">
              <span className="rq-done-ico"><WhatsApp size={28} /></span>
              <h3 className="h-card">Plus qu'à envoyer le message WhatsApp</h3>
              <p className="muted small" style={{ maxWidth: 420 }}>
                WhatsApp s'est ouvert avec votre demande pré-remplie : appuyez sur « Envoyer ». L'agence vérifie la disponibilité et vous confirme la réservation, l'acompte et les modalités d'arrivée.
              </p>
              <a className="btn btn-gold btn-block mt-8" href={waLink(text)} target="_blank" rel="noreferrer"><WhatsApp size={17} /> Ouvrir WhatsApp</a>
              <a className="btn btn-outline btn-block" href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(`Demande de réservation — ${s.titre}`)}&body=${encodeURIComponent(text)}`}><Mail size={16} /> Envoyer plutôt par e-mail</a>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: 'contents' }}>
              <div className="grid grid-2" style={{ gap: 10 }}>
                <input className="input" placeholder="Nom et prénom" required autoComplete="name" {...field('nom')} />
                <input className="input" type="tel" placeholder="Téléphone (avec indicatif)" required autoComplete="tel" {...field('tel')} />
              </div>
              <input className="input" type="email" placeholder="E-mail (facultatif)" autoComplete="email" {...field('email')} />
              <textarea className="input" placeholder="Heure d'arrivée, questions, demandes particulières… (facultatif)" {...field('message')} />
              <button className="btn btn-gold btn-lg btn-block"><WhatsApp size={18} /> Envoyer ma demande sur WhatsApp</button>
              <p className="small muted" style={{ textAlign: 'center' }}>
                Aucun paiement en ligne. La réservation est confirmée par l'agence après vérification des disponibilités.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------- Page ---------- */

export default function SejourPage() {
  const { slug = '' } = useParams()
  const s = sejourBySlug(slug)
  const [sp, setSp] = useSearchParams()
  const stay = stayFromParams(sp)
  const { has, toggle } = useFavorites()
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [requesting, setRequesting] = useState(false)
  const [allAmen, setAllAmen] = useState(false)
  const [allDesc, setAllDesc] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => { window.scrollTo({ top: 0 }) }, [slug])
  useEffect(() => {
    if (lightbox === null || !s) return
    const n = s.photos.length
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') setLightbox((i) => (i === null ? null : (i + 1) % n))
      if (e.key === 'ArrowLeft') setLightbox((i) => (i === null ? null : (i - 1 + n) % n))
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [lightbox, s])

  if (!s) return <Navigate to="/locations-vacances" replace />

  const guests: Guests = { adultes: stay.adultes, enfants: stay.enfants, bebes: stay.bebes }
  const setStay = (patch: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(sp)
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === '') next.delete(k)
      else next.set(k, String(v))
    }
    setSp(next, { replace: true, preventScrollReset: true })
  }
  const setDates = (a?: string, d?: string) => setStay({ arrivee: a, depart: d })
  const q = stay.arrivee && stay.depart ? quote(s, stay.arrivee, stay.depart) : null
  const tooMany = s.voyageurs !== null && guests.adultes + guests.enfants > s.voyageurs
  const canRequest = Boolean(q?.ok) && !tooMany
  const fav = has(s.favKey)
  const annuelle = byId(s.id)
  const others = SEJOURS.filter((o) => o.slug !== s.slug).sort((a, b) => Math.abs((a.voyageurs ?? 0) - (s.voyageurs ?? 0)) - Math.abs((b.voyageurs ?? 0) - (s.voyageurs ?? 0))).slice(0, 4)
  const descSections = allDesc ? s.sections : s.sections.slice(0, 3)
  const atouts = allAmen ? s.atouts : s.atouts.slice(0, 10)
  const scrollToDates = () => document.getElementById('disponibilites')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  const share = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: s.titre, url }) } catch { /* annulé */ }
    } else {
      await navigator.clipboard?.writeText(url)
      setCopied(true); setTimeout(() => setCopied(false), 1800)
    }
  }
  const askText = `Bonjour, j'ai une question sur ${s.titre} (${window.location.origin}/sejour/${s.slug}).`
  const n = s.photos.length

  const priceHead = q && q.ok && q.total !== null
    ? <><strong>{dt(q.total)}</strong> pour {q.nuits} nuits</>
    : s.prixMin !== null ? <>à partir de <strong>{dt(s.prixMin)}</strong> / nuit</> : <strong>Tarif sur demande</strong>

  return (
    <div className="container sv">
      <div className="small muted lp-crumb">
        <Link to="/">Accueil</Link> · <Link to={`/locations-vacances${stayQuery(sp)}`}>Locations vacances</Link> · {s.titre}
      </div>

      <div className="sv-head">
        <div>
          <h1 className="sv-title">{s.titre}</h1>
          <div className="sv-sub">{s.sousTitre ?? `Villa de vacances à ${s.localite}`}</div>
        </div>
        <div className="sv-actions">
          <button className="btn btn-outline" onClick={share}><Share size={16} /> {copied ? 'Lien copié' : 'Partager'}</button>
          <button className={`btn btn-outline ${fav ? 'pp-fav-on' : ''}`} onClick={() => toggle(s.favKey)}><Heart size={16} filled={fav} /> {fav ? 'Enregistré' : 'Enregistrer'}</button>
        </div>
      </div>

      {/* ---------- Galerie ---------- */}
      <div className={`sv-gallery ${n === 1 ? 'n1' : n < 5 ? 'n2' : ''}`}>
        {s.photos.slice(0, n < 5 ? Math.min(n, 3) : 5).map((p, i) => (
          <button key={p} className={i === 0 ? 'sv-g-main' : ''} onClick={() => setLightbox(i)} aria-label={`Photo ${i + 1}`}>
            <Photo src={p} alt={i === 0 ? s.titre : ''} />
          </button>
        ))}
        {n > 1 && <button className="btn sv-all" onClick={() => setLightbox(0)}><Camera size={16} /> Afficher les {n} photos</button>}
      </div>

      <div className="sv-layout">
        <div>
          <div className="sv-intro">
            <h2>Villa entière · {s.lieu}</h2>
            <div className="sv-facts">
              {s.voyageurs && <span>{s.voyageurs} voyageurs</span>}
              {s.chambres && <span>· {s.chambres} chambre{s.chambres > 1 ? 's' : ''}{s.suites ? ` dont ${s.suites} suite${s.suites > 1 ? 's' : ''}` : ''}</span>}
              {s.piscine && <span>· piscine privée</span>}
            </div>
          </div>

          <div className="sv-highlights">
            {s.piscine && <div className="sv-hl"><Pool size={24} /><div><strong>Piscine privée{s.atouts.some((a) => /cascade/i.test(a)) ? ' avec cascade' : ''}</strong><span>Réservée aux occupants de la villa.</span></div></div>}
            {s.jacuzzi && <div className="sv-hl"><Wave size={24} /><div><strong>Jacuzzi</strong><span>Pour se détendre le soir, au calme.</span></div></div>}
            {s.atouts.some((a) => /vis-à-vis/i.test(a)) && <div className="sv-hl"><Shield size={24} /><div><strong>Sans vis-à-vis</strong><span>Intimité totale autour de la piscine et du jardin.</span></div></div>}
            {s.plage_km && <div className="sv-hl"><Sun size={24} /><div><strong>Plage à {s.plage_km} km</strong><span>Les plages de l'est de l'île en quelques minutes.</span></div></div>}
            <div className="sv-hl"><Calendar size={24} /><div><strong>Saison de location : {saisonLabel(s)}</strong><span>Arrivée et départ à convenir avec l'agence.</span></div></div>
          </div>

          <section className="pp-block">
            {s.accroche && <p className="pp-desc">{s.accroche}</p>}
            {descSections.map((sec, i) => (
              <div key={i} className="sv-sec">
                {sec.titre && <h3>{sec.titre}</h3>}
                {sec.texte.map((t) => <p key={t} className="pp-desc">{t}</p>)}
                {sec.liste.length > 0 && <ul>{sec.liste.map((t) => <li key={t}>{t}</li>)}</ul>}
              </div>
            ))}
            {s.sections.length > 3 && (
              <button className="sv-more" onClick={() => setAllDesc(!allDesc)}>{allDesc ? 'Réduire' : 'Lire la suite'}</button>
            )}
          </section>

          {s.atouts.length > 0 && (
            <section className="pp-block">
              <h2 className="pp-h2">Ce que propose la villa</h2>
              <ul className="sv-amen">
                {atouts.map((a) => <li key={a}><AmenityIcon label={a} size={22} /> {a}</li>)}
              </ul>
              {s.atouts.length > 10 && (
                <button className="btn btn-outline mt-24" onClick={() => setAllAmen(!allAmen)}>{allAmen ? 'Réduire' : `Afficher les ${s.atouts.length} équipements`}</button>
              )}
            </section>
          )}

          <section className="pp-block">
            <h2 className="pp-h2">Tarifs par nuit</h2>
            {s.tarifs.length ? (
              <table className="sv-rates">
                <tbody>
                  {s.tarifs.map((t) => <tr key={t.label}><td>{t.label}</td><td>{dt(t.prix)} / nuit</td></tr>)}
                </tbody>
              </table>
            ) : s.prix_nuit ? (
              <p className="pp-desc">{dt(s.prix_nuit)} / nuit, toute l'année (tarif à confirmer en haute saison).</p>
            ) : (
              <p className="pp-desc">Tarif communiqué sur demande selon vos dates.</p>
            )}
            <p className="small muted mt-16">Prix pour la villa entière. Séjour de {MIN_NUITS} nuits minimum.</p>
          </section>

          <section className="pp-block" id="disponibilites">
            <h2 className="pp-h2">
              {q?.ok ? `${q.nuits} nuits à ${s.titre}` : 'Disponibilités'}
            </h2>
            <p className="muted mb-16">{stay.arrivee && stay.depart ? `${longDate(stay.arrivee)} → ${longDate(stay.depart)}` : "Sélectionnez vos dates d'arrivée et de départ."}</p>
            <div className="sv-cal">
              <RangeCalendar
                sejour={s}
                start={stay.arrivee}
                end={stay.depart}
                onChange={setDates}
                prices
                months={typeof window !== 'undefined' && window.innerWidth < 720 ? 1 : 2}
              />
            </div>
          </section>

          {s.videos.length > 0 && (
            <section className="pp-block">
              <h2 className="pp-h2">La villa en vidéo</h2>
              <div className="sv-video"><EmbedFrame url={s.videos[0]} title={s.titre} /></div>
            </section>
          )}

          <Proximity prox={proximiteForLocalite(s.localite)} centre={s.localite.split(' – ')[0]} />

          <section className="pp-block">
            <h2 className="pp-h2">Où se situe la villa</h2>
            <iframe
              className="sv-map"
              title="Carte de Djerba"
              loading="lazy"
              src="https://www.openstreetmap.org/export/embed.html?bbox=10.70%2C33.62%2C11.12%2C33.95&layer=mapnik"
            />
            <div className="row wrap mt-16" style={{ gap: 12 }}>
              <span className="row" style={{ gap: 6 }}><Pin size={16} /> {s.lieu}</span>
              <span className="small muted">L'adresse exacte vous est communiquée à la confirmation de la réservation.</span>
            </div>
          </section>

          {annuelle && (
            <Link to={`/bien/${annuelle.id}`} className="sj-tb mt-32">
              <span className="sj-tb-ico"><Home size={22} /></span>
              <span><strong>Aussi disponible à l'année.</strong> <span className="muted">{s.titre} se loue également au mois : voir l'annonce.</span></span>
              <ArrowRight size={18} />
            </Link>
          )}
        </div>

        {/* ---------- Carte de réservation ---------- */}
        <aside id="reserver">
          <div className="card bkc">
            <div className="bkc-price">{priceHead}</div>
            <div className="bkc-box">
              <DatesField sejour={s} start={stay.arrivee} end={stay.depart} onChange={setDates} />
              <GuestsField value={guests} max={s.voyageurs ?? 12} onChange={(g) => setStay({ adultes: g.adultes, enfants: g.enfants || undefined, bebes: g.bebes || undefined })} />
            </div>
            {tooMany && <p className="bkc-err">Cette villa accueille {s.voyageurs} voyageurs au maximum.</p>}
            {q && !q.ok && <p className="bkc-err">{q.erreur}</p>}
            {canRequest ? (
              <button className="btn btn-gold btn-lg btn-block bkc-cta" onClick={() => setRequesting(true)}>Demander à réserver</button>
            ) : (
              <button className="btn btn-primary btn-lg btn-block bkc-cta" onClick={scrollToDates}>{q ? 'Modifier les dates' : 'Vérifier la disponibilité'}</button>
            )}
            {q?.ok && (
              <>
                <p className="small muted bkc-note">Aucun paiement en ligne : l'agence confirme avant toute réservation.</p>
                <div className="bkc-lines">
                  {q.lignes.map((l, i) => (
                    <div key={i}>
                      <span>{l.prix !== null ? `${dt(l.prix)} × ${l.nuits} nuit${l.nuits > 1 ? 's' : ''}` : `${l.nuits} nuit${l.nuits > 1 ? 's' : ''} (${l.label})`}</span>
                      <span>{l.prix !== null ? dt(l.prix * l.nuits) : 'sur demande'}</span>
                    </div>
                  ))}
                  <div className="bkc-total"><span>Total</span><span>{q.total !== null ? dt(q.total) : 'à confirmer'}</span></div>
                </div>
              </>
            )}
            <div className="bkc-help small">
              <span className="muted">Une question sur la villa ?</span>
              <a className="link" href={waLink(askText)} target="_blank" rel="noreferrer"><WhatsApp size={15} /> WhatsApp</a>
            </div>
          </div>
          <div className="row small muted mt-16" style={{ gap: 8, justifyContent: 'center' }}>
            <Check size={15} /> Villa sélectionnée et suivie par {AGENCY.name}
          </div>
        </aside>
      </div>

      {/* ---------- Autres villas ---------- */}
      <section className="section-tight" style={{ paddingBottom: 0 }}>
        <div className="section-head">
          <h2 className="h-section" style={{ fontSize: 30 }}>D'autres villas à Djerba</h2>
          <Link to={`/locations-vacances${stayQuery(sp)}`} className="link">Toutes les villas <ArrowRight size={16} /></Link>
        </div>
        <div className="sj-grid">
          {others.map((o) => <SejourCard key={o.slug} sejour={o} arrivee={stay.arrivee} depart={stay.depart} query={stayQuery(sp)} />)}
        </div>
      </section>

      {/* ---------- Barre mobile ---------- */}
      <div className="sv-mbar">
        <div className="small">
          <div>{priceHead}</div>
          <div className="muted"><Users size={13} /> {guestsLabel(guests)}</div>
        </div>
        {canRequest ? (
          <button className="btn btn-gold" onClick={() => setRequesting(true)}>Réserver</button>
        ) : (
          <button className="btn btn-primary" onClick={scrollToDates}>Choisir les dates</button>
        )}
      </div>

      {lightbox !== null && (
        <div className="lb" onClick={() => setLightbox(null)}>
          <button className="lb-close" aria-label="Fermer"><X size={22} /></button>
          <button className="lb-nav lb-prev" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + n) % n) }} aria-label="Précédente"><ChevronLeft size={26} /></button>
          <img src={s.photos[lightbox]} alt={`${s.titre} — photo ${lightbox + 1}`} onClick={(e) => e.stopPropagation()} />
          <button className="lb-nav lb-next" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % n) }} aria-label="Suivante"><ChevronRight size={26} /></button>
          <div className="lb-count">{lightbox + 1} / {n}</div>
        </div>
      )}
      {requesting && q && stay.arrivee && stay.depart && (
        <RequestModal s={s} arrivee={stay.arrivee} depart={stay.depart} guests={guests} q={q} onClose={() => setRequesting(false)} />
      )}
    </div>
  )
}
