import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SejourCard from '../components/SejourCard'
import { DatesField, GuestsField, type Guests } from '../components/Booking'
import { ArrowRight, Briefcase, Chevron, Pin, Pool, Wave, X } from '../components/Icons'
import { SEJOURS, SEJOUR_ZONES, searchSejours, shortDate, stayFromParams, stayQuery, type SejourFilters } from '../lib/sejours'
import './Sejours.css'

const BUDGETS = [300, 450, 600, 800]
const MAX_VOYAGEURS = Math.max(...SEJOURS.map((s) => s.voyageurs ?? 0), 8)

function Dropdown({ label, active, children }: { label: string; active?: boolean; children: React.ReactNode }) {
  return (
    <details className={`fb-dd ${active ? 'on' : ''}`}>
      <summary className={`chip ${active ? 'fb-active' : ''}`}>{label} <Chevron size={15} /></summary>
      <div className="fb-menu card">{children}</div>
    </details>
  )
}

/** Barre de recherche séjour : où / arrivée / départ / voyageurs, synchronisée avec l'URL */
export function StaySearch({ sp, setSp, sticky = false }: { sp: URLSearchParams; setSp: (sp: URLSearchParams) => void; sticky?: boolean }) {
  const stay = stayFromParams(sp)
  const update = (patch: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(sp)
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === '' || v === 0) next.delete(k)
      else next.set(k, String(v))
    }
    next.delete('voyageurs')
    setSp(next)
  }
  const guests: Guests = { adultes: stay.adultes, enfants: stay.enfants, bebes: stay.bebes }
  return (
    <div className={`ss-bar card ${sticky ? 'ss-sticky' : ''}`}>
      <label className="ss-where">
        <span className="label">Où</span>
        <span className="row" style={{ gap: 7 }}>
          <Pin size={15} />
          <select className="ss-select" value={sp.get('zone') ?? ''} onChange={(e) => update({ zone: e.target.value })}>
            <option value="">Toute l'île de Djerba</option>
            {SEJOUR_ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </span>
      </label>
      <DatesField start={stay.arrivee} end={stay.depart} onChange={(a, d) => update({ arrivee: a, depart: d })} />
      <GuestsField value={guests} max={MAX_VOYAGEURS} onChange={(g) => update({ adultes: g.adultes, enfants: g.enfants, bebes: g.bebes })} />
    </div>
  )
}

