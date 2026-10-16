import { Bag, Building, Bus, Health, Leaf, School } from './Icons'
import { formatDistance, PROX_LABEL, type ProxCategory, type proximiteFor } from '../lib/proximite'

type Entry = NonNullable<ReturnType<typeof proximiteFor>>

const PROX_ICON: Record<ProxCategory, typeof Bag> = { commerces: Bag, ecoles: School, sante: Health, transports: Bus, hotels: Building, loisirs: Leaf }

/** Bloc « À proximité » : commerces, écoles, santé, hôtels… autour du bien */
export default function Proximity({ prox, centre }: { prox?: Entry; centre: string }) {
  const cats = prox ? (Object.keys(PROX_LABEL) as ProxCategory[]).filter((c) => prox.places[c]?.length) : []
  if (!prox || cats.length === 0) return null
  return (
    <section className="pp-block">
      <h2 className="pp-h2">À proximité</h2>
      <div className="pp-prox">
        {cats.map((c) => {
          const Icon = PROX_ICON[c]
          return (
            <div key={c} className="pp-prox-cat">
              <div className="pp-prox-head"><span className="pp-prox-ico"><Icon size={18} /></span> {PROX_LABEL[c]}</div>
              <ul>
                {prox.places[c]!.map((p) => (
                  <li key={p.name}>
                    <div><strong>{p.name}</strong><span className="small muted">{p.kind}</span></div>
                    <span className="small pp-prox-dist">{formatDistance(p.m)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
      <p className="small muted mt-16">
        Distances à vol d'oiseau depuis le centre de {centre}, l'adresse exacte étant communiquée en agence. Données © OpenStreetMap.
      </p>
    </section>
  )
}
