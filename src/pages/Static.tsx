import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AgencyCard, CtaBanner } from '../components/Blocks'
import { Briefcase, Camera, Check, Clock, Home, Instagram, Mail, Phone, Play, Sparkle, Sun, WhatsApp } from '../components/Icons'
import { AGENCY, CONTACT, waLink } from '../data/agences'
import { SOCIAL } from '../data/videos'
import { CREDITS } from '../data/credits'
import './Static.css'

function useTop() { useEffect(() => { window.scrollTo({ top: 0 }) }, []) }

/* ---------- Contact ---------- */
export function Contact() {
  useTop()
  const [sent, setSent] = useState<string | null>(null)
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const text = [
      'Bonjour Immo Soleil Djerba,',
      `Objet : ${f.get('objet')}`,
      '',
      String(f.get('message')),
      '',
      `${f.get('nom')} — ${f.get('tel')}${f.get('email') ? ` — ${f.get('email')}` : ''}`,
    ].join('\n')
    setSent(text)
    window.open(waLink(text), '_blank', 'noopener')
  }
  return (
    <section className="section">
      <div className="container st-two">
        <div>
          <div className="eyebrow">Contact</div>
          <h1 className="h-section">Parlons de votre projet</h1>
          <p className="lead mt-16">Réservation d'une villa, team building, achat, location à l'année ou mise en gestion de votre bien : écrivez-nous par WhatsApp ou e-mail, ou appelez-nous.</p>
          <ul className="st-contacts mt-32">
            <li><Phone size={18} /><a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}>{CONTACT.phone}</a></li>
            <li><WhatsApp size={18} /><a href={waLink('Bonjour Immo Soleil Djerba,')} target="_blank" rel="noreferrer">WhatsApp {CONTACT.phone}</a></li>
            <li><Mail size={18} /><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
            <li><Instagram size={18} /><a href={SOCIAL.instagram.url} target="_blank" rel="noreferrer">{SOCIAL.instagram.handle}</a></li>
          </ul>
          <div className="row small muted mt-24" style={{ gap: 8 }}><Clock size={15} /> Visites sur rendez-vous</div>
          <div className="mt-32"><AgencyCard agency={AGENCY} /></div>
        </div>
        <form className="card st-form" onSubmit={submit}>
          {sent ? (
            <div className="st-sent">
              <WhatsApp size={28} />
              <h3 className="h-card">Message prêt</h3>
              <p className="muted">WhatsApp s'est ouvert avec votre message : il ne reste qu'à l'envoyer.</p>
              <a className="btn btn-gold mt-16" href={waLink(sent)} target="_blank" rel="noreferrer"><WhatsApp size={16} /> Ouvrir WhatsApp</a>
              <a className="link small mt-8" href={`mailto:${CONTACT.email}?subject=${encodeURIComponent('Contact depuis le site')}&body=${encodeURIComponent(sent)}`}>Envoyer plutôt par e-mail</a>
            </div>
          ) : (
            <>
              <h3 className="h-card">Envoyer un message</h3>
              <div className="grid grid-2" style={{ gap: 10 }}>
                <input className="input" name="nom" placeholder="Nom et prénom" required autoComplete="name" />
                <input className="input" name="tel" type="tel" placeholder="Téléphone" required autoComplete="tel" />
              </div>
              <input className="input" name="email" type="email" placeholder="E-mail" autoComplete="email" />
              <select className="input select" name="objet" defaultValue="Location vacances">
                <option>Location vacances</option>
                <option>Team building / séminaire</option>
                <option>Je cherche à acheter</option>
                <option>Je cherche à louer à l'année</option>
                <option>Je veux vendre ou louer mon bien</option>
                <option>Autre</option>
              </select>
              <textarea className="input" name="message" placeholder="Votre message" required />
              <button className="btn btn-gold btn-block btn-lg"><WhatsApp size={18} /> Envoyer sur WhatsApp</button>
            </>
          )}
        </form>
      </div>
    </section>
  )
}