export default function Sejours() {
  const [sp, setSp] = useSearchParams()
  const stay = stayFromParams(sp)
  useEffect(() => { window.scrollTo({ top: 0 }) }, [])

  const f: SejourFilters = {
    arrivee: stay.arrivee,
    depart: stay.depart,
    voyageurs: stay.adultes + stay.enfants,
    zone: sp.get('zone') ?? undefined,
    piscine: sp.get('piscine') === '1',
    jacuzzi: sp.get('jacuzzi') === '1',
    chambres: Number(sp.get('chambres')) || undefined,
    budgetNuit: Number(sp.get('budget')) || undefined,
    sort: (sp.get('sort') as SejourFilters['sort']) ?? 'reco',
  }
  const { dispo, indispo } = useMemo(() => searchSejours(f), [sp]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key: string, value?: string | number | boolean) => {
    const next = new URLSearchParams(sp)
    if (value === undefined || value === '' || value === false || value === 0) next.delete(key)
    else next.set(key, String(value === true ? 1 : value))
    setSp(next)
  }
  const clearFilters = () => {
    const next = new URLSearchParams(sp)
    for (const k of ['zone', 'piscine', 'jacuzzi', 'chambres', 'budget']) next.delete(k)
    setSp(next)
  }
  const activeCount = ['zone', 'piscine', 'jacuzzi', 'chambres', 'budget'].filter((k) => sp.get(k)).length
  const query = stayQuery(sp)
  const hasDates = Boolean(stay.arrivee && stay.depart)

  return (
    <>
      <section className="sj-hero">
        <div className="container">
          <div className="small muted lp-crumb"><Link to="/">Accueil</Link> · Locations vacances</div>
          <h1 className="h-section">Locations vacances à Djerba</h1>
          <p className="lead mt-8" style={{ maxWidth: 680 }}>
            {SEJOURS.length} villas sélectionnées par l'agence, la plupart avec piscine privée. Choisissez vos dates, envoyez votre demande : nous confirmons la disponibilité directement avec vous sur WhatsApp.
          </p>
          <div className="mt-24">
            <StaySearch sp={sp} setSp={setSp} />
          </div>
        </div>
      </section>

      <div className="fb">
        <div className="container fb-row">
          <button className={`chip ${f.piscine ? 'fb-active' : ''}`} onClick={() => set('piscine', !f.piscine)}><Pool size={15} /> Piscine privée</button>
          <button className={`chip ${f.jacuzzi ? 'fb-active' : ''}`} onClick={() => set('jacuzzi', !f.jacuzzi)}><Wave size={15} /> Jacuzzi</button>
          <Dropdown label={f.chambres ? `${f.chambres} chambres et +` : 'Chambres'} active={!!f.chambres}>
            <button onClick={() => set('chambres')}>Indifférent</button>
            {[1, 2, 3, 4].map((n) => <button key={n} onClick={() => set('chambres', n)}>{n} chambre{n > 1 ? 's' : ''} et plus</button>)}
          </Dropdown>
          <Dropdown label={f.budgetNuit ? `≤ ${f.budgetNuit} DT / nuit` : 'Budget / nuit'} active={!!f.budgetNuit}>
            <button onClick={() => set('budget')}>Tous les budgets</button>
            {BUDGETS.map((b) => <button key={b} onClick={() => set('budget', b)}>À partir de {b} DT ou moins</button>)}
          </Dropdown>
          <span className="fb-spacer" />
          <label className="chip" style={{ paddingRight: 8 }}>
            <span className="muted">Trier :</span>
            <select className="lp-sort" value={f.sort} onChange={(e) => set('sort', e.target.value === 'reco' ? '' : e.target.value)}>
              <option value="reco">recommandés</option>
              <option value="prix-asc">prix croissant</option>
              <option value="prix-desc">prix décroissant</option>
              <option value="capacite">capacité</option>
            </select>
          </label>
          {activeCount > 0 && <button className="chip" onClick={clearFilters}><X size={15} /> Effacer</button>}
        </div>
      </div>

      <div className="container sj-results">
        <p className="muted">
          {dispo.length} villa{dispo.length > 1 ? 's' : ''}
          {hasDates ? ` disponible${dispo.length > 1 ? 's' : ''} du ${shortDate(stay.arrivee!)} au ${shortDate(stay.depart!, true)}` : ''}
          {f.voyageurs && f.voyageurs > 2 ? ` · ${f.voyageurs} voyageurs` : ''}
          {hasDates ? ' · prix total du séjour affiché' : ' · ajoutez vos dates pour voir le prix total'}
        </p>

        {dispo.length === 0 ? (
          <div className="card lp-empty mt-24">
            <h3 className="h-card">Aucune villa ne correspond {hasDates ? 'à ces dates' : 'à ces critères'}</h3>
            <p className="muted mt-8">Essayez d'autres dates ou retirez un filtre. Nous pouvons aussi vous proposer des villas qui ne sont pas encore en ligne.</p>
            <div className="row wrap mt-24">
              {activeCount > 0 && <button className="btn btn-outline" onClick={clearFilters}>Retirer les filtres</button>}
              <Link to="/contact" className="btn btn-primary">Nous contacter</Link>
            </div>
          </div>
        ) : (
          <div className="sj-grid mt-24">
            {dispo.map((s) => <SejourCard key={s.slug} sejour={s} arrivee={stay.arrivee} depart={stay.depart} query={query} />)}
          </div>
        )}

        {indispo.length > 0 && (
          <>
            <h2 className="pp-h2 mt-48">Déjà réservées ou fermées à ces dates</h2>
            <p className="muted small">Ouvrez la fiche pour voir les dates encore libres.</p>
            <div className="sj-grid mt-24">
              {indispo.map((s) => <SejourCard key={s.slug} sejour={s} query={query} unavailable />)}
            </div>
          </>
        )}

        <Link to="/team-building" className="sj-tb mt-48">
          <span className="sj-tb-ico"><Briefcase size={22} /></span>
          <span>
            <strong>Un séminaire ou un team building à Djerba ?</strong>
            <span className="muted"> Villas avec piscine pour votre équipe et activités sur l'île : nous préparons un devis sur mesure.</span>
          </span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </>
  )
}
