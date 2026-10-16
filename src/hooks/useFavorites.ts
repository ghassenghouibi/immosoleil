import { useCallback, useEffect, useState } from 'react'

const KEY = 'immosoleil:favoris'
const EVENT = 'immosoleil:favoris-change'

function read(): string[] {
  try {
    const v = localStorage.getItem(KEY)
    return v ? (JSON.parse(v) as string[]) : []
  } catch {
    return []
  }
}

function write(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids))
  } catch {
    /* stockage indisponible : les favoris restent en mémoire */
  }
  window.dispatchEvent(new Event(EVENT))
}

export function useFavorites() {
  const [ids, setIds] = useState<string[]>(read)

  useEffect(() => {
    const sync = () => setIds(read())
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const toggle = useCallback((id: string) => {
    const cur = read()
    write(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id])
  }, [])

  const has = useCallback((id: string) => ids.includes(id), [ids])

  return { ids, has, toggle, count: ids.length }
}
