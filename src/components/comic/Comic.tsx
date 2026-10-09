import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, hasFinePointer, prefersReducedMotion } from '../../lib/motion'
import { setNavTheme } from '../../lib/theme'
import { Magnetic } from '../shell/Magnetic'

const img = (f: string) => `${import.meta.env.BASE_URL}img/${f}`

type Panel = {
  photo: string
  alt: string
  caption?: string
  bubble?: { line: string; alt: string; tail: 'left' | 'right' }
  burst: string
  rotate: number
}

const PANELS: Panel[] = [
  {
    photo: 'rm-case',
    alt: 'An open hpr presentation case, the watch cushion empty.',
    caption: 'A Tuesday. The desk phone rings.',
    bubble: { line: 'Richard Mille. RM 029 Le Mans. One hundred and fifty made. “Sold out”, they said.', alt: '…and that was the easy part.', tail: 'left' },
    burst: 'RING!',
    rotate: -1.5,
  },
  {
    photo: 'founder-wall-4x5',
    alt: 'The founder of HPR, arms crossed, in front of a ribbed plaster wall.',
    bubble: { line: 'Give me a week.', alt: 'Make it five days.', tail: 'right' },
    burst: 'ON IT.',
    rotate: 1.2,
  },
  {
    photo: 'rm-lift',
    alt: 'Gloved hands lifting the green RM 029 out of the hpr case.',
    caption: 'Checked. Priced. Boxed.',
    burst: 'FOUND.',
    rotate: 1.5,
  },
  {
    photo: 'rm-held',
    alt: 'The RM 029 Le Mans held up close, limited to 150 pieces.',
    caption: 'Delivered.',
    burst: 'HANDLED.',
    rotate: -1,
  },
]

/* A starburst outline for the sound effects: alternating outer and inner points. */
function star(points: number, inner: number): string {
  const pts: string[] = []
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? 50 : 50 * inner
    const a = (Math.PI * i) / points - Math.PI / 2
    pts.push(`${(50 + r * Math.cos(a)).toFixed(1)}% ${(50 + r * Math.sin(a)).toFixed(1)}%`)
  }
  return `polygon(${pts.join(', ')})`
}
const STAR = star(14, 0.72)

