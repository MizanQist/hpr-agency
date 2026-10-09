import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { gsap, ScrollTrigger, hasFinePointer, prefersReducedMotion, scrollPageTo } from '../../lib/motion'
import { Pattern } from '../shell/Pattern'

const img = (f: string) => `${import.meta.env.BASE_URL}img/${f}`

type Photo = { name: string; alt: string }
type Panel = { id: string; word: string; line: string; photos?: Photo[]; placeholder?: string }

const PANELS: Panel[] = [
  {
    id: 'watch',
    word: 'Watches',
    line: 'Rare references, discontinued pieces, the one you were told is unavailable.',
    photos: [
      { name: 'rm-lift', alt: 'Gloved hands lifting a green Richard Mille RM 029 Le Mans out of an hpr presentation case.' },
      { name: 'rm-held', alt: 'The Richard Mille RM 029 Le Mans held up close: green case, white strap, skeleton dial.' },
      { name: 'ap-royal-oak', alt: 'An Audemars Piguet Royal Oak in a brown presentation box.' },
    ],
  },
  { id: 'jet', word: 'Private jets', line: 'Charter, a share, or the aircraft itself. Crewed, positioned, ready.', placeholder: 'private jet' },
  { id: 'animal', word: 'Animals', line: 'From thoroughbreds to the rarest breeds, sourced and moved with the right papers.', placeholder: 'animal' },
  { id: 'property', word: 'Properties', line: 'Homes that were never listed, in the cities that matter.', placeholder: 'property' },
]
const N = PANELS.length
const STEP = 1 / (N - 1)

const WORD = 'block whitespace-nowrap font-sans text-[clamp(3rem,8.6vw,8.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.035em] [font-stretch:88%]'

/* Lean toward a fine pointer, spring back when it leaves. */
function useTilt(ref: RefObject<HTMLElement | null>, amount = 14) {
  useEffect(() => {
    const el = ref.current
    if (!el || !hasFinePointer()) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      gsap.to(el, { rotateY: px * amount, rotateX: -py * amount, duration: 0.6, ease: 'power3.out', transformPerspective: 900 })
    }
    const onLeave = () => gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' })
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [ref, amount])
}

/* Resting and spread positions for the front, middle and back card of a deck. */
const CARD = [
  'z-30 [transform:rotate(0deg)_translate(0,0)] group-hover:[transform:rotate(0deg)_translate(0,-4%)]',
  'z-20 [transform:rotate(-6deg)_translate(-7%,3%)] group-hover:[transform:rotate(-11deg)_translate(-22%,5%)]',
  'z-10 [transform:rotate(6deg)_translate(7%,3%)] group-hover:[transform:rotate(11deg)_translate(22%,5%)]',
]

/* Three photographs in a fanned stack: hover spreads them, a click brings the next one to the front. */
function Deck({ photos }: { photos: Photo[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [order, setOrder] = useState(() => photos.map((_, i) => i))
  useTilt(ref, 10)
  return (
    <div
      ref={ref}
      data-cursor="Flip"
      role="button"
      tabIndex={0}
      aria-label="Next photograph"
      onClick={() => setOrder((o) => [...o.slice(1), o[0]])}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setOrder((o) => [...o.slice(1), o[0]]))}
      className="group relative aspect-[4/5] w-full cursor-pointer [transform-style:preserve-3d]"
    >
      {order.map((photoIndex, pos) => {
        const photo = photos[photoIndex]
        return (
          <figure
            key={photo.name}
            className={`absolute inset-0 overflow-hidden rounded-sm border border-current/15 bg-navy shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)] transition-transform duration-700 ease-[var(--ease-brand)] ${CARD[pos]}`}
          >
            <picture>
              <source type="image/webp" srcSet={`${img(`${photo.name}-780.webp`)} 780w, ${img(`${photo.name}-1170.webp`)} 1170w`} sizes="(min-width: 1024px) 32vw, 60vw" />
              <img src={img(`${photo.name}-780.jpg`)} alt={photo.alt} width={780} height={975} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </picture>
          </figure>
        )
      })}
    </div>
  )
}

