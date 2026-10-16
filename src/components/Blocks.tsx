import { Link } from 'react-router-dom'
import { ArrowRight, Home, Instagram, Mail, Phone, WhatsApp } from './Icons'
import { SOCIAL } from '../data/videos'
import { AGENCY, CONTACT, waLink, type Agency } from '../data/agences'
import { LISTINGS } from '../lib/listings'
import { SEJOURS } from '../lib/sejours'
import './Blocks.css'

/* ---------- Agence ---------- */
export function AgencyCard({ agency }: { agency: Agency }) {
  return (
    <div className="card ac">
      <h3 className="ac-name">{agency.name}</h3>
      <div className="ac-line"><Home size={17} /> {SEJOURS.length} villas de vacances · {LISTINGS.length} annonces</div>
      <div className="ac-line"><Phone size={17} /> {agency.phone}</div>
      <div className="ac-line"><Mail size={17} /> {CONTACT.email}</div>
      <div className="ac-line small muted" style={{ paddingLeft: 27 }}>{agency.address} · {agency.hours}</div>
      <div className="row ac-actions">
        <a className="btn btn-outline" href={`tel:${agency.phone.replace(/\s/g, '')}`}><Phone size={16} /> Appeler</a>
        <a className="btn btn-gold" href={waLink('Bonjour Immo Soleil Djerba,', agency.whatsapp)} target="_blank" rel="noreferrer"><WhatsApp size={16} /> WhatsApp</a>
      </div>
    </div>
  )
}

export function AgenciesSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="agency-band reveal">
          <div>
            <div className="eyebrow">Nous contacter</div>
            <h2 className="h-section">Une équipe sur l'île, à votre écoute</h2>
            <p className="lead mt-16">
              Une question sur une villa, une visite à organiser, un bien à vendre ou à mettre en location : écrivez-nous sur WhatsApp ou appelez-nous.
            </p>
            <div className="row wrap mt-24">
              <a href={SOCIAL.instagram.url} target="_blank" rel="noreferrer" className="btn btn-outline"><Instagram size={16} /> {SOCIAL.instagram.handle}</a>
              <Link to="/contact" className="link">Tous nos contacts <ArrowRight size={16} /></Link>
            </div>
          </div>
          <AgencyCard agency={AGENCY} />
        </div>
      </div>
    </section>
  )
}

/* ---------- Bandeau CTA dégradé ---------- */
export function CtaBanner({ title, text }: { title: string; text: string }) {
  return (
    <div className="cta">
      <div>
        <h2 className="cta-title">{title}</h2>
        <p className="cta-text">{text}</p>
      </div>
      <div className="row wrap">
        <Link to="/deposer" className="btn btn-gold btn-lg">Confier mon bien</Link>
        <a href={`tel:${AGENCY.phone.replace(/\s/g, '')}`} className="btn btn-outline-white btn-lg">Nous appeler</a>
      </div>
    </div>
  )
}

/* ---------- Pagination ---------- */
export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null
  const items: number[] = []
  for (let p = Math.max(1, page - 2); p <= Math.min(pages, page + 2); p++) items.push(p)
  return (
    <nav className="pg" aria-label="Pagination">
      <button className="pg-btn" disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Précédent">‹</button>
      {items[0] > 1 && <><button className="pg-btn" onClick={() => onChange(1)}>1</button><span className="pg-dots">…</span></>}
      {items.map((p) => (
        <button key={p} className={`pg-btn ${p === page ? 'on' : ''}`} onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}>{p}</button>
      ))}
      {items[items.length - 1] < pages && <><span className="pg-dots">…</span><button className="pg-btn" onClick={() => onChange(pages)}>{pages}</button></>}
      <button className="pg-btn" disabled={page === pages} onClick={() => onChange(page + 1)} aria-label="Suivant">›</button>
    </nav>
  )
}

/* ---------- Carte décorative (pas de coordonnées dans les données) ---------- */
export function MapMock({ pins = [], height = 520, single = false }: { pins?: string[]; height?: number; single?: boolean }) {
  const spots = [
    [18, 22], [45, 38], [72, 50], [20, 60], [58, 78], [40, 90],
  ]
  return (
    <div className="mm" style={{ height }}>
      <div className="mm-blob" />
      {single ? (
        <span className="mm-pin-single" />
      ) : (
        pins.slice(0, 6).map((p, i) => (
          <span key={i} className={`mm-pin ${i === 0 ? 'gold' : ''}`} style={{ left: `${spots[i][0]}%`, top: `${spots[i][1]}%` }}>{p}</span>
        ))
      )}
    </div>
  )
}
