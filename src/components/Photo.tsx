import { useState, type ReactNode } from 'react'

/**
 * Photo avec fallback : si l'image ne charge pas (lien cassé, hors-ligne),
 * on garde le fond dégradé façon maquette.
 */
export default function Photo({
  src,
  alt = '',
  tone = '',
  className = '',
  children,
  style,
}: {
  src?: string
  alt?: string
  tone?: '' | 'ph-lime' | 'ph-sky' | 'ph-dark'
  className?: string
  children?: ReactNode
  style?: React.CSSProperties
}) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={`ph ${tone} ${className}`} style={style}>
      {src && !failed && <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />}
      {children}
    </div>
  )
}
