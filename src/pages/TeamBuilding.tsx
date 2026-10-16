import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Photo from '../components/Photo'
import SejourCard from '../components/SejourCard'
import { ArrowRight, Briefcase, Check, Mail, Sun, Users, WhatsApp } from '../components/Icons'
import { SEJOURS } from '../lib/sejours'
import { CONTACT, waLink } from '../data/agences'
import port from '../assets/djerba/port.jpg'
import poterie from '../assets/djerba/poterie.jpg'
import flamants from '../assets/djerba/flamants.jpg'
import houmtSouk from '../assets/djerba/houmt-souk.jpg'
import plage from '../assets/djerba/plage-2.jpg'
import houch from '../assets/djerba/houch.jpg'
import './Sejours.css'
import './Static.css'

const FORMULES = [
  {
    icon: <Sun size={22} />,
    titre: 'Journée cohésion',
    texte: "Une journée pour sortir du bureau : activités en équipe le matin, déjeuner et piscine l'après-midi dans une villa privatisée.",
    points: ['Villa avec piscine privatisée à la journée', 'Une ou deux activités au choix', 'Déjeuner traiteur sur place'],
  },
  {
    icon: <Briefcase size={22} />,
    titre: 'Séminaire résidentiel',
    texte: "Deux ou trois jours pour travailler au calme et souder l'équipe : réunions au bord de la piscine, activités et soirées.",
    points: ['Hébergement en villas avec piscine', 'Espace de réunion dans la villa', 'Programme d’activités sur mesure'],
  },
  {
    icon: <Users size={22} />,
    titre: 'Incentive & week-end',
    texte: 'Récompenser une équipe ou fêter un résultat : séjour détente, sortie en mer et soirée djerbienne.',
    points: ['Séjour clé en main de 2 à 4 nuits', 'Sortie en mer, plage, médina', 'Soirée traditionnelle'],
  },
]

const ACTIVITES = [
  { photo: port, titre: 'Sortie en mer', texte: 'Départ du port de Houmt Souk en bateau pour une journée en mer, baignade et déjeuner de poisson.' },
  { photo: houmtSouk, titre: 'Rallye dans la médina', texte: 'Chasse au trésor par équipes dans les souks et les ruelles de Houmt Souk.' },
  { photo: poterie, titre: 'Atelier poterie à Guellala', texte: 'Initiation au tour chez les potiers du village, chacun repart avec sa pièce.' },
  { photo: flamants, titre: 'Balade nature', texte: 'Lagunes, flamants roses et paysages du sud de l’île, à vélo, en quad ou à pied.' },
  { photo: plage, titre: 'Olympiades sur la plage', texte: 'Jeux d’équipe, beach-volley et défis sur les plages de l’est de l’île.' },
  { photo: houch, titre: 'Soirée djerbienne', texte: 'Dîner traditionnel dans un houch, musique et cuisine de l’île.' },
]

const ETAPES = [
  { titre: 'Vous nous décrivez le projet', texte: "Taille du groupe, dates, objectifs, budget : le formulaire ci-dessous suffit." },
  { titre: 'On vous propose un programme', texte: 'Villas, activités, repas et transferts : un devis détaillé, ajustable.' },
  { titre: 'On organise sur place', texte: "Réservations, logistique et accueil à l'aéroport de Djerba." },
  { titre: 'Votre équipe profite', texte: 'Un interlocuteur unique joignable sur WhatsApp pendant tout le séjour.' },
]

