import { useEffect, useRef } from 'react'
import { ScrubVideo } from '../../ScrubVideo'
import { Pattern } from '../shell/Pattern'
import { Kinetic } from './Kinetic'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/motion'

const MASK = `${import.meta.env.BASE_URL}img/hpr-wordmark-mask.png`

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
  it, where the kinetic type has arrived around it. The card is still the video: he keeps following the cursor.
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
        /* kinetic type: lines slide in from alternating sides while their letters widen and gain weight */
        .fromTo('[data-k-line="0"]', { xPercent: -60, opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'none', duration: 0.25 }, 0.12)
        .fromTo('[data-k-line="0"] [data-k-word]', { fontVariationSettings: "'wdth' 75, 'wght' 300" }, { fontVariationSettings: "'wdth' 100, 'wght' 760", ease: 'none', duration: 0.25, stagger: 0.02 }, 0.14)
        .fromTo('[data-k-line="1"]', { xPercent: 60, opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'none', duration: 0.25 }, 0.22)
        .fromTo('[data-k-line="1"] [data-k-word]', { fontVariationSettings: "'wdth' 75, 'wght' 300" }, { fontVariationSettings: "'wdth' 100, 'wght' 760", ease: 'none', duration: 0.25, stagger: 0.02 }, 0.24)
        .fromTo('[data-k-line="2"]', { xPercent: -60, opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'none', duration: 0.25 }, 0.32)
        .fromTo('[data-k-line="2"] [data-k-word]', { fontVariationSettings: "'wdth' 75, 'wght' 300" }, { fontVariationSettings: "'wdth' 100, 'wght' 760", ease: 'none', duration: 0.25, stagger: 0.02 }, 0.34)
        .fromTo('[data-k-line="3"]', { scale: 0.4, opacity: 0, y: 60 }, { scale: 1, opacity: 1, y: 0, ease: 'none', duration: 0.22 }, 0.58)
        .fromTo('[data-k-line="4"]', { letterSpacing: '0.9em', opacity: 0 }, { letterSpacing: '0.3em', opacity: 1, ease: 'none', duration: 0.18 }, 0.74)
        .fromTo('[data-hero-frame]', { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.2 }, 0.45)
        .fromTo('[data-hero-caption]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, ease: 'none', duration: 0.2 }, 0.7)
    }, root)
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [])

  return (
    <section ref={track} id="top" aria-label="HPR" className="relative h-[200vh]">
      <div data-ground="hero" className="sticky top-0 h-screen overflow-hidden bg-navy">
        {/* the room behind: navy, the lattice, kinetic type around the landing spot */}
        <div className="absolute inset-0 text-paper">
          <Pattern line="#d1ad65" dot="#d1ad65" lineOpacity={0.2} dotOpacity={0.4} />
          <Kinetic />
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
