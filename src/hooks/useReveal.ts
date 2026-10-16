import { useEffect, useRef, useState } from 'react'

const REDUCED = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Anime à l'entrée dans le viewport tous les éléments `.reveal` du conteneur
 * (ajout de la classe `.in`, une seule fois). Les enfants d'un `.reveal-stagger`
 * s'enchaînent avec un léger décalage (voir Home.css).
 */
export function useRevealAll<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const els = Array.from(root.querySelectorAll<HTMLElement>('.reveal'))
    if (REDUCED || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return ref
}

/** Compteur animé (0 → value) déclenché quand l'élément devient visible. */
export function useCountUp(value: number, duration = 1400) {
  const ref = useRef<HTMLElement>(null)
  const [n, setN] = useState(REDUCED ? value : 0)
  useEffect(() => {
    const el = ref.current
    if (!el || REDUCED) return
    let raf = 0
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        const t0 = performance.now()
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration)
          const eased = 1 - Math.pow(1 - p, 3)
          setN(Math.round(value * eased))
          if (p < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [value, duration])
  return { ref, n }
}
