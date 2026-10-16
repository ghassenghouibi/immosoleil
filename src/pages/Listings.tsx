import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import SejourCard from '../components/SejourCard'
import { MapMock, Pagination } from '../components/Blocks'
import { ArrowRight, Chevron, Grid, Instagram, Map, Pin, Sparkle, Sun, X } from '../components/Icons'
import {
  BUDGETS_LOCATION, BUDGETS_VENTE, CATEGORIES, CATEGORY_LABEL, LISTINGS, RUBRIQUE_LABEL, RUBRIQUE_TITLE,
  ZONES, applyFilters, formatPrice, zoneBySlug, zoneCount, type Filters, type Rubrique,
} from '../lib/listings'
import { VIDEO_REFS } from '../lib/videos'
import { SEJOURS } from '../lib/sejours'
import { SOCIAL } from '../data/videos'
import { useFavorites } from '../hooks/useFavorites'
import './Listings.css'

const PER_PAGE = 12

function Dropdown({ label, active, children }: { label: string; active?: boolean; children: React.ReactNode }) {
  return (
    <details className={`fb-dd ${active ? 'on' : ''}`}>
      <summary className="chip">{label} <Chevron size={15} /></summary>
      <div className="fb-menu card">{children}</div>
    </details>
  )
}

export default function Listings({ rubrique: fixed, favoritesOnly = false }: { rubrique?: Rubrique; favoritesOnly?: boolean }) {
  const params = useParams()
  const rubrique: Rubrique = fixed ?? ((params.rubrique as Rubrique) || 'acheter')
  const [sp, setSp] = useSearchParams()
  const { ids: favIds } = useFavorites()
  const [view, setView] = useState<'grid' | 'map'>('grid')

  const f: Filters = {
    rubrique,
    zone: sp.get('zone') ?? undefined,
    type: sp.get('type') ?? undefined,
    budgetMax: Number(sp.get('budget')) || undefined,
    pieces: Number(sp.get('pieces')) || undefined,
    surfaceMin: Number(sp.get('surface')) || undefined,
    video: sp.get('video') === '1',
    sort: (sp.get('sort') as Filters['sort']) ?? 'recent',
    q: sp.get('q') ?? undefined,
  }
  const page = Math.max(1, Number(sp.get('page')) || 1)

  const set = (key: string, value?: string | number | boolean) => {
    const next = new URLSearchParams(sp)
    if (value === undefined || value === '' || value === false || value === 0) next.delete(key)
    else next.set(key, String(value === true ? 1 : value))
    if (key !== 'page') next.delete('page')
    setSp(next)
  }
  const clear = () => setSp(new URLSearchParams())

  const favSejours = favoritesOnly ? SEJOURS.filter((s) => favIds.includes(s.favKey)) : []
  const results = useMemo(() => {
    if (favoritesOnly) return LISTINGS.filter((l) => favIds.includes(l.id))
    return applyFilters(LISTINGS, f, VIDEO_REFS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp, rubrique, favoritesOnly, favIds])

  const pages = Math.ceil(results.length / PER_PAGE)
  const shown = results.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const zone = f.zone ? zoneBySlug(f.zone) : undefined
  const budgets = rubrique === 'louer' ? BUDGETS_LOCATION : BUDGETS_VENTE
  const available = results.filter((l) => l.isDisponible).length

  useEffect(() => { window.scrollTo({ top: 0 }) }, [page, rubrique])

  const title = favoritesOnly
    ? 'Mes favoris'
    : zone
      ? `${RUBRIQUE_TITLE[rubrique]} à ${zone.name}`
      : `${RUBRIQUE_TITLE[rubrique]} à Djerba`

  const activeCount = ['zone', 'type', 'budget', 'pieces', 'surface', 'video'].filter((k) => sp.get(k)).length

  return (
    <>
      {!favoritesOnly && (
        <div className="fb">
          <div className="container fb-row">
            {zone ? (
              <button className="chip fb-active" onClick={() => set('zone')}><Pin size={15} /> {zone.name} <X size={14} /></button>
            ) : (
              <Dropdown label="Où">
                {ZONES.filter((z) => zoneCount(z) > 0).map((z) => (
                  <button key={z.slug} onClick={() => set('zone', z.slug)}>{z.name} <span className="muted">{zoneCount(z)}</span></button>
                ))}
              </Dropdown>
            )}
            <span className="chip fb-active fb-static">{RUBRIQUE_LABEL[rubrique]}</span>
            <Dropdown label={f.type ? CATEGORY_LABEL[f.type] : 'Type de bien'} active={!!f.type}>
              <button onClick={() => set('type')}>Tous les types</button>
              {CATEGORIES.map((c) => <button key={c} onClick={() => set('type', c)}>{CATEGORY_LABEL[c]}</button>)}
            </Dropdown>
            <Dropdown label={f.budgetMax ? `≤ ${f.budgetMax.toLocaleString('fr-FR')} DT` : 'Budget'} active={!!f.budgetMax}>
              <button onClick={() => set('budget')}>Tous les budgets</button>
              {budgets.map((b) => <button key={b} onClick={() => set('budget', b)}>Jusqu'à {b.toLocaleString('fr-FR')} DT</button>)}
            </Dropdown>
            <Dropdown label={f.pieces ? `${f.pieces} ch. et plus` : 'Chambres'} active={!!f.pieces}>
              <button onClick={() => set('pieces')}>Indifférent</button>
              {[1, 2, 3, 4].map((n) => <button key={n} onClick={() => set('pieces', n)}>{n} chambre{n > 1 ? 's' : ''} et plus</button>)}
            </Dropdown>
            <Dropdown label={f.surfaceMin ? `≥ ${f.surfaceMin} m²` : 'Surface'} active={!!f.surfaceMin}>
              <button onClick={() => set('surface')}>Indifférent</button>
              {[100, 150, 200, 300, 500, 1000].map((n) => <button key={n} onClick={() => set('surface', n)}>Plus de {n} m²</button>)}
            </Dropdown>
            <span className="fb-spacer" />
            <button className={`chip ${f.video ? 'fb-active' : ''}`} onClick={() => set('video', !f.video)}>
              <Sparkle size={15} /> Avec vidéo
            </button>
            {activeCount > 0 && <button className="chip" onClick={clear}><X size={15} /> Effacer</button>}
          </div>
        </div>
      )}

      <div className="container lp">
        <div className="small muted lp-crumb">
          <Link to="/">Accueil</Link> · {favoritesOnly ? 'Favoris' : <Link to={`/${rubrique}`}>{RUBRIQUE_LABEL[rubrique]}</Link>}{zone ? ` · ${zone.name}` : ''}
        </div>
        <div className="section-head" style={{ marginBottom: 24 }}>
          <div>
            <h1 className="h-section">{title}</h1>
            <p className="muted mt-8">
              {favoritesOnly
                ? `${favSejours.length} villa${favSejours.length > 1 ? 's' : ''} de vacances · ${results.length} annonce${results.length > 1 ? 's' : ''}`
                : `${results.length} bien${results.length > 1 ? 's' : ''} · ${available} disponible${available > 1 ? 's' : ''}`}
            </p>
          </div>
          {!favoritesOnly && (
            <div className="row">
              <label className="chip" style={{ paddingRight: 8 }}>
                <span className="muted">Trier :</span>
                <select className="lp-sort" value={f.sort} onChange={(e) => set('sort', e.target.value)}>
                  <option value="recent">les plus récents</option>
                  <option value="price-asc">prix croissant</option>
                  <option value="price-desc">prix décroissant</option>
                  <option value="surface-desc">surface</option>
                </select>
              </label>
              <div className="lp-view">
                <button className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')} aria-label="Grille"><Grid size={18} /></button>
                <button className={view === 'map' ? 'on' : ''} onClick={() => setView('map')} aria-label="Carte"><Map size={18} /></button>
              </div>
            </div>
          )}
        </div>

        {favSejours.length > 0 && (
          <div className="sj-grid mb-24" style={{ marginBottom: 48 }}>
            {favSejours.map((s) => <SejourCard key={s.slug} sejour={s} />)}
          </div>
        )}

        {results.length === 0 ? (
          favoritesOnly && favSejours.length > 0 ? null : (
          <div className="card lp-empty">
            <h3 className="h-card">{favoritesOnly ? 'Aucun favori pour le moment' : 'Aucun bien ne correspond à ces critères'}</h3>
            <p className="muted mt-8">
              {favoritesOnly ? 'Cliquez sur le cœur d’une villa ou d’une annonce pour la retrouver ici.' : 'Élargissez la zone ou le budget, ou créez une alerte : nous vous prévenons dès qu’un bien correspond.'}
            </p>
            <div className="row wrap mt-24" style={{ justifyContent: 'center' }}>
              {activeCount > 0 && <button className="btn btn-outline" onClick={clear}>Retirer les filtres</button>}
              <Link to="/locations-vacances" className="btn btn-primary">Voir les locations vacances</Link>
            </div>
          </div>
          )
        ) : (
          <div className={`lp-layout ${view === 'map' ? 'map-on' : ''}`}>
            <div>
              <div className="grid grid-2 lp-grid">
                {shown.map((l) => <PropertyCard key={l.id} listing={l} />)}
              </div>
              <Pagination page={page} pages={pages} onChange={(p) => set('page', p)} />
            </div>
            <aside className="lp-side">
              <div className="card lp-map">
                <MapMock pins={shown.slice(0, 6).map((l) => formatPrice(l).main)} height={560} />
                <div className="row between lp-map-foot">
                  <span className="small muted">{Math.min(6, shown.length)} biens visibles sur la zone</span>
                  <button className="btn btn-outline btn-sm">Chercher dans cette zone</button>
                </div>
              </div>
              <form className="card lp-alert" onSubmit={(e) => { e.preventDefault(); alert('Alerte activée ! Vous recevrez les nouveautés par e-mail.') }}>
                <div className="row" style={{ gap: 8, fontWeight: 700 }}><Sparkle size={17} style={{ color: 'var(--blue)' }} /> Créer une alerte</div>
                <p className="small muted mt-8">
                  Recevez les nouveautés {zone ? `de ${zone.name}` : 'de Djerba'} par e-mail ou WhatsApp, dès leur mise en ligne.
                </p>
                <div className="row mt-16">
                  <input className="input" type="email" placeholder="votre@email.com" required />
                  <button className="btn btn-primary">Activer</button>
                </div>
              </form>
              <Link to="/locations-vacances" className="card-dark lp-social">
                <div className="row" style={{ gap: 8, fontWeight: 700 }}><Sun size={16} style={{ color: 'var(--gold)' }} /> Envie d'essayer avant d'acheter ?</div>
                <p className="small mt-8" style={{ color: '#b7c3cc' }}>
                  Passez quelques nuits dans l'une de nos {SEJOURS.length} villas de vacances pour découvrir les quartiers de l'île.
                </p>
                <span className="link mt-16" style={{ color: 'var(--gold)', display: 'inline-flex' }}>Locations vacances <ArrowRight size={15} /></span>
              </Link>
              <a href={SOCIAL.instagram.url} target="_blank" rel="noreferrer" className="card lp-alert">
                <div className="row" style={{ gap: 8, fontWeight: 700 }}><Instagram size={16} style={{ color: 'var(--gold-dark)' }} /> {SOCIAL.instagram.handle}</div>
                <p className="small muted mt-8">Nos nouveaux biens et nos villas en vidéo sur Instagram.</p>
              </a>
            </aside>
          </div>
        )}
      </div>
    </>
  )
}
