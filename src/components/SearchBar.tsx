import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from './Icons'
import { DatesField, GuestsField, type Guests } from './Booking'
import { BUDGETS_LOCATION, BUDGETS_VENTE, CATEGORIES, CATEGORY_LABEL, ZONES } from '../lib/listings'
import { SEJOURS, SEJOUR_ZONES } from '../lib/sejours'
import './SearchBar.css'

type Tab = 'sejour' | 'acheter' | 'louer'
const TABS: { key: Tab; label: string }[] = [
  { key: 'sejour', label: 'Location vacances' },
  { key: 'acheter', label: 'Acheter' },
  { key: 'louer', label: "Louer à l'année" },
]
const MAX_VOYAGEURS = Math.max(...SEJOURS.map((s) => s.voyageurs ?? 0), 8)

export default function SearchBar() {
  const nav = useNavigate()
  const [tab, setTab] = useState<Tab>('sejour')
  const [zone, setZone] = useState('')
  const [type, setType] = useState('')
  const [budget, setBudget] = useState('')
  const [dates, setDates] = useState<{ a?: string; d?: string }>({})
  const [guests, setGuests] = useState<Guests>({ adultes: 2, enfants: 0, bebes: 0 })
  const budgets = tab === 'louer' ? BUDGETS_LOCATION : BUDGETS_VENTE

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = new URLSearchParams()
    if (zone) q.set('zone', zone)
    if (tab === 'sejour') {
      if (dates.a && dates.d) { q.set('arrivee', dates.a); q.set('depart', dates.d) }
      q.set('adultes', String(guests.adultes))
      if (guests.enfants) q.set('enfants', String(guests.enfants))
      if (guests.bebes) q.set('bebes', String(guests.bebes))
      nav(`/locations-vacances?${q}`)
      return
    }
    if (type) q.set('type', type)
    if (budget) q.set('budget', budget)
    nav(`/${tab}${q.toString() ? `?${q}` : ''}`)
  }

  return (
    <form className="sb card" onSubmit={submit}>
      <div className="sb-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            type="button"
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={tab === t.key ? 'on' : ''}
            onClick={() => { setTab(t.key); setBudget(''); setZone('') }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="sb-fields">
        <label className="sb-field">
          <span className="label">Où</span>
          <select className="select sb-select" value={zone} onChange={(e) => setZone(e.target.value)}>
            <option value="">Toute l'île de Djerba</option>
            {tab === 'sejour'
              ? SEJOUR_ZONES.map((z) => <option key={z} value={z}>{z}</option>)
              : ZONES.map((z) => <option key={z.slug} value={z.slug}>{z.name}</option>)}
          </select>
        </label>
        {tab === 'sejour' ? (
          <>
            <div className="sb-field sb-field-wide">
              <DatesField start={dates.a} end={dates.d} onChange={(a, d) => setDates({ a, d })} />
            </div>
            <div className="sb-field">
              <GuestsField value={guests} max={MAX_VOYAGEURS} onChange={setGuests} />
            </div>
          </>
        ) : (
          <>
            <label className="sb-field">
              <span className="label">Type de bien</span>
              <select className="select sb-select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">Tous les types</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
              </select>
            </label>
            <label className="sb-field">
              <span className="label">Budget</span>
              <select className="select sb-select" value={budget} onChange={(e) => setBudget(e.target.value)}>
                <option value="">Tous les budgets</option>
                {budgets.map((b) => (
                  <option key={b} value={b}>Jusqu'à {b.toLocaleString('fr-FR')} DT{tab === 'louer' ? ' / mois' : ''}</option>
                ))}
              </select>
            </label>
          </>
        )}
        <button type="submit" className="btn btn-primary btn-lg sb-submit"><Search size={18} /> Rechercher</button>
      </div>
    </form>
  )
}
