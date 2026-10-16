import { Link } from 'react-router-dom'
import logo from '../assets/logo-immosoleil.png'

/** Logo officiel Immo Soleil Djerba (soleil doré) : il se lit sur fond clair comme sur fond sombre. */
export default function Logo({ height = 60 }: { height?: number }) {
  return (
    <Link to="/" className="logo" aria-label="Immo Soleil Djerba — accueil" style={{ display: 'inline-flex', alignItems: 'center' }}>
      <img src={logo} alt="Immo Soleil Djerba" height={height} style={{ height, width: 'auto', maxWidth: 'none', display: 'block' }} />
    </Link>
  )
}