export default function TeamBuilding() {
  useEffect(() => { window.scrollTo({ top: 0 }) }, [])
  const [sent, setSent] = useState<string | null>(null)
  const groupes = SEJOURS.filter((s) => (s.voyageurs ?? 0) >= 7).sort((a, b) => (b.voyageurs ?? 0) - (a.voyageurs ?? 0)).slice(0, 4)
  const capaciteTotale = SEJOURS.reduce((n, s) => n + (s.voyageurs ?? 0), 0)

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const acts = f.getAll('activites').join(', ')
    const text = [
      'Bonjour Immo Soleil Djerba,',
      'Nous souhaitons organiser un team building / séminaire à Djerba.',
      '',
      `🏢 Entreprise : ${f.get('entreprise')}`,
      `👤 Contact : ${f.get('nom')} — ${f.get('tel')}${f.get('email') ? ` — ${f.get('email')}` : ''}`,
      `👥 Participants : ${f.get('participants')}`,
      `📅 Dates souhaitées : ${f.get('dates') || 'à définir'}`,
      `🗂️ Formule : ${f.get('formule')}`,
      acts && `🎯 Activités : ${acts}`,
      f.get('hebergement') === 'oui' && '🛏️ Avec hébergement en villas',
      f.get('message') && `💬 ${f.get('message')}`,
    ].filter(Boolean).join('\n')
    setSent(text)
    window.open(waLink(text), '_blank', 'noopener')
  }

  return (
    <>
      <section className="tb-hero">
        <div className="tb-hero-bg" style={{ backgroundImage: `url(${plage})` }} aria-hidden="true" />
        <div className="container">
          <div className="eyebrow">Team building · Séminaires · Incentive</div>
          <h1 className="h-display">Fédérez votre équipe<br />sous le soleil de Djerba.</h1>
          <p className="lead">
            Des villas avec piscine privatisées pour votre groupe, des activités sur toute l'île et une équipe locale qui s'occupe de tout, du devis à l'accueil.
          </p>
          <div className="row wrap mt-32" style={{ gap: 12 }}>
            <a href="#devis" className="btn btn-gold btn-lg">Demander un devis <ArrowRight size={18} /></a>
            <Link to="/locations-vacances?adultes=8" className="btn btn-outline-white btn-lg">Voir les villas</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Nos formules</div>
              <h2 className="h-section">Trois formats, entièrement personnalisables</h2>
            </div>
          </div>
          <div className="tb-formules">
            {FORMULES.map((f) => (
              <div key={f.titre} className="card tb-f">
                <span className="tb-f-ico">{f.icon}</span>
                <h3 className="h-card">{f.titre}</h3>
                <p className="muted">{f.texte}</p>
                <ul>{f.points.map((p) => <li key={p}><Check size={15} /> {p}</li>)}</ul>
                <span className="small muted mt-8">Tarif sur devis, selon le groupe et la saison</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: '#fff', borderBlock: '1px solid var(--line)' }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Idées d'activités</div>
              <h2 className="h-section">Djerba, terrain de jeu pour votre équipe</h2>
            </div>
            <p className="muted" style={{ maxWidth: 420 }}>Des exemples à combiner : nous construisons le programme avec vous selon la saison, le groupe et vos objectifs.</p>
          </div>
          <div className="tb-acts">
            {ACTIVITES.map((a) => (
              <div key={a.titre} className="tb-act">
                <Photo src={a.photo} alt={a.titre} />
                <div><h3>{a.titre}</h3><p>{a.texte}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Hébergement</div>
              <h2 className="h-section">Des villas pour loger le groupe</h2>
            </div>
            <p className="muted" style={{ maxWidth: 440 }}>
              {SEJOURS.length} villas, jusqu'à {capaciteTotale} couchages au total. Plusieurs villas peuvent être réservées ensemble pour les groupes plus nombreux.
            </p>
          </div>
          <div className="sj-grid">
            {groupes.map((s) => <SejourCard key={s.slug} sejour={s} />)}
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <div className="eyebrow">Comment ça marche</div>
          <ol className="tb-steps mt-24">
            {ETAPES.map((e, i) => (
              <li key={e.titre}><span>0{i + 1}</span><strong>{e.titre}</strong><p>{e.texte}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" id="devis">
        <div className="container st-two">
          <div>
            <div className="eyebrow">Devis gratuit</div>
            <h2 className="h-section">Parlez-nous de votre projet</h2>
            <p className="lead mt-16">Envoyez-nous les grandes lignes : nous revenons vers vous avec une proposition de programme et un devis détaillé.</p>
            <ul className="st-contacts mt-32">
              <li><WhatsApp size={18} /><a href={waLink("Bonjour, j'aimerais organiser un team building à Djerba.")} target="_blank" rel="noreferrer">WhatsApp {CONTACT.phone}</a></li>
              <li><Mail size={18} /><a href={`mailto:${CONTACT.email}?subject=Team building à Djerba`}>{CONTACT.email}</a></li>
            </ul>
          </div>
          <form className="card st-form" onSubmit={submit}>
            {sent ? (
              <div className="st-sent">
                <WhatsApp size={28} />
                <h3 className="h-card">Votre demande est prête</h3>
                <p className="muted">WhatsApp s'est ouvert avec votre demande pré-remplie : il ne reste qu'à l'envoyer.</p>
                <a className="btn btn-gold mt-16" href={waLink(sent)} target="_blank" rel="noreferrer"><WhatsApp size={16} /> Ouvrir WhatsApp</a>
                <a className="link small mt-8" href={`mailto:${CONTACT.email}?subject=${encodeURIComponent('Demande de devis team building')}&body=${encodeURIComponent(sent)}`}>Envoyer plutôt par e-mail</a>
              </div>
            ) : (
              <>
                <h3 className="h-card">Demande de devis</h3>
                <input className="input" name="entreprise" placeholder="Entreprise / organisation" required />
                <div className="grid grid-2" style={{ gap: 10 }}>
                  <input className="input" name="nom" placeholder="Nom et prénom" required autoComplete="name" />
                  <input className="input" name="tel" type="tel" placeholder="Téléphone" required autoComplete="tel" />
                </div>
                <input className="input" name="email" type="email" placeholder="E-mail" autoComplete="email" />
                <div className="grid grid-2" style={{ gap: 10 }}>
                  <input className="input" name="participants" type="number" min={2} placeholder="Nombre de participants" required />
                  <input className="input" name="dates" placeholder="Dates ou période (ex. mai 2027)" />
                </div>
                <select className="input select" name="formule" defaultValue="Séminaire résidentiel">
                  {FORMULES.map((f) => <option key={f.titre}>{f.titre}</option>)}
                  <option>Je ne sais pas encore</option>
                </select>
                <span className="label mt-8">Activités qui vous intéressent</span>
                <div className="tb-pick">
                  {ACTIVITES.map((a) => (
                    <label key={a.titre}><input type="checkbox" name="activites" value={a.titre} /><span>{a.titre}</span></label>
                  ))}
                </div>
                <label className="row small mt-8" style={{ gap: 8 }}>
                  <input type="checkbox" name="hebergement" value="oui" defaultChecked /> Nous avons besoin d'un hébergement
                </label>
                <textarea className="input" name="message" placeholder="Objectifs, budget, contraintes… (facultatif)" />
                <button className="btn btn-gold btn-block btn-lg"><WhatsApp size={18} /> Envoyer la demande</button>
              </>
            )}
          </form>
        </div>
      </section>
    </>
  )
}
