import { useEffect, useRef } from 'react'
import { ScrubVideo } from '../../ScrubVideo'
import { Pattern } from '../shell/Pattern'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/motion'

const MASK = `${import.meta.env.BASE_URL}img/hpr-wordmark-mask.png`

const ROW_ONE = 'If it is rare, hard to reach, or not for sale —'
const ROW_TWO = 'ask HPR. Watches. Private jets. Animals. Properties.'

/*
  The geometry of the shrink, measured from the stage itself (not window.inner*, which drifts with phone browser
  chrome). The square crop is the largest square in the stage; on a portrait screen it is biased upward so the
  face, not the chest, is what the card keeps. The card is 44vw on a phone, capped at 18rem.
*/
function geometry(stage: HTMLElement) {
  const w = stage.clientWidth
  const h = stage.clientHeight
  const side = Math.min(w, h)
  const insetX = (w - side) / 2
  const insetTop = h > w ? (h - side) * 0.32 : 0
  const insetBottom = h - side - insetTop
  const card = Math.min(w * 0.44, 288)
  const originY = insetTop + side / 2
  return { side, insetX, insetTop, insetBottom, card, originY, landY: h / 2 - originY }
}

function Marquee({ text, direction, className }: { text: string; direction: 'left' | 'right'; className: string }) {
  const copy = Array.from({ length: 2 }, (_, i) => (
    <span key={i} className="shrink-0 pr-[0.6em]" aria-hidden={i > 0}>
      {text}
    </span>
  ))
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <div className={`flex w-max ${direction === 'left' ? 'marquee-left' : 'marquee-right'} ${className}`}>{copy}</div>
    </div>
  )
}

/* The small card bottom-left of the hero, where Lando's "next race" sits: the desk is open. */
function DeskCard() {
  return (
    <a
      href="#desk"
      data-hero-card
      className="group absolute bottom-8 left-spine z-20 flex w-[7.5rem] flex-col gap-3 rounded-md border border-navy/15 bg-paper/85 p-3 text-navy shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-colors duration-500 ease-[var(--ease-brand)] hover:bg-navy hover:text-paper sm:bottom-10"
    >
      <span className="text-[10px] font-medium tracking-[0.18em] uppercase opacity-70">Request desk</span>
      <span
        aria-hidden="true"
        className="h-10 w-14 bg-navy transition-colors duration-500 ease-[var(--ease-brand)] group-hover:bg-gold"
        style={{ maskImage: `url(${MASK})`, WebkitMaskImage: `url(${MASK})`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat' }}
      />
      <span className="flex items-center gap-2 text-[11px] font-medium">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        Open now
      </span>
    </a>
  )
}

/*
  Section 1 → 2. The hero is pinned for a second viewport. As the visitor scrolls, the full-screen video crops to a
  square and shrinks — continuously, scrubbed — until it sits as a small card in the centre of the navy room behind
  it, where two rows of marquee have risen. The card is still the video: he keeps following the cursor.
*/
export function Hero() {
  const track = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = track.current
    if (!root) return
    const quick = prefersReducedMotion()
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: quick ? false : 0.6,
          invalidateOnRefresh: true,
          /* the header reads navy on the grey video, paper once the navy room shows around it */
          onUpdate: (self) => root.firstElementChild?.setAttribute('data-ground', self.progress > 0.3 ? 'dark' : 'hero'),
        },
      })
      const stage = root.firstElementChild as HTMLElement
      tl.fromTo(
        '[data-hero-video]',
        { scale: 1, y: 0, clipPath: 'inset(0px 0px 0px 0px round 0px)', transformOrigin: () => `50% ${geometry(stage).originY}px` },
        {
          scale: () => geometry(stage).card / geometry(stage).side,
          y: () => geometry(stage).landY,
          clipPath: () => {
            const g = geometry(stage)
            return `inset(${g.insetTop}px ${g.insetX}px ${g.insetBottom}px ${g.insetX}px round ${Math.round(8 * (g.side / g.card))}px)`
          },
          transformOrigin: () => `50% ${geometry(stage).originY}px`,
          ease: 'none',
          duration: 0.65,
        },
        0,
      )
        .to('[data-hero-card]', { y: 40, opacity: 0, ease: 'none', duration: 0.2 }, 0)
        .fromTo('[data-row-one]', { opacity: 0, xPercent: 4 }, { opacity: 1, xPercent: -8, ease: 'none', duration: 1 }, 0.1)
        .fromTo('[data-row-two]', { opacity: 0, xPercent: -4 }, { opacity: 1, xPercent: 8, ease: 'none', duration: 1 }, 0.1)
        .fromTo('[data-hero-frame]', { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.2 }, 0.45)
        .fromTo('[data-hero-caption]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, ease: 'none', duration: 0.2 }, 0.7)
    }, root)
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [])

  return (
    <section ref={track} id="top" aria-label="HPR" className="relative h-[200vh]">
      <div data-ground="hero" className="sticky top-0 h-screen overflow-hidden bg-navy">
        {/* the room behind: navy, the lattice, two rows of marquee */}
        <div className="absolute inset-0 text-paper">
          <Pattern line="#d1ad65" dot="#d1ad65" lineOpacity={0.2} dotOpacity={0.4} />
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 select-none">
            <div data-row-one>
              <Marquee text={ROW_ONE} direction="left" className="font-sans text-[clamp(3rem,10vw,9.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-paper" />
            </div>
            <div data-row-two className="mt-2 sm:mt-4">
              <Marquee text={ROW_TWO} direction="right" className="font-display text-[clamp(3rem,10vw,9.5rem)] italic leading-[0.95] text-gold" />
            </div>
          </div>
        </div>

        {/* the card's shadow and caption sit under the video and fade in as it lands */}
        <div data-hero-frame className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: 'min(44vw, 18rem)', height: 'min(44vw, 18rem)' }}>
          <div className="absolute inset-0 rounded-lg shadow-[0_40px_90px_rgba(0,0,0,0.55)]" />
          <p data-hero-caption className="absolute top-full left-0 right-0 mt-4 flex items-center justify-between text-[11px] font-medium tracking-[0.18em] uppercase text-paper/80">
            <span>A word from the founder</span>
            <span className="text-gold">01</span>
          </p>
        </div>

        {/* the hero itself: full screen at rest, a square card by the end of the track */}
        <div data-hero-video data-cursor="Move" className="absolute inset-0 z-10 origin-center bg-studio will-change-transform">
          <ScrubVideo />
        </div>
        <DeskCard />
      </div>
    </section>
  )
}
