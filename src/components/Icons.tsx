import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

const base = (size = 18) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
})

export const Phone = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.9 2z"/></svg>
)
export const Mail = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
)
export const Heart = ({ size, filled, ...p }: P & { filled?: boolean }) => (
  <svg {...base(size)} {...p} fill={filled ? 'currentColor' : 'none'}><path d="M19.5 12.6 12 20l-7.5-7.4a4.6 4.6 0 0 1 6.5-6.5l1 1 1-1a4.6 4.6 0 0 1 6.5 6.5z"/></svg>
)
export const Pin = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
)
export const Bed = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7"/><path d="M3 15h18"/><path d="M6 9V7a2 2 0 0 1 2-2h3v4M13 9V5h3a2 2 0 0 1 2 2v2"/></svg>
)
export const Area = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h5V4M20 15h-5v5"/></svg>
)
export const Star = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9z"/></svg>
)
export const Home = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/></svg>
)
export const Check = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="m5 12 5 5 9-10"/></svg>
)
export const Camera = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>
)
export const Play = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M7 5v14l11-7z"/></svg>
)
export const Tour = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><ellipse cx="12" cy="12" rx="9" ry="4"/><path d="M12 3a9 9 0 0 1 0 18M12 3a9 9 0 0 0 0 18"/><path d="m17 16.5 2 1-1 2"/></svg>
)
export const Bag = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
)
export const School = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6"/></svg>
)
export const Health = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/></svg>
)
export const Bus = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M8 21v-3M16 21v-3"/><circle cx="8" cy="14.5" r=".5"/><circle cx="16" cy="14.5" r=".5"/></svg>
)
export const Leaf = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19 13 11"/></svg>
)
export const PlayFilled = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none"><path d="M8 5v14l11-7z"/></svg>
)
export const Search = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
)
export const Chevron = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="m6 9 6 6 6-6"/></svg>
)
export const ChevronRight = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="m9 6 6 6-6 6"/></svg>
)
export const ChevronLeft = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="m15 6-6 6 6 6"/></svg>
)
export const ArrowRight = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M4 12h16M13 5l7 7-7 7"/></svg>
)
export const Map = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></svg>
)
export const Instagram = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
)
export const TikTok = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none"><path d="M16.5 3c.3 2.2 1.7 3.8 3.9 4v3.2c-1.5 0-2.8-.5-3.9-1.3v6.4a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v3.3a2.4 2.4 0 1 0 1.5 2.2V3z"/></svg>
)
export const Facebook = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21z"/></svg>
)
export const YouTube = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="2.5" y="6" width="19" height="12" rx="3"/><path d="m10 9.5 5 2.5-5 2.5z" fill="currentColor"/></svg>
)
export const WhatsApp = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M3.5 20.5 5 16.2A8.5 8.5 0 1 1 8 19z"/><path d="M9 8.5c0 3 2.5 6 6.5 6.5l1-1.5-2-1-1 1a5 5 0 0 1-3-3l1-1-1-2z" fill="currentColor" stroke="none"/></svg>
)
export const Share = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6"/></svg>
)
export const X = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M6 6l12 12M18 6 6 18"/></svg>
)
export const Filter = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M4 7h16M7 12h10M10 17h4"/></svg>
)
export const Grid = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/></svg>
)
export const User = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
)
export const Sparkle = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>
)
export const Clock = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
)
export const Menu = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M4 7h16M4 12h16M4 17h16"/></svg>
)
export const Route = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h6a3 3 0 0 0 0-6H10a3 3 0 0 1 0-6h6"/></svg>
)
export const Land = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M3 20h18M4 20 9 9l3 6 2-3 6 8"/></svg>
)
export const Building = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/></svg>
)
export const Calendar = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>
)
export const Users = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/></svg>
)
export const Minus = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M5 12h14"/></svg>
)
export const Plus = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 5v14M5 12h14"/></svg>
)
export const Pool = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M2 18c1.7 0 1.7-1.2 3.3-1.2S7 18 8.7 18s1.6-1.2 3.3-1.2 1.6 1.2 3.3 1.2 1.7-1.2 3.4-1.2S20.3 18 22 18"/><path d="M8 15V5.5a2 2 0 0 1 4 0M16 15V5.5a2 2 0 0 0-4 0M8 9h8M8 12.5h8"/></svg>
)
export const Wifi = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.6 16a5 5 0 0 1 6.8 0"/><circle cx="12" cy="19.2" r=".8" fill="currentColor"/></svg>
)
export const Snow = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 2 3-2M9 20l3-2 3 2"/></svg>
)
export const Car = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M5 16V11l2-5h10l2 5v5"/><path d="M3 16h18v3H3zM5 11h14"/><circle cx="7.5" cy="13.5" r=".6" fill="currentColor"/><circle cx="16.5" cy="13.5" r=".6" fill="currentColor"/></svg>
)
export const Flame = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 21c4 0 6.5-2.7 6.5-6.2 0-4.3-4-6.3-4.8-10.8C11 6 9.6 8.4 9.6 10.4 8.3 9.7 7.6 8.6 7.4 7.4 6 9 5.5 11 5.5 14.8 5.5 18.3 8 21 12 21z"/></svg>
)
export const Kitchen = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M7 3v8a2 2 0 0 0 4 0V3M9 11v10M16 21V3c-2 1.5-3 4-3 7h3"/></svg>
)
export const Tv = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="3" y="6" width="18" height="12" rx="2"/><path d="m9 2 3 4 3-4M8 21h8"/></svg>
)
export const Sun = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>
)
export const Briefcase = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12.5h18"/></svg>
)
export const Wave = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M2 8c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2M2 13c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2M2 18c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/></svg>
)
export const Shield = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/></svg>
)
