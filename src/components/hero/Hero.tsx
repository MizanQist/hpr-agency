import { useEffect, useRef } from 'react'
import { ScrubVideo } from '../../ScrubVideo'
import { Pattern } from '../shell/Pattern'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/motion'

const MASK = `${import.meta.env.BASE_URL}img/hpr-wordmark-mask.png`
const img = (f: string) => `${import.meta.env.BASE_URL}img/${f}`

const ROW_ONE = 'If it is rare, hard to reach, or not for sale —'
const ROW_TWO = 'ask HPR. Watches. Private jets. Animals. Properties.'

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
      className="group absolute bottom-8 left-spine z-10 flex w-[7.5rem] flex-col gap-3 rounded-md border border-navy/15 bg-paper/85 p-3 text-navy shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-colors duration-500 ease-[var(--ease-brand)] hover:bg-navy hover:text-paper sm:bottom-10"
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
  The hero is pinned for a second viewport. As the visitor scrolls, the video eases back and dims while a navy panel
  with two rows of marquee and a word from the founder rises over it — the room changes before the page does.
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
          /* the header reads navy on the grey video, paper once the navy panel has risen behind it */
          onUpdate: (self) => root.firstElementChild?.setAttribute('data-ground', self.progress > 0.35 ? 'dark' : 'hero'),
        },
      })
      tl.fromTo('[data-hero-panel]', { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', ease: 'none', duration: 0.6 }, 0)
        .to('[data-hero-video]', { scale: 0.92, filter: 'brightness(0.55)', ease: 'none', duration: 0.6 }, 0)
        .to('[data-hero-card]', { y: 40, opacity: 0, ease: 'none', duration: 0.25 }, 0)
        .fromTo('[data-row-one]', { xPercent: 0 }, { xPercent: -8, ease: 'none', duration: 1 }, 0)
        .fromTo('[data-row-two]', { xPercent: 0 }, { xPercent: 8, ease: 'none', duration: 1 }, 0)
        .fromTo('[data-founder-card]', { y: 120, scale: 0.86, opacity: 0 }, { y: 0, scale: 1, opacity: 1, ease: 'none', duration: 0.4 }, 0.5)
        .fromTo('[data-founder-label]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, ease: 'none', duration: 0.2 }, 0.75)
    }, root)
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [])

  return (
    <section ref={track} id="top" aria-label="HPR" className="relative h-[200vh]">
      <div data-ground="hero" className="sticky top-0 h-screen overflow-hidden bg-studio">
        <div data-hero-video data-cursor="Move" className="absolute inset-0 origin-center will-change-transform">
          <ScrubVideo />
        </div>
        <DeskCard />

        <div data-hero-panel className="absolute inset-0 bg-navy text-paper" style={{ clipPath: 'inset(100% 0 0 0)' }}>
          <Pattern line="#d1ad65" dot="#d1ad65" lineOpacity={0.2} dotOpacity={0.4} />
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 select-none">
            <div data-row-one>
              <Marquee text={ROW_ONE} direction="left" className="font-sans text-[clamp(3rem,10vw,9.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-paper" />
            </div>
            <div data-row-two className="mt-2 sm:mt-4">
              <Marquee text={ROW_TWO} direction="right" className="font-display text-[clamp(3rem,10vw,9.5rem)] italic leading-[0.95] text-gold" />
            </div>
          </div>

          <figure data-founder-card className="absolute left-1/2 top-1/2 w-[min(44vw,16rem)] -translate-x-1/2 -translate-y-1/2 sm:w-[min(26vw,19rem)]">
            <div className="overflow-hidden rounded-sm shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <picture>
                <source type="image/webp" srcSet={`${img('founder-wall-4x5-780.webp')} 780w`} />
                <img src={img('founder-wall-4x5-780.jpg')} alt="The founder of HPR, arms crossed, in front of a ribbed plaster wall." width={780} height={975} loading="lazy" decoding="async" className="block h-auto w-full" />
              </picture>
            </div>
            <figcaption data-founder-label className="mt-3 flex items-center justify-between text-[11px] font-medium tracking-[0.18em] uppercase text-paper/80">
              <span>A word from the founder</span>
              <span className="text-gold">01</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
