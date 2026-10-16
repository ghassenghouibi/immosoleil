import { Link } from 'react-router-dom'
import Logo from './Logo'
import { Instagram, Mail, Phone, WhatsApp } from './Icons'
import { AGENCY, CONTACT, waLink } from '../data/agences'
import { SOCIAL } from '../data/videos'
import { ZONES } from '../lib/listings'
import { SEJOURS } from '../lib/sejours'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="ftr">
      <div className="container">
        <div className="ftr-grid">
          <div>
            <Logo height={80} />
            <p className="ftr-blurb">
              Agence immobilière à Djerba : {SEJOURS.length} villas de vacances à réserver, villas et terrains à vendre, locations à l'année et séjours d'entreprise.
            </p>
            <div className="row" style={{ gap: 8, marginTop: 20 }}>
              <a className="ftr-social" href={SOCIAL.instagram.url} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={17} /></a>
              <a className="ftr-social" href={waLink('Bonjour Immo Soleil Djerba,')} target="_blank" rel="noreferrer" aria-label="WhatsApp"><WhatsApp size={17} /></a>
              <a className="ftr-social" href={`mailto:${CONTACT.email}`} aria-label="E-mail"><Mail size={17} /></a>
            </div>
          </div>
          <div>
            <h4>Séjourner</h4>
            <ul>
              <li><Link to="/locations-vacances">Locations vacances</Link></li>
              <li><Link to="/locations-vacances?piscine=1">Villas avec piscine</Link></li>
              <li><Link to="/team-building">Team building & séminaires</Link></li>
              <li><Link to="/favoris">Mes favoris</Link></li>
            </ul>
          </div>
          <div>
            <h4>Immobilier</h4>
            <ul>
              <li><Link to="/acheter">Acheter à Djerba</Link></li>
              <li><Link to="/louer">Louer à l'année</Link></li>
              <li><Link to="/acheter?type=Terrain">Terrains</Link></li>
              <li><Link to="/bureaux-et-commerces">Commerces</Link></li>
              {ZONES.slice(0, 3).map((z) => (
                <li key={z.slug}><Link to={`/acheter?zone=${z.slug}`}>{z.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4>L'agence</h4>
            <ul>
              <li><span className="row" style={{ gap: 8 }}><Phone size={15} /> <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}>{CONTACT.phone}</a></span></li>
              <li><span className="row" style={{ gap: 8 }}><Mail size={15} /> <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></span></li>
              <li><span className="ftr-phone">{AGENCY.address} · {AGENCY.hours}</span></li>
              <li><Link to="/deposer">Confier mon bien</Link></li>
            </ul>
          </div>
        </div>
        <div className="ftr-bottom">
          <span>© {new Date().getFullYear()} Immo Soleil Djerba · Agence immobilière, Djerba, Tunisie</span>
          <div className="row" style={{ gap: 20 }}>
            <Link to="/contact">Contact</Link>
            <Link to="/credits-photos">Crédits photos</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
