import './SatelliteMap.css'

/**
 * Vue satellite statique du quartier (tuiles Esri World Imagery, sans clé API).
 * Volontairement imprécise : pas d'épingle, seulement une zone d'environ
 * RADIUS_M mètres, décalée de façon stable (graine = id du bien) pour ne
 * jamais révéler l'adresse exacte.
 */

const ZOOM = 16
const TILE = 256
const RADIUS_M = 350
const JITTER_M = 220

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

function toWorld(lat: number, lng: number) {
  const scale = TILE * 2 ** ZOOM
  const s = Math.sin((lat * Math.PI) / 180)
  return { x: ((lng + 180) / 360) * scale, y: (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * scale }
}

export default function SatelliteMap({ lat, lng, seed, label, height = 320 }: { lat: number; lng: number; seed: string; label: string; height?: number }) {
  // Décalage stable de 0 à JITTER_M mètres dans une direction pseudo-aléatoire
  const h = hash(seed)
  const angle = ((h % 360) * Math.PI) / 180
  const dist = ((h >>> 9) % 1000) / 1000 * JITTER_M
  const cLat = lat + (Math.cos(angle) * dist) / 111320
  const cLng = lng + (Math.sin(angle) * dist) / (111320 * Math.cos((lat * Math.PI) / 180))

  const { x, y } = toWorld(cLat, cLng)
  const tx = Math.floor(x / TILE)
  const ty = Math.floor(y / TILE)
  const mPerPx = (156543.03 * Math.cos((cLat * Math.PI) / 180)) / 2 ** ZOOM
  const r = Math.round(RADIUS_M / mPerPx)

  const tiles = []
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      tiles.push(
        <img
          key={`${dx}_${dy}`}
          src={`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${ZOOM}/${ty + dy}/${tx + dx}`}
          alt=""
          loading="lazy"
          draggable={false}
          style={{ left: `calc(50% + ${Math.round((tx + dx) * TILE - x)}px)`, top: `calc(50% + ${Math.round((ty + dy) * TILE - y)}px)` }}
        />,
      )
    }
  }

  return (
    <div className="sat" style={{ height }} role="img" aria-label={`Vue satellite du secteur : ${label}`}>
      {tiles}
      <span className="sat-zone" style={{ width: r * 2, height: r * 2 }} />
      <span className="sat-label">Secteur approximatif · {label}</span>
      <span className="sat-credit">Imagery © Esri</span>
    </div>
  )
}
