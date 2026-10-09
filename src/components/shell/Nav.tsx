import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '../../lib/motion'
import { Pattern } from './Pattern'
import { Magnetic } from './Magnetic'

const LOGO = `${import.meta.env.BASE_URL}hpr-logo.png`

/* Planned rooms of the page; each becomes a live anchor as its section is built. */
const ITEMS = [
  { label: 'The desk', href: '#desk' },
  { label: 'What we find', href: '#find' },
  { label: 'The founder', href: '#founder' },
  { label: 'Partners', href: '#partners' },
  { label: 'Contact', href: '#contact' },
]

type Props = { onMenuToggle?: (open: boolean) => void }

export function Nav({ onMenuToggle }: Props) {
  const [open, setOpen] = useState(false)
  const menu = useRef<HTMLDivElement>(null)

  useEffect(() => {
    onMenuToggle?.(open)
    const el = menu.current
    if (!el) return
    const items = el.querySelectorAll<HTMLElement>('[data-menu-item]')
    const meta = el.querySelectorAll<HTMLElement>('[data-menu-meta]')
    const quick = prefersReducedMotion()
    if (open) {
      el.style.pointerEvents = 'auto'
      gsap
        .timeline()
        .to(el, { clipPath: 'inset(0 0 0% 0)', duration: quick ? 0 : 0.9, ease: 'expo.inOut' })
        .fromTo(items, { yPercent: 110 }, { yPercent: 0, duration: quick ? 0 : 0.8, ease: 'expo.out', stagger: 0.06 }, quick ? 0 : 0.45)
        .fromTo(meta, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: quick ? 0 : 0.6, ease: 'power2.out', stagger: 0.08 }, quick ? 0 : 0.8)
    } else {
      el.style.pointerEvents = 'none'
      gsap.to(el, { clipPath: 'inset(0 0 100% 0)', duration: quick ? 0 : 0.7, ease: 'expo.inOut' })
    }
  }, [open, onMenuToggle])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header className="fixed top-0 left-0 z-50 flex w-full items-center justify-between px-spine py-5">
        <a href="#top" aria-label="HPR — home" className="block">
          <img src={LOGO} alt="" width={518} height={376} className="h-12 w-auto drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)] sm:h-16" />
        </a>
        <div className="flex items-center gap-3">
          <Magnetic>
            <a
              href="#desk"
              className="inline-flex h-11 items-center rounded-full bg-gold px-5 text-[13px] font-semibold tracking-wide text-navy transition-colors duration-500 ease-[var(--ease-brand)] hover:bg-paper sm:text-sm"
            >
              Make a request
            </a>
          </Magnetic>
          <Magnetic>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-paper/40 bg-navy/30 transition-colors duration-500 ease-[var(--ease-brand)] hover:bg-paper hover:text-navy"
            >
              <span className={`absolute h-[1.5px] w-4 bg-current transition-transform duration-500 ease-[var(--ease-brand)] ${open ? 'rotate-45' : '-translate-y-[3px]'}`} />
              <span className={`absolute h-[1.5px] w-4 bg-current transition-transform duration-500 ease-[var(--ease-brand)] ${open ? '-rotate-45' : 'translate-y-[3px]'}`} />
            </button>
          </Magnetic>
        </div>
      </header>

      <div
        id="site-menu"
        ref={menu}
        aria-hidden={!open}
        className="fixed inset-0 z-40 bg-navy text-paper"
        style={{ clipPath: 'inset(0 0 100% 0)', pointerEvents: 'none' }}
      >
        <Pattern line="#d1ad65" dot="#d1ad65" lineOpacity={0.16} dotOpacity={0.32} />
        <nav aria-label="Site" className="relative flex h-full flex-col justify-end px-spine pb-10 pt-28 sm:justify-center sm:pb-0">
          <ul className="flex flex-col gap-1">
            {ITEMS.map((item, i) => (
              <li key={item.label} className="overflow-hidden">
                <a
                  data-menu-item
                  href={item.href}
                  onClick={() => setOpen(false)}
                  tabIndex={open ? 0 : -1}
                  className="group flex items-baseline gap-5 font-display text-[clamp(2.75rem,9vw,7rem)] leading-[0.95] text-paper transition-colors duration-500 ease-[var(--ease-brand)] hover:text-gold"
                >
                  <span className="font-sans text-xs font-medium tracking-widest text-gold">0{i + 1}</span>
                  <span className="italic">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <div data-menu-meta className="mt-10 flex flex-wrap gap-x-10 gap-y-2 text-sm text-paper/70">
            <span>Hoomsuk PR Agency</span>
            <span>Watches · Private jets · Animals · Properties</span>
          </div>
        </nav>
      </div>
    </>
  )
}
