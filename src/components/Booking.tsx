import { useState } from 'react'
import { usePopover } from '../hooks/usePopover'
import { Calendar, ChevronLeft, ChevronRight, Minus, Plus, Users, X } from './Icons'
import {
  MOIS, MIN_NUITS, firstBookable, iso, nightPrice, nightStatus, nightsBetween, parseIso, rangeAvailable, shortDate,
  guestsLabel, type Guests, type Sejour,
} from '../lib/sejours'
import './Booking.css'

/* ---------- Calendrier de sélection d'un séjour (arrivée → départ) ---------- */

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const monthKey = (d: Date) => d.getFullYear() * 12 + d.getMonth()

export function RangeCalendar({
  sejour, start, end, onChange, months = 2, prices = false,
}: {
  sejour?: Sejour
  start?: string
  end?: string
  onChange: (start?: string, end?: string) => void
  months?: 1 | 2
  /** Affiche le prix de la nuit sous chaque jour (fiche villa) */
  prices?: boolean
}) {
  const min = monthKey(parseIso(firstBookable()))
  const [anchor, setAnchor] = useState(() => Math.max(min, monthKey(parseIso(start ?? firstBookable()))))
  const [hover, setHover] = useState<string | null>(null)
  const picking = Boolean(start && !end)

  const selectable = (day: string) => {
    if (picking && day > start!) return nightsBetween(start!, day) >= MIN_NUITS && rangeAvailable(sejour, start!, day)
    return nightStatus(sejour, day) === 'ok'
  }

  const click = (day: string) => {
    if (picking && day > start!) {
      if (selectable(day)) onChange(start, day)
      else if (nightStatus(sejour, day) === 'ok') onChange(day, undefined)
      return
    }
    if (nightStatus(sejour, day) === 'ok') onChange(day, undefined)
  }

  const rangeEnd = end ?? (picking && hover && hover > start! && selectable(hover) ? hover : undefined)

  return (
    <div className="cal">
      <div className="cal-nav">
        <button type="button" onClick={() => setAnchor((a) => a - 1)} disabled={anchor <= min} aria-label="Mois précédent"><ChevronLeft size={18} /></button>
        <button type="button" onClick={() => setAnchor((a) => a + 1)} disabled={anchor >= min + 18} aria-label="Mois suivant"><ChevronRight size={18} /></button>
      </div>
      <div className={`cal-months cal-m${months}`}>
        {Array.from({ length: months }, (_, k) => {
          const mk = anchor + k
          const y = Math.floor(mk / 12)
          const m = mk % 12
          const first = new Date(y, m, 1)
          const lead = (first.getDay() + 6) % 7
          const days = new Date(y, m + 1, 0).getDate()
          return (
            <div key={mk} className="cal-month">
              <div className="cal-title">{MOIS[m]} {y}</div>
              <div className="cal-grid" role="grid">
                {WEEKDAYS.map((w, i) => <span key={i} className="cal-wd">{w}</span>)}
                {Array.from({ length: lead }, (_, i) => <span key={`b${i}`} />)}
                {Array.from({ length: days }, (_, i) => {
                  const day = iso(new Date(y, m, i + 1))
                  const status = nightStatus(sejour, day)
                  const ok = selectable(day)
                  const isStart = day === start
                  const isEnd = day === rangeEnd
                  const inRange = start && rangeEnd && day > start && day < rangeEnd
                  const price = prices && sejour && status === 'ok' && !picking ? nightPrice(sejour, day) : null
                  const cls = [
                    'cal-day',
                    ok ? '' : 'off',
                    status === 'reserved' ? 'reserved' : '',
                    isStart ? 'start' : '',
                    isEnd ? 'end' : '',
                    inRange ? 'in' : '',
                  ].filter(Boolean).join(' ')
                  return (
                    <button
                      type="button"
                      key={day}
                      className={cls}
                      disabled={!ok && !isStart}
                      onClick={() => click(day)}
                      onMouseEnter={() => setHover(day)}
                      aria-label={`${day}${status === 'reserved' ? ' (réservé)' : status === 'closed' ? ' (hors saison)' : ''}`}
                      aria-pressed={isStart || isEnd}
                    >
                      <span>{i + 1}</span>
                      {price !== null && <small>{price}</small>}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div className="cal-foot">
        <span className="small muted">
          {picking ? `Choisissez la date de départ (${MIN_NUITS} nuits min.)` : start && end ? `${nightsBetween(start, end)} nuits · ${shortDate(start)} → ${shortDate(end)}` : "Choisissez la date d'arrivée"}
        </span>
        {(start || end) && <button type="button" className="link small" onClick={() => onChange(undefined, undefined)}>Effacer les dates</button>}
      </div>
      {sejour && (
        <div className="cal-legend small muted">
          <span><i className="lg-ok" /> Disponible</span>
          <span><i className="lg-res" /> Réservé</span>
          {sejour.saison.length > 0 && <span><i className="lg-off" /> Hors saison</span>}
        </div>
      )}
    </div>
  )
}

/* ---------- Champ « Arrivée / Départ » avec calendrier en popover ---------- */

export function DatesField({
  sejour, start, end, onChange, compact = false, label = true,
}: {
  sejour?: Sejour
  start?: string
  end?: string
  onChange: (start?: string, end?: string) => void
  compact?: boolean
  label?: boolean
}) {
  const { open, setOpen, ref } = usePopover()
  return (
    <div className={`bk-field-wrap ${compact ? 'compact' : ''}`} ref={ref}>
      <button type="button" className={`bk-dates ${open ? 'on' : ''}`} onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="bk-cell">
          {label && <span className="label">Arrivée</span>}
          <span className={start ? '' : 'muted'}><Calendar size={15} /> {start ? shortDate(start, true) : 'Ajouter une date'}</span>
        </span>
        <span className="bk-cell">
          {label && <span className="label">Départ</span>}
          <span className={end ? '' : 'muted'}>{end ? shortDate(end, true) : 'Ajouter une date'}</span>
        </span>
      </button>
      {open && (
        <div className="bk-pop bk-pop-cal card" role="dialog" aria-label="Choisir les dates">
          <button type="button" className="bk-pop-close show-mobile" onClick={() => setOpen(false)} aria-label="Fermer"><X size={18} /></button>
          <RangeCalendar
            sejour={sejour}
            start={start}
            end={end}
            prices={Boolean(sejour)}
            months={typeof window !== 'undefined' && window.innerWidth < 720 ? 1 : 2}
            onChange={(s, e) => { onChange(s, e); if (s && e) setOpen(false) }}
          />
        </div>
      )}
    </div>
  )
}

/* ---------- Voyageurs ---------- */

function Counter({ label, hint, value, min, max, onChange }: { label: string; hint: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="bk-counter">
      <div><strong>{label}</strong><span className="small muted">{hint}</span></div>
      <div className="row" style={{ gap: 12 }}>
        <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Moins de ${label.toLowerCase()}`}><Minus size={16} /></button>
        <span className="bk-count">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`Plus de ${label.toLowerCase()}`}><Plus size={16} /></button>
      </div>
    </div>
  )
}

export function GuestsField({ value, onChange, max = 16, label = true }: { value: Guests; onChange: (g: Guests) => void; max?: number; label?: boolean }) {
  const { open, setOpen, ref } = usePopover()
  const total = value.adultes + value.enfants
  return (
    <div className="bk-field-wrap" ref={ref}>
      <button type="button" className={`bk-guests ${open ? 'on' : ''}`} onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="bk-cell">
          {label && <span className="label">Voyageurs</span>}
          <span><Users size={15} /> {guestsLabel(value)}</span>
        </span>
      </button>
      {open && (
        <div className="bk-pop bk-pop-guests card" role="dialog" aria-label="Voyageurs">
          <Counter label="Adultes" hint="13 ans et plus" value={value.adultes} min={1} max={max - value.enfants} onChange={(n) => onChange({ ...value, adultes: n })} />
          <Counter label="Enfants" hint="De 2 à 12 ans" value={value.enfants} min={0} max={max - value.adultes} onChange={(n) => onChange({ ...value, enfants: n })} />
          <Counter label="Bébés" hint="Moins de 2 ans" value={value.bebes} min={0} max={4} onChange={(n) => onChange({ ...value, bebes: n })} />
          <p className="small muted mt-8">{total >= max ? `Capacité maximale : ${max} voyageurs (bébés non compris).` : 'Les bébés ne comptent pas dans la capacité.'}</p>
          <button type="button" className="btn btn-primary btn-sm btn-block mt-16" onClick={() => setOpen(false)}>Valider</button>
        </div>
      )}
    </div>
  )
}

export type { Guests }
