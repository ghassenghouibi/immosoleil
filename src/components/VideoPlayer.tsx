import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { parseEmbed, PLATFORM_LABEL } from '../lib/embed'
import type { VideoItem } from '../data/videos'
import { listingOf } from '../lib/videos'
import { ArrowRight, Instagram, X } from './Icons'
import './Video.css'

/** Lecteur intégré (Instagram / TikTok / YouTube / mp4) chargé à la demande. */
export function EmbedFrame({ url, title }: { url: string; title: string }) {
  const e = parseEmbed(url)

  if (e.placeholder || e.platform === 'unknown') {
    return (
      <div className="vp-placeholder">
        <Instagram size={28} />
        <p><strong>Vidéo à renseigner</strong></p>
        <p className="small">
          Collez le lien du reel Instagram dans <code>src/data/videos.ts</code> pour l'afficher ici.
        </p>
      </div>
    )
  }
  if (e.platform === 'video') {
    return <video className="vp-native" src={e.src} controls autoPlay playsInline />
  }
  return (
    <iframe
      className={`vp-iframe ${e.vertical ? 'vertical' : 'wide'}`}
      src={e.src}
      title={`${PLATFORM_LABEL[e.platform]} — ${title}`}
      allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
      allowFullScreen
      loading="lazy"
    />
  )
}

export function VideoModal({ video, onClose }: { video: VideoItem; onClose: () => void }) {
  const listing = listingOf(video)
  const e = parseEmbed(video.url)

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => ev.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="vm-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={video.title}>
      <div className={`vm ${e.vertical ? 'vm-vertical' : 'vm-wide'}`} onClick={(ev) => ev.stopPropagation()}>
        <button className="vm-close" onClick={onClose} aria-label="Fermer"><X size={20} /></button>
        <div className="vm-player">
          <EmbedFrame url={video.url} title={video.title} />
        </div>
        <div className="vm-info">
          <div className="small muted">{PLATFORM_LABEL[e.platform]}{video.views ? ` · ${video.views} vues` : ''}</div>
          <h3 className="h-card mt-8">{video.title}</h3>
          {video.subtitle && <div className="small muted mt-8">{video.subtitle}</div>}
          {listing && (
            <Link to={`/bien/${listing.id}`} className="btn btn-primary btn-sm mt-16" onClick={onClose}>
              Voir la fiche du bien <ArrowRight size={16} />
            </Link>
          )}
          {!e.placeholder && (
            <a href={video.url} target="_blank" rel="noreferrer" className="link small mt-16" style={{ display: 'inline-flex' }}>
              Ouvrir sur {PLATFORM_LABEL[e.platform]}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
