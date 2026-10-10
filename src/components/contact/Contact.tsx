import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, hasFinePointer, prefersReducedMotion } from '../../lib/motion'
import { Magnetic } from '../shell/Magnetic'
import { PixelPortrait } from './PixelPortrait'

const LOGO = `${import.meta.env.BASE_URL}hpr-logo.png`
const PORTRAIT = `${import.meta.env.BASE_URL}img/founder-sofa-4x5-780.jpg`

const HEADLINE = 'Say the word.'
const COLUMNS = [
  { heading: 'Office', lines: ['[Client: office address]', '[Client: city]'] },
  { heading: 'Reach', lines: ['[Client: WhatsApp number]', '[Client: telephone]', 'hello@hpr.com'] },
  { heading: 'Follow', lines: ['[Client: Instagram handle]', '[Client: TikTok handle]'] },
  { heading: 'Registered', lines: ['[Client: registered company name]', '[Client: RC number]'] },
]
const TICKER = ['Watches', 'Private jets', 'Animals', 'Properties', 'If it exists, ask']

/* A hard-edged button with a stepped pixel shadow; the shadow deepens by one pixel step on hover. */
const PIXEL_BTN = 'inline-flex h-12 items-center px-6 font-pixel text-[13px] uppercase tracking-[0.08em] transition-[transform,box-shadow] duration-150 ease-steps hover:-translate-x-[2px] hover:-translate-y-[2px]'

/*
  Section 7 — contact, in pixels. The founder assembles cell by cell as the room scrolls in and scatters from the
  pointer; the headline types itself in a pixel face with a blinking block cursor; the edge where the navy desk
  meets this dark room is stepped like a sprite's outline.
*/
export function Contact() {
  const root = useRef<HTMLElement>(null)
  const still = prefersReducedMotion()

  useEffect(() => {
    const el = root.current
    if (!el || still) return
    const ctx = gsap.context(() => {
      const letters = el.querySelectorAll<HTMLElement>('[data-letter]')
      gsap.set(letters, { opacity: 0 })
      gsap.to(letters, { opacity: 1, duration: 0.01, stagger: 0.07, ease: 'none', scrollTrigger: { trigger: '[data-headline]', start: 'top 80%', toggleActions: 'play none none reverse' } })
      gsap.fromTo('[data-contact-block]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'steps(6)', stagger: 0.1, scrollTrigger: { trigger: '[data-contact-grid]', start: 'top 85%', toggleActions: 'play none none reverse' } })
    }, el)
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [still])

  return (
    <footer ref={root} id="contact" data-ground="dark" aria-labelledby="contact-heading" className="relative bg-ink text-paper">
      {/* stepped edge: the navy of the desk comes down into this room like a sprite's outline */}
      <div aria-hidden="true" className="pixel-edge absolute inset-x-0 top-0 h-8 bg-navy" />

      <div className="relative mx-auto grid max-w-[1320px] gap-12 px-spine pt-28 pb-10 lg:grid-cols-12 lg:gap-x-10 lg:pt-36">
        <div className="lg:col-span-4">
          <PixelPortrait src={PORTRAIT} />
          <p className="mt-3 font-pixel text-[10px] uppercase tracking-[0.12em] text-paper/50">{hasFinePointer() ? 'The founder · move over him' : 'The founder'}</p>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <p className="mb-4 font-pixel text-[11px] uppercase tracking-[0.12em] text-gold">07 — Contact</p>
          <h2 id="contact-heading" data-headline className="font-pixel text-[clamp(2rem,6vw,5rem)] font-bold uppercase leading-[1.05] text-paper">
            {HEADLINE.split(' ').map((word, w, words) => (
              <span key={word} className="inline-block whitespace-nowrap">
                {word.split('').map((ch, i) => (
                  <span key={i} data-letter>
                    {ch}
                  </span>
                ))}
                {w === words.length - 1 ? <span aria-hidden="true" className="pixel-cursor ml-[0.1em] inline-block h-[0.85em] w-[0.5em] translate-y-[0.1em] bg-gold" /> : null}
              </span>
            )).flatMap((el, w, all) => (w < all.length - 1 ? [el, ' '] : [el]))}
          </h2>
          <p className="mt-6 max-w-[42ch] text-base leading-relaxed text-paper/75 sm:text-lg">
            One desk, one number, one email. Write what you want and it is handled.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Magnetic>
              <a href="#desk" className={`${PIXEL_BTN} bg-gold text-navy shadow-[4px_4px_0_0_#f4f3ee] hover:shadow-[6px_6px_0_0_#f4f3ee]`}>
                Make a request
              </a>
            </Magnetic>
            <a href="mailto:hello@hpr.com" className={`${PIXEL_BTN} border-2 border-paper/70 text-paper shadow-[4px_4px_0_0_#d1ad65] hover:shadow-[6px_6px_0_0_#d1ad65]`}>
              Email the desk
            </a>
          </div>

          <div data-contact-grid className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.heading} data-contact-block>
                <h3 className="font-pixel text-[11px] uppercase tracking-[0.12em] text-gold">{col.heading}</h3>
                <ul className="mt-3 space-y-2 text-[13px] leading-snug text-paper/80">
                  {col.lines.map((line) => (
                    <li key={line} className={line.startsWith('[') ? 'inline-block text-paper/55 outline-dashed outline-1 outline-offset-2 outline-paper/30' : ''}>
                      {line.includes('@') ? (
                        <a href={`mailto:${line}`} className="underline underline-offset-4 hover:text-gold">
                          {line}
                        </a>
                      ) : (
                        line
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* the pixel ticker */}
      <div aria-hidden="true" className="relative overflow-hidden border-y border-paper/10 py-3">
        <div className="ticker flex w-max font-pixel text-[11px] uppercase tracking-[0.14em] text-paper/60">
          {[0, 1].map((k) => (
            <span key={k} className="flex shrink-0">
              {TICKER.map((t) => (
                <span key={t} className="px-6">
                  {t}
                  <span className="ml-6 inline-block h-[6px] w-[6px] bg-gold align-middle" />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="relative mx-auto flex max-w-[1320px] flex-wrap items-end justify-between gap-6 px-spine py-8">
        <img src={LOGO} alt="hpr — Hoomsuk PR Agency" width={518} height={376} loading="lazy" decoding="async" className="h-14 w-auto sm:h-16" />
        <p className="font-pixel text-[10px] uppercase tracking-[0.12em] text-paper/45">2026 Hoomsuk PR Agency</p>
      </div>
    </footer>
  )
}
