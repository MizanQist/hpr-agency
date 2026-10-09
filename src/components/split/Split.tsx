import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, hasFinePointer, prefersReducedMotion } from '../../lib/motion'
import { Magnetic } from '../shell/Magnetic'

const img = (f: string) => `${import.meta.env.BASE_URL}img/${f}`

type Side = 'left' | 'right'
type Half = {
  side: Side
  index: string
  eyebrow: string
  word: string
  line: string
  note?: string
  cta: { label: string; href: string }
  photo: { name: string; alt: string; position: string }
}

const HALVES: Half[] = [
  {
    side: 'left',
    index: '01',
    eyebrow: 'The founder',
    word: 'The founder',
    line: 'One person picks up. The same person who finds it, checks it and hands it over.',
    note: '[Client: founder’s name and title]',
    cta: { label: 'Make a request', href: '#desk' },
    photo: { name: 'founder-wall', alt: 'The founder of HPR, arms crossed, in front of a ribbed plaster wall.', position: '50% 18%' },
  },
  {
    side: 'right',
    index: '02',
    eyebrow: 'The desk',
    word: 'The desk',
    line: 'Write what you want. We find it, check it, price it and handle everything around it.',
    note: 'Open now',
    cta: { label: 'Make a request', href: '#desk' },
    photo: { name: 'rm-box', alt: 'A gloved hand setting a Richard Mille into an hpr presentation case.', position: '50% 50%' },
  },
]

const REST = 0.5
const OPEN = 0.68
const MIN = 0.32