function Burst({ text, className }: { text: string; className: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const pop = () => {
    if (!ref.current) return
    gsap.fromTo(ref.current, { scale: 0.6, rotate: -22 }, { scale: 1, rotate: -8, duration: 0.9, ease: 'elastic.out(1, 0.45)' })
  }
  return (
    <div data-burst className={`absolute z-20 ${className}`}>
      <Magnetic strength={0.25}>
        <button
          type="button"
          onClick={pop}
          aria-label={`Sound effect: ${text}`}
          className="relative block h-[7.5rem] w-[7.5rem] -rotate-[8deg] sm:h-36 sm:w-36"
        >
          <span ref={ref} className="absolute inset-0 block">
            <span aria-hidden="true" className="absolute -inset-[6%] block bg-navy" style={{ clipPath: STAR }} />
            <span aria-hidden="true" className="absolute inset-0 block bg-gold" style={{ clipPath: STAR }} />
            <span className="absolute inset-0 flex items-center justify-center font-comic text-[1.9rem] leading-none tracking-wide text-navy sm:text-4xl">{text}</span>
          </span>
        </button>
      </Magnetic>
    </div>
  )
}

function Bubble({ line, alt, tail }: { line: string; alt: string; tail: 'left' | 'right' }) {
  const [flipped, setFlipped] = useState(false)
  const ref = useRef<HTMLButtonElement>(null)
  const flip = () => {
    setFlipped((f) => !f)
    if (ref.current && !prefersReducedMotion()) gsap.fromTo(ref.current, { rotateX: -70, scale: 0.92 }, { rotateX: 0, scale: 1, duration: 0.6, ease: 'back.out(2)' })
  }
  return (
    <button
      ref={ref}
      type="button"
      onClick={flip}
      data-bubble
      aria-pressed={flipped}
      className={`relative z-10 max-w-[18rem] rounded-[1.4rem] border-[3px] border-navy bg-paper px-5 py-3 text-left text-[15px] font-semibold leading-snug text-navy shadow-[4px_4px_0_0_#0e2b4b] transition-transform duration-300 hover:-translate-y-0.5 sm:text-base ${tail === 'left' ? 'self-start' : 'self-end'}`}
      style={{ transformOrigin: tail === 'left' ? 'bottom left' : 'bottom right' }}
    >
      {flipped ? alt : line}
      <span aria-hidden="true" className={`absolute -bottom-[14px] h-6 w-6 rotate-45 border-b-[3px] border-r-[3px] border-navy bg-paper ${tail === 'left' ? 'left-7' : 'right-7'}`} />
    </button>
  )
}

/*
  Section 3 — the story, told as a comic. Four panels of the RM 029 delivery stamp in as the page scrolls,
  captions slide, bubbles pop and the sound effects spring up. Photographs are posterised with a halftone screen.
*/
export function Comic() {
  const track = useRef<HTMLElement>(null)
  const still = prefersReducedMotion()

  useEffect(() => {
    const root = track.current
    if (!root || still) return
    const mm = gsap.matchMedia()
    const stamp = (tl: gsap.core.Timeline, i: number, at: number, step: number) => {
      const p = `[data-panel="${i}"]`
      tl.fromTo(p, { scale: 1.25, opacity: 0, rotate: PANELS[i].rotate + 7 }, { scale: 1, opacity: 1, rotate: PANELS[i].rotate, duration: step * 0.35, ease: 'back.out(1.8)' }, at)
        .fromTo(`${p} [data-caption]`, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: step * 0.2, ease: 'power3.out' }, at + step * 0.25)
        .fromTo(`${p} [data-bubble]`, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: step * 0.3, ease: 'back.out(2.2)' }, at + step * 0.35)
        .fromTo(`${p} [data-burst]`, { scale: 0, rotate: -40, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: step * 0.4, ease: 'elastic.out(1, 0.5)' }, at + step * 0.5)
    }

    mm.add('(min-width: 1024px)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.4,
          onEnter: () => setNavTheme('light'),
          onEnterBack: () => setNavTheme('light'),
          onLeaveBack: () => setNavTheme('dark'),
        },
      })
      tl.fromTo('[data-title] > span', { scale: 0.5, rotate: -6, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.07, ease: 'back.out(2)', stagger: 0.012 }, 0)
      PANELS.forEach((_, i) => stamp(tl, i, 0.12 + i * 0.2, 0.2))
      tl.fromTo('[data-cta]', { scale: 0.6, opacity: 0, rotate: 4 }, { scale: 1, opacity: 1, rotate: -2, duration: 0.06, ease: 'back.out(2)' }, 0.93)
    })

    mm.add('(max-width: 1023px)', () => {
      ScrollTrigger.create({ trigger: root, start: 'top 60%', end: 'bottom 40%', onEnter: () => setNavTheme('light'), onEnterBack: () => setNavTheme('light'), onLeaveBack: () => setNavTheme('dark') })
      gsap.fromTo('[data-title] > span', { scale: 0.5, rotate: -6, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.6, ease: 'back.out(2)', stagger: 0.05, scrollTrigger: { trigger: '[data-title]', start: 'top 80%', toggleActions: 'play none none reverse' } })
      PANELS.forEach((_, i) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: `[data-panel="${i}"]`, start: 'top 78%', toggleActions: 'play none none reverse' } })
        stamp(tl, i, 0, 2.2)
      })
      gsap.fromTo('[data-cta]', { scale: 0.6, opacity: 0, rotate: 4 }, { scale: 1, opacity: 1, rotate: -2, duration: 0.6, ease: 'back.out(2)', scrollTrigger: { trigger: '[data-cta]', start: 'top 90%', toggleActions: 'play none none reverse' } })
    })

    return () => mm.revert()
  }, [still])

  /* The halftone drifts with the pointer, like a printed page catching the light. */
  useEffect(() => {
    const root = track.current
    if (!root || still || !hasFinePointer()) return
    const dots = root.querySelector<HTMLElement>('[data-halftone]')
    if (!dots) return
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 24
      const y = (e.clientY / window.innerHeight - 0.5) * 24
      gsap.to(dots, { x, y, duration: 0.8, ease: 'power3.out' })
    }
    root.addEventListener('mousemove', onMove, { passive: true })
    return () => root.removeEventListener('mousemove', onMove)
  }, [still])

  const title = 'One Tuesday at the desk'.split(' ')

  const panels = PANELS.map((panel, i) => (
    <article
      key={panel.photo}
      data-panel={i}
      data-cursor="Read"
      className="group relative flex aspect-[4/5] flex-col justify-between border-[4px] border-navy bg-navy p-3 shadow-[10px_10px_0_0_#0e2b4b] transition-[transform,box-shadow] duration-500 ease-[var(--ease-brand)] hover:-translate-y-2 hover:shadow-[16px_16px_0_0_#0e2b4b] sm:p-4"
      style={{ rotate: `${panel.rotate}deg` }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <picture>
          <source type="image/webp" srcSet={`${img(`${panel.photo}-780.webp`)} 780w, ${img(`${panel.photo}-1170.webp`)} 1170w`} sizes="(min-width: 1024px) 34vw, 86vw" />
          <img
            src={img(`${panel.photo}-780.jpg`)}
            alt={panel.alt}
            width={780}
            height={975}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-brand)] group-hover:scale-[1.04]"
            style={{ filter: 'url(#comic-ink) contrast(1.15) saturate(1.25)' }}
          />
        </picture>
        <div aria-hidden="true" className="halftone absolute inset-0 mix-blend-multiply opacity-40" />
      </div>

      {panel.caption ? (
        <p data-caption className="relative z-10 self-start border-[3px] border-navy bg-gold px-3 py-1.5 font-comic text-[1.35rem] leading-none tracking-wide text-navy shadow-[4px_4px_0_0_#0e2b4b] sm:text-2xl">
          {panel.caption}
        </p>
      ) : (
        <span />
      )}
      {panel.bubble && <Bubble {...panel.bubble} />}
      <Burst text={panel.burst} className={i % 2 === 0 ? '-top-6 -right-2' : 'top-14 -right-2'} />
    </article>
  ))

  return (
    <section ref={track} id="story" aria-labelledby="story-heading" className={`relative bg-paper text-navy ${still ? '' : 'lg:h-[340vh]'}`}>
      {/* posterise: six levels per channel, then the CSS contrast/saturation on top */}
      <svg aria-hidden="true" className="absolute h-0 w-0">
        <filter id="comic-ink" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues="0.08 0.26 0.44 0.62 0.8 0.98" />
            <feFuncG type="discrete" tableValues="0.08 0.26 0.44 0.62 0.8 0.98" />
            <feFuncB type="discrete" tableValues="0.08 0.26 0.44 0.62 0.8 0.98" />
          </feComponentTransfer>
        </filter>
      </svg>

      <div className={`${still ? '' : 'lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden'} relative`}>
        <div data-halftone aria-hidden="true" className="halftone-page pointer-events-none absolute -inset-6" />

        <div className="relative mx-auto flex max-w-[1520px] flex-col px-spine pb-20 pt-28 lg:h-full lg:justify-center lg:pt-24 lg:pb-8">
          <header className="mb-10 lg:mb-6">
            <p className="mb-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-navy/60">HPR presents</p>
            <h2 id="story-heading" data-title className="font-comic text-[clamp(2.6rem,7.5vw,5.75rem)] leading-[0.9] tracking-wide text-navy [text-shadow:4px_4px_0_#d1ad65]">
              {title.map((w, i) => (
                <span key={i} className="inline-block origin-bottom-left">
                  {w}&nbsp;
                </span>
              ))}
            </h2>
          </header>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:[&>*:nth-child(even)]:translate-y-8">
            {panels}
          </div>

          <div className="mt-12 flex justify-center lg:mt-10">
            <Magnetic>
              <a
                data-cta
                href="#desk"
                className="inline-flex h-12 items-center border-[3px] border-navy bg-gold px-6 font-comic text-xl tracking-wide text-navy shadow-[5px_5px_0_0_#0e2b4b] transition-[transform,box-shadow] duration-300 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_#0e2b4b]"
              >
                Your turn. Make a request.
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  )
}
