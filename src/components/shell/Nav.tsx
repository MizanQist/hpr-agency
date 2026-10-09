import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/motion'
import { onNavTheme } from '../../lib/theme'
import type { NavTheme } from '../../lib/theme'
import { Pattern } from './Pattern'
import { Magnetic } from './Magnetic'

const LOGO = `${import.meta.env.BASE_URL}hpr-logo.png`
const MASK = `${import.meta.env.BASE_URL}img/hpr-wordmark-mask.png`

/* The rooms of the page, in order. Ones not built yet are shown but not linked. */
const ITEMS: Array<{ label: string; id: string; live: boolean }> = [
  { label: 'Home', id: 'top', live: true },
  { label: 'The story', id: 'story', live: true },
  { label: 'What we find', id: 'find', live: true },
  { label: 'The founder', id: 'founder', live: true },
  { label: 'The desk', id: 'desk', live: false },
  { label: 'Contact', id: 'contact', live: false },
]

type Props = { onMenuToggle?: (open: boolean) => void }

export function Nav({ onMenuToggle }: Props) {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<NavTheme>('hero')
  const [active, setActive] = useState('top')
  const menu = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLElement>(null)
  const glow = useRef<HTMLSpanElement>(null)
  const list = useRef<HTMLUListElement>(null)

  useEffect(() => onNavTheme(setTheme), [])

  /* Scrollspy: whichever live section owns the top third of the viewport is the active one. */
  useEffect(() => {
    const triggers = ITEMS.filter((i) => i.live).map((item) =>
      ScrollTrigger.create({
        trigger: `#${item.id}`,
        start: 'top 35%',
        end: 'bottom 35%',
        onToggle: (self) => self.isActive && setActive(item.id),
      }),
    )
    return () => triggers.forEach((t) => t.kill())
  }, [])

  /* The liquid highlight slides to the hovered item and rests on the active one. */
  const moveGlow = (target: HTMLElement | null, instant = false) => {
    const g = glow.current
    const l = list.current
    if (!g || !l || !target) return
    const lr = l.getBoundingClientRect()
    const tr = target.getBoundingClientRect()
    gsap.to(g, { x: tr.left - lr.left, width: tr.width, opacity: 1, duration: instant || prefersReducedMotion() ? 0 : 0.5, ease: 'power3.out' })
  }
  useEffect(() => {
    const el = list.current?.querySelector<HTMLElement>(`[data-nav-id="${active}"]`)
    moveGlow(el ?? null)
  }, [active])

  /* The glass firms up once the hero is gone. */
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 80,
      onToggle: (self) => bar.current?.classList.toggle('is-scrolled', self.isActive),
    })
    return () => st.kill()
  }, [])

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

  const light = theme === 'light'
  const inkText = theme !== 'dark'

  return (
    <>
      <header
        ref={bar}
        data-theme={theme}
        className={`group/nav fixed top-0 left-0 z-50 flex w-full items-center justify-between px-spine py-4 transition-colors duration-700 ease-[var(--ease-brand)] ${inkText ? 'text-navy' : 'text-paper'}`}
      >
        <a href="#top" aria-label="HPR — home" className="relative block h-11 w-16 sm:h-14 sm:w-20">
          <img src={LOGO} alt="" width={518} height={376} className={`absolute inset-0 h-full w-auto drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)] transition-opacity duration-700 ${light ? 'opacity-0' : 'opacity-100'}`} />
          <span
            aria-hidden="true"
            className={`absolute inset-0 bg-navy transition-opacity duration-700 ${light ? 'opacity-100' : 'opacity-0'}`}
            style={{ maskImage: `url(${MASK})`, WebkitMaskImage: `url(${MASK})`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'left center', WebkitMaskPosition: 'left center' }}
          />
        </a>

        {/* The glass: a frosted pill of the page's rooms. Desktop only; phones use the round menu. */}
        <nav aria-label="Sections" className="glass absolute left-1/2 top-4 hidden -translate-x-1/2 rounded-full p-1 lg:block">
          <ul ref={list} className="relative flex items-center">
            <span ref={glow} aria-hidden="true" className="glass-glow pointer-events-none absolute left-0 top-0 h-full rounded-full opacity-0" />
            {ITEMS.map((item) =>
              item.live ? (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    data-nav-id={item.id}
                    aria-current={active === item.id ? 'location' : undefined}
                    onMouseEnter={(e) => moveGlow(e.currentTarget)}
                    onMouseLeave={() => moveGlow(list.current?.querySelector<HTMLElement>(`[data-nav-id="${active}"]`) ?? null)}
                    className={`relative z-10 flex h-9 items-center rounded-full px-4 text-[13px] font-semibold tracking-wide transition-opacity duration-300 ${active === item.id ? 'opacity-100' : 'opacity-75 hover:opacity-100'}`}
                  >
                    {item.label}
                  </a>
                </li>
              ) : (
                <li key={item.id}>
                  <span title="Coming soon" aria-disabled="true" className="relative z-10 flex h-9 cursor-default items-center rounded-full px-4 text-[13px] font-semibold tracking-wide opacity-35">
                    {item.label}
                  </span>
                </li>
              ),
            )}
          </ul>
          <span aria-hidden="true" className="glass-sheen pointer-events-none absolute inset-0 rounded-full" />
        </nav>

        <div className="flex items-center gap-3">
          <Magnetic>
            <a
              href="#desk"
              className="inline-flex h-11 items-center rounded-full bg-gold px-5 text-[13px] font-semibold tracking-wide text-navy transition-colors duration-500 ease-[var(--ease-brand)] hover:bg-paper sm:text-sm"
            >
              Make a request
            </a>
          </Magnetic>
          <Magnetic className="lg:hidden">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="glass relative flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-500 ease-[var(--ease-brand)]"
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
        className="fixed inset-0 z-40 bg-navy/80 text-paper backdrop-blur-2xl"
        style={{ clipPath: 'inset(0 0 100% 0)', pointerEvents: 'none' }}
      >
        <Pattern line="#d1ad65" dot="#d1ad65" lineOpacity={0.16} dotOpacity={0.32} />
        <nav aria-label="Site" className="relative flex h-full flex-col justify-end px-spine pb-10 pt-28 sm:justify-center sm:pb-0">
          <ul className="flex flex-col gap-1">
            {ITEMS.map((item, i) => (
              <li key={item.id} className="overflow-hidden">
                {item.live ? (
                  <a
                    data-menu-item
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    tabIndex={open ? 0 : -1}
                    className="flex items-baseline gap-5 font-display text-[clamp(2.5rem,9vw,6rem)] leading-[0.95] text-paper transition-colors duration-500 ease-[var(--ease-brand)] hover:text-gold"
                  >
                    <span className="font-sans text-xs font-medium tracking-widest text-gold">0{i + 1}</span>
                    <span className="italic">{item.label}</span>
                  </a>
                ) : (
                  <span data-menu-item className="flex items-baseline gap-5 font-display text-[clamp(2.5rem,9vw,6rem)] leading-[0.95] text-paper/35">
                    <span className="font-sans text-xs font-medium tracking-widest text-gold/50">0{i + 1}</span>
                    <span className="italic">{item.label}</span>
                  </span>
                )}
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