/*
  Section 5 — the founder and the desk, split. The divide follows the pointer: the half you lean toward opens,
  its heading fills with ink and its photograph breathes; the other half compresses to a sliver with its outline
  heading still readable. Scrolling in wipes the two halves in from their own edges and draws the divider.
*/
export function Split() {
  const track = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<Side | null>(null)
  const still = prefersReducedMotion()

  /* scrubbed entrance */
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
        },
      })
      tl.fromTo('[data-half="left"]', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none', duration: 0.5 }, 0)
        .fromTo('[data-half="right"]', { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', ease: 'none', duration: 0.5 }, 0)
        .fromTo('[data-split-word]', { yPercent: 110 }, { yPercent: 0, ease: 'none', duration: 0.3, stagger: 0.05 }, 0.2)
        .fromTo('[data-split-copy]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, ease: 'none', duration: 0.2, stagger: 0.05 }, 0.35)
        .fromTo('[data-divider]', { scaleY: 0 }, { scaleY: 1, ease: 'none', duration: 0.3 }, 0.25)
    }, root)
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [still])

  /* the divide follows the pointer */
  useEffect(() => {
    const el = stage.current
    if (!el || still) return
    el.style.setProperty('--split', String(REST))
    const to = gsap.quickTo(el, '--split', { duration: 0.7, ease: 'power3.out' })
    if (hasFinePointer()) {
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width
        /* lean left → the left half widens (the divide moves right), and vice versa */
        to(Math.min(OPEN, Math.max(MIN, 0.5 + (0.5 - x) * 0.9)))
        setActive(x < 0.5 ? 'left' : 'right')
      }
      const onLeave = () => {
        to(REST)
        setActive(null)
      }
      el.addEventListener('mousemove', onMove, { passive: true })
      el.addEventListener('mouseleave', onLeave)
      return () => {
        el.removeEventListener('mousemove', onMove)
        el.removeEventListener('mouseleave', onLeave)
      }
    }
    to(active === 'left' ? OPEN : active === 'right' ? MIN : REST)
  }, [active, still])

  const tap = (side: Side) => {
    if (hasFinePointer()) return
    setActive((a) => (a === side ? null : side))
  }

  return (
    <section ref={track} id="founder" aria-labelledby="split-heading" className={`relative ${still ? '' : 'h-[180vh]'}`}>
      <h2 id="split-heading" className="sr-only">
        The founder and the desk
      </h2>
      <div ref={stage} data-stage data-ground="dark" className="sticky top-0 flex h-screen flex-col overflow-hidden bg-navy text-paper md:flex-row" style={{ ['--split' as string]: REST }}>
        {HALVES.map((half) => {
          const isLeft = half.side === 'left'
          const isActive = active === half.side
          const isDim = active !== null && !isActive
          return (
            <article
              key={half.side}
              data-half={half.side}
              data-cursor={half.eyebrow}
              onClick={() => tap(half.side)}
              className={`group relative min-h-0 shrink-0 grow-0 overflow-hidden ${isLeft ? '[flex-basis:calc(var(--split)*100%)]' : '[flex-basis:calc((1-var(--split))*100%)]'}`}
            >
              <div className={`absolute inset-0 transition-transform duration-1000 ease-[var(--ease-brand)] ${isActive ? 'scale-100' : 'scale-110'}`}>
                <picture>
                  <source type="image/webp" srcSet={`${img(`${half.photo.name}-780.webp`)} 780w, ${img(`${half.photo.name}-1170.webp`)} 1170w`} sizes="70vw" />
                  <img
                    src={img(`${half.photo.name}-780.jpg`)}
                    alt={half.photo.alt}
                    width={780}
                    height={isLeft ? 1387 : 975}
                    loading="lazy"
                    decoding="async"
                    className={`h-full w-full object-cover transition-[filter] duration-700 ${isDim ? 'saturate-50 brightness-[0.55]' : 'brightness-[0.8]'}`}
                    style={{ objectPosition: half.photo.position }}
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-navy/20" />
              </div>

              <div className={`relative flex h-full flex-col justify-end px-spine pb-12 pt-24 md:pb-16 ${isLeft ? 'items-start' : 'items-start md:items-end md:text-right'}`}>
                <p data-split-copy className="mb-3 text-[11px] font-medium tracking-[0.2em] uppercase text-gold">
                  {half.index} — {half.eyebrow}
                </p>
                {/* GSAP owns the outer spans (entrance); the pointer state lives on inner wrappers it never touches. */}
                <h3 className="relative overflow-hidden">
                  <span data-split-word className="block">
                    <span
                      className={`relative block whitespace-nowrap font-sans text-[clamp(2.6rem,7.5vw,7.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.035em] [font-stretch:88%] transition-transform duration-700 ease-[var(--ease-brand)] ${isLeft ? 'origin-bottom-left' : 'origin-bottom-left md:origin-bottom-right'} ${isDim ? 'md:scale-[0.58]' : 'scale-100'}`}
                    >
                      <span aria-hidden="true" className="absolute inset-0 [-webkit-text-fill-color:transparent] [-webkit-text-stroke:1px_#f4f3ee]">
                        {half.word}
                      </span>
                      <span className={`relative transition-opacity duration-700 ease-[var(--ease-brand)] ${isActive || active === null ? 'opacity-100' : 'opacity-0'}`}>{half.word}</span>
                    </span>
                  </span>
                </h3>
                <div data-split-copy className={`mt-5 max-w-[34ch] transition-opacity duration-500 ${isDim ? '[&>*]:opacity-0' : '[&>*]:opacity-100'}`}>
                  <p className="text-base leading-relaxed text-paper/85 transition-opacity duration-500 sm:text-lg">{half.line}</p>
                  {half.note && <p className={`mt-3 text-[12px] font-medium tracking-wide transition-opacity duration-500 ${half.note.startsWith('[') ? 'text-paper/60 outline-dashed outline-1 outline-offset-4 outline-paper/40 inline-block' : 'text-gold'}`}>{half.note}</p>}
                  <div className={`mt-6 transition-opacity duration-500 ${isLeft ? '' : 'md:flex md:justify-end'}`}>
                    <Magnetic>
                      <a href={half.cta.href} className="inline-flex h-11 items-center rounded-full bg-gold px-5 text-[13px] font-semibold tracking-wide text-navy transition-colors duration-500 ease-[var(--ease-brand)] hover:bg-paper">
                        {half.cta.label}
                      </a>
                    </Magnetic>
                  </div>
                </div>
              </div>
            </article>
          )
        })}

        <div data-divider aria-hidden="true" className="pointer-events-none absolute inset-y-0 z-10 hidden w-px origin-top bg-gold/70 md:block" style={{ left: 'calc(var(--split) * 100%)' }}>
          <span className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold/70 bg-navy/60 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          </span>
        </div>
      </div>
    </section>
  )
}