/* ---------- Confier mon bien (vente, location à l'année, location vacances) ---------- */
export function Deposer() {
  useTop()
  const [sent, setSent] = useState<string | null>(null)
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const text = [
      'Bonjour Immo Soleil Djerba,',
      `Je souhaite vous confier mon bien : ${f.get('projet')}.`,
      '',
      `🏡 ${f.get('type')} — ${f.get('adresse')}`,
      f.get('surface') && `📐 ${f.get('surface')} m²`,
      f.get('chambres') && `🛏️ ${f.get('chambres')} chambres`,
      f.get('precisions') && `💬 ${f.get('precisions')}`,
      '',
      `${f.get('nom')} — ${f.get('tel')}`,
    ].filter(Boolean).join('\n')
    setSent(text)
    window.open(waLink(text), '_blank', 'noopener')
  }
  return (
    <>
      <section className="section">
        <div className="container st-two">
          <div>
            <div className="eyebrow">Propriétaires</div>
            <h1 className="h-section">Confiez-nous votre bien à Djerba</h1>
            <p className="lead mt-16">Vente, location à l'année ou location vacances : nous estimons votre bien, le photographions et le présentons à nos clients en Tunisie et à l'étranger.</p>
            <ul className="st-steps mt-32">
              <li><span className="st-step-n">1</span><div><strong>Vous décrivez le bien</strong><p className="muted small">Adresse, surface, état : deux minutes suffisent.</p></div></li>
              <li><span className="st-step-n">2</span><div><strong>On vient le voir</strong><p className="muted small">Un conseiller vous rappelle et fixe un rendez-vous pour l'estimation.</p></div></li>
              <li><span className="st-step-n">3</span><div><strong>On le met en avant</strong><p className="muted small">Photos, vidéo, annonce sur le site et sur Instagram ; pour la location vacances, gestion des demandes de réservation.</p></div></li>
            </ul>
            <div className="row wrap mt-32">
              <span className="chip"><Camera size={15} /> Photos incluses</span>
              <span className="chip"><Play size={15} /> Vidéo de présentation</span>
              <span className="chip"><Sparkle size={15} /> Estimation gratuite</span>
            </div>
          </div>
          <form className="card st-form" onSubmit={submit}>
            {sent ? (
              <div className="st-sent">
                <Check size={28} />
                <h3 className="h-card">Demande prête</h3>
                <p className="muted">WhatsApp s'est ouvert avec votre demande : il ne reste qu'à l'envoyer.</p>
                <a className="btn btn-gold mt-16" href={waLink(sent)} target="_blank" rel="noreferrer"><WhatsApp size={16} /> Ouvrir WhatsApp</a>
              </div>
            ) : (
              <>
                <h3 className="h-card">Présenter mon bien</h3>
                <div className="grid grid-2" style={{ gap: 10 }}>
                  <select className="input select" name="projet" defaultValue="Location vacances">
                    <option>Location vacances</option>
                    <option>Location à l'année</option>
                    <option>Vente</option>
                  </select>
                  <select className="input select" name="type" defaultValue="Villa">
                    <option>Villa</option><option>Maison / houch</option><option>Appartement</option><option>Terrain</option><option>Local commercial</option>
                  </select>
                </div>
                <input className="input" name="adresse" placeholder="Quartier (ex. Midoun, Tezdaine, Houmt Souk…)" required />
                <div className="grid grid-2" style={{ gap: 10 }}>
                  <input className="input" name="surface" type="number" placeholder="Surface (m²)" />
                  <input className="input" name="chambres" type="number" placeholder="Nombre de chambres" />
                </div>
                <div className="grid grid-2" style={{ gap: 10 }}>
                  <input className="input" name="nom" placeholder="Nom et prénom" required />
                  <input className="input" name="tel" type="tel" placeholder="Téléphone" required />
                </div>
                <textarea className="input" name="precisions" placeholder="Précisions (piscine, état, disponibilités…)" />
                <button className="btn btn-gold btn-block btn-lg"><WhatsApp size={18} /> Envoyer ma demande</button>
                <div className="row small muted" style={{ gap: 6 }}><Clock size={14} /> Réponse pendant les horaires d'agence</div>
              </>
            )}
          </form>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="grid grid-3">
            <div className="card st-article"><Sun size={22} /><h3 className="h-card mt-16">Location vacances</h3><p className="muted small mt-8">Votre villa présentée avec calendrier et tarifs par saison ; les demandes de réservation arrivent à l'agence, qui les vérifie avec vous.</p></div>
            <div className="card st-article"><Home size={22} /><h3 className="h-card mt-16">Location à l'année</h3><p className="muted small mt-8">Recherche de locataires, visites et accompagnement jusqu'à la signature du bail.</p></div>
            <div className="card st-article"><Briefcase size={22} /><h3 className="h-card mt-16">Vente</h3><p className="muted small mt-8">Estimation, reportage photo et vidéo, diffusion et visites avec des acquéreurs sérieux.</p></div>
          </div>
          <div className="mt-48">
            <CtaBanner title="Une question avant de vous lancer ?" text="Appelez-nous ou écrivez-nous sur WhatsApp : nous vous expliquons comment nous travaillons, sans engagement." />
          </div>
        </div>
      </section>
    </>
  )
}

/* ---------- Crédits photos ---------- */
export function Credits() {
  useTop()
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 860 }}>
        <div className="eyebrow">Mentions</div>
        <h1 className="h-section">Crédits photos</h1>
        <p className="lead mt-16">
          Les photos des biens appartiennent à Immo Soleil Djerba. Les photos d'ambiance de l'île proviennent de Wikimedia Commons ; elles ont été redimensionnées pour le web et restent sous leur licence d'origine.
        </p>
        <ul className="st-zones mt-32">
          {CREDITS.map((c) => (
            <li key={c.fichier}>
              <span><a className="link" href={c.source} target="_blank" rel="noreferrer" style={{ textTransform: 'none', letterSpacing: 0 }}>{c.titre}</a> · {c.auteur}</span>
              <span className="muted small">{c.licenceUrl ? <a href={c.licenceUrl} target="_blank" rel="noreferrer">{c.licence}</a> : c.licence}</span>
            </li>
          ))}
        </ul>
        <Link to="/" className="btn btn-outline mt-32">Retour à l'accueil</Link>
      </div>
    </section>
  )
}