/* An honest frame for a photograph the client still owes us. */
function Placeholder({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useTilt(ref)
  return (
    <div ref={ref} className="relative aspect-[4/5] w-full overflow-hidden rounded-sm border border-current/20 bg-current/5 will-change-transform [transform-style:preserve-3d]">
      <Pattern line="currentColor" dot="currentColor" lineOpacity={0.25} dotOpacity={0.4} size={96} drift={false} />
      <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-[11px] font-medium tracking-[0.18em] uppercase opacity-70">
        [Client photo: {label}]
      </p>
    </div>
  )
}

/*
  Section 4 — what we find. The page pins while four rooms slide past sideways. Each category word is drawn as an
  outline that fills with ink as it reaches the centre; its image travels slower than the word; the ground turns from
  navy to paper across the run. Scroll it, or grab it and drag.
*/
export function Gallery() {
  const track = useRef<HTMLElement>(null)
  const counter = useRef<HTMLSpanElement>(null)
  const still = prefersReducedMotion()

  useEffect(() => {
    const root = track.current
    if (!root || still) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          onUpdate: (self) => {
            const i = Math.min(N - 1, Math.max(0, Math.round(self.progress * (N - 1))))
            if (counter.current) counter.current.textContent = String(i + 1).padStart(2, '0')
            root.querySelector('[data-stage]')?.setAttribute('data-ground', self.progress > 0.45 ? 'light' : 'dark')
          },
        },
      })
      tl.to('[data-rail]', { x: `-${(N - 1) * 100}vw`, ease: 'none', duration: 1 }, 0)
        /* the ground fades between rooms two and three; the ink flips quickly in the middle of that fade so it never lingers in a mid-tone */
        .fromTo('[data-stage]', { backgroundColor: '#0e2b4b' }, { backgroundColor: '#f4f3ee', ease: 'none', duration: 0.3 }, 0.3)
        .fromTo('[data-stage]', { color: '#f4f3ee' }, { color: '#0e2b4b', ease: 'none', duration: 0.06 }, 0.42)
        .fromTo('[data-pattern-gold]', { opacity: 1 }, { opacity: 0, ease: 'none', duration: 0.3 }, 0.3)
        .fromTo('[data-pattern-navy]', { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.3 }, 0.3)
        .fromTo('[data-progress]', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 1 }, 0)
      /* Every tween stays inside [0, 1]: anything longer would stretch the timeline and desync the rail from the scroll. */
      const span = (from: number, to: number) => {
        const a = Math.max(0, from)
        const b = Math.min(1, to)
        return { at: a, duration: Math.max(0.02, b - a) }
      }
      PANELS.forEach((_, i) => {
        const centre = i * STEP
        const drift = span(centre - STEP, centre + STEP)
        tl.fromTo(`[data-gallery-img="${i}"]`, { xPercent: 10 }, { xPercent: -10, ease: 'none', duration: drift.duration }, drift.at)
        if (i === 0) return // the first room is already presented when the track begins
        const fill = span(centre - STEP * 0.4, centre)
        const line = span(centre - STEP * 0.5, centre - STEP * 0.15)
        tl.fromTo(`[data-fill="${i}"]`, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none', duration: fill.duration }, fill.at)
        tl.fromTo(`[data-line="${i}"]`, { opacity: 0, y: 24 }, { opacity: 1, y: 0, ease: 'none', duration: line.duration }, line.at)
      })
    }, root)
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [still])

  /* Grab the room and drag it: horizontal pointer movement becomes page scroll, one screen of drag per screen of track. */
  useEffect(() => {
    const root = track.current
    if (!root || still || !hasFinePointer()) return
    const stage = root.querySelector<HTMLElement>('[data-stage]')
    if (!stage) return
    let dragging = false
    let moved = false
    let startX = 0
    let startY = 0
    const down = (e: PointerEvent) => {
      if ((e.target as Element).closest('a, button, [role=button]')) return
      dragging = true
      moved = false
      startX = e.clientX
      startY = window.scrollY
      stage.classList.add('select-none')
      stage.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      moved = true
      scrollPageTo(startY - (e.clientX - startX) * (window.innerHeight / window.innerWidth), true)
    }
    const up = () => {
      dragging = false
      stage.classList.remove('select-none')
      void moved
    }
    stage.addEventListener('pointerdown', down)
    stage.addEventListener('pointermove', move)
    stage.addEventListener('pointerup', up)
    stage.addEventListener('pointercancel', up)
    return () => {
      stage.removeEventListener('pointerdown', down)
      stage.removeEventListener('pointermove', move)
      stage.removeEventListener('pointerup', up)
      stage.removeEventListener('pointercancel', up)
    }
  }, [still])

  const panels = PANELS.map((panel, i) => (
    <article key={panel.id} className="relative flex h-full w-screen shrink-0 flex-col justify-end gap-6 px-spine pb-16 pt-28 lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-6 lg:pb-0 lg:pt-0">
      <div className="order-2 lg:order-1 lg:col-span-7">
        <p className="mb-3 text-[11px] font-medium tracking-[0.2em] uppercase opacity-60">
          {String(i + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
        </p>
        <h2 className="relative">
          <span aria-hidden="true" className={`${WORD} [-webkit-text-fill-color:transparent] [-webkit-text-stroke:1px_currentColor]`}>
            {panel.word}
          </span>
          <span data-fill={i} className={`${WORD} absolute inset-0 text-current`} style={still || i === 0 ? undefined : { clipPath: 'inset(0 100% 0 0)' }}>
            {panel.word}
          </span>
        </h2>
        <div data-line={i} className="mt-5 max-w-[38ch] lg:mt-8">
          <p className="text-base leading-relaxed opacity-85 sm:text-lg">{panel.line}</p>
          <a href="#desk" className="mt-5 inline-flex h-10 items-center rounded-full border border-current/40 px-4 text-[13px] font-semibold tracking-wide transition-colors duration-500 ease-[var(--ease-brand)] hover:bg-gold hover:border-gold hover:text-navy">
            Ask about {panel.word.toLowerCase()}
          </a>
        </div>
      </div>
      <div className="order-1 w-[58%] max-w-[22rem] self-end lg:order-2 lg:col-span-4 lg:col-start-9 lg:w-full lg:max-w-none lg:self-center [perspective:900px]">
        <div data-gallery-img={i}>{panel.photos ? <Deck photos={panel.photos} /> : <Placeholder label={panel.placeholder ?? panel.word} />}</div>
      </div>
    </article>
  ))

  if (still) {
    return (
      <section id="find" data-ground="light" aria-labelledby="find-heading" className="bg-paper text-navy">
        <h2 id="find-heading" className="sr-only">What we find</h2>
        {panels.map((p, i) => (
          <div key={PANELS[i].id} className="h-screen">
            {p}
          </div>
        ))}
      </section>
    )
  }

  return (
    <section ref={track} id="find" aria-labelledby="find-heading" className="relative" style={{ height: `${N * 100}vh` }}>
      <div data-stage data-ground="dark" data-cursor="Drag" className="sticky top-0 h-screen overflow-hidden bg-navy text-paper touch-pan-y">
        <div data-pattern-gold className="absolute inset-0">
          <Pattern line="#d1ad65" dot="#d1ad65" lineOpacity={0.16} dotOpacity={0.32} />
        </div>
        <div data-pattern-navy className="absolute inset-0 opacity-0">
          <Pattern line="#0e2b4b" dot="#0e2b4b" lineOpacity={0.14} dotOpacity={0.28} />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-24 z-10 flex items-baseline justify-between px-spine text-[11px] font-medium tracking-[0.2em] uppercase sm:top-28">
          <h2 id="find-heading" className="text-gold">
            What we find
          </h2>
          <p className="tabular-nums opacity-70">
            <span ref={counter}>01</span> / {String(N).padStart(2, '0')}
          </p>
        </div>

        <div data-rail className="relative flex h-full w-max will-change-transform">
          {panels}
        </div>

        <div data-progress aria-hidden="true" className="absolute bottom-8 left-spine right-spine h-px origin-left bg-current/40" />
      </div>
    </section>
  )
}
