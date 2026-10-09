import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, hasFinePointer, prefersReducedMotion } from '../../lib/motion'

type Line = { text: string; style: 'caps' | 'italic'; highlight?: string[] }

const EYEBROW = 'Hoomsuk PR Agency · Private requests'
const LINES: Line[] = [
  { text: 'If it exists, we find it.', style: 'caps', highlight: ['find'] },
  { text: 'If it’s not for sale, we ask anyway.', style: 'italic' },
  { text: 'Watches. Jets. Animals. Properties.', style: 'caps' },
  { text: 'and the things nobody lists.', style: 'italic' },
  { text: 'One desk. Handled.', style: 'caps', highlight: ['Handled.'] },
]
const PARAGRAPH = 'HPR is a request desk for private clients. Say what you want. We find it, check it, price it and handle everything around it.'

/* A word; highlighted words carry a gold block that wipes in behind them and turn navy once it has. */
function Word({ word, highlighted }: { word: string; highlighted: boolean }) {
  return (
    <span className="inline-block overflow-hidden pb-[0.06em] align-bottom">
      <span data-word className="relative inline-block will-change-transform">
        {highlighted && <span data-hl-block aria-hidden="true" className="absolute inset-x-[-0.08em] inset-y-[0.04em] origin-left bg-gold" />}
        <span data-hl-text={highlighted ? '' : undefined} className="relative px-[0.02em]">
          {word}
        </span>
      </span>
    </span>
  )
}

/*
  Section 3 — the statement. Pinned for most of two viewports: the eyebrow arrives, the words of the headline
  rise one after another, gold blocks wipe in behind the two words that matter, the paragraph and link follow.
  Everything is scrubbed, so scrolling up unbuilds it. On a fine pointer a torch of gold follows the cursor
  across the text (a multiply blend: paper letters go gold, the navy around them deepens).
*/
export function Statement() {
  const track = useRef<HTMLElement>(null)
  const torch = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = track.current
    if (!root) return
    const quick = prefersReducedMotion()
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: quick ? false : 0.5 } })
      tl.fromTo('[data-eyebrow]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.08, ease: 'none' }, 0)
        .fromTo('[data-word]', { yPercent: 115, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 0.22, ease: 'none', stagger: { each: 0.016, from: 'start' } }, 0.04)
        .fromTo('[data-hl-block]', { scaleX: 0 }, { scaleX: 1, duration: 0.12, ease: 'none', stagger: 0.14 }, 0.5)
        .to('[data-hl-text]', { color: '#0e2b4b', duration: 0.04, ease: 'none', stagger: 0.14 }, 0.56)
        .fromTo('[data-para] > span > span', { yPercent: 110 }, { yPercent: 0, duration: 0.14, ease: 'none', stagger: 0.03 }, 0.68)
        .fromTo('[data-link]', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.08, ease: 'none' }, 0.84)
        .fromTo('[data-link-line]', { scaleX: 0 }, { scaleX: 1, duration: 0.1, ease: 'none' }, 0.86)
    }, root)
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const el = torch.current
    const root = track.current
    if (!el || !root || !hasFinePointer() || prefersReducedMotion()) return
    const pos = { x: -1000, y: -1000 }
    const apply = () => {
      el.style.setProperty('--mx', `${pos.x}px`)
      el.style.setProperty('--my', `${pos.y}px`)
    }
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      gsap.to(pos, { x: e.clientX - r.left, y: e.clientY - r.top, duration: 0.35, ease: 'power3.out', overwrite: true, onUpdate: apply })
      el.style.opacity = '1'
    }
    const onLeave = () => void (el.style.opacity = '0')
    root.addEventListener('mousemove', onMove, { passive: true })
    root.addEventListener('mouseleave', onLeave)
    return () => {
      root.removeEventListener('mousemove', onMove)
      root.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  const paragraphWords = PARAGRAPH.split(' ')

  return (
    <section ref={track} aria-labelledby="statement-heading" className="relative h-[220vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-spine text-center">
        <p data-eyebrow className="mb-6 text-[11px] font-medium tracking-[0.2em] uppercase text-gold sm:mb-10 sm:text-xs">
          {EYEBROW}
        </p>

        <div className="relative max-w-[1200px]">
          <h1 id="statement-heading" className="leading-[0.98] text-paper">
            {LINES.map((line, i) => (
              <span
                key={i}
                className={
                  line.style === 'caps'
                    ? 'block font-sans text-[clamp(2.3rem,6.6vw,6.4rem)] font-extrabold uppercase tracking-[-0.03em]'
                    : 'block font-display text-[clamp(2.3rem,6.6vw,6.4rem)] italic tracking-[-0.01em] text-paper/90'
                }
              >
                {line.text.split(' ').map((word, j) => (
                  <span key={j}>
                    <Word word={word} highlighted={Boolean(line.highlight?.includes(word.toLowerCase()) || line.highlight?.includes(word))} />{' '}
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <div
            ref={torch}
            aria-hidden="true"
            className="pointer-events-none absolute -inset-[20%] opacity-0 mix-blend-multiply transition-opacity duration-500"
            style={{
              background: 'radial-gradient(260px circle at var(--mx, -1000px) var(--my, -1000px), rgba(209,173,101,0.95) 0%, rgba(209,173,101,0.5) 35%, transparent 70%)',
            }}
          />
        </div>

        <p data-para className="mt-8 max-w-[44ch] text-balance text-base leading-relaxed text-paper/80 sm:mt-12 sm:text-lg">
          {paragraphWords.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom">
              <span className="inline-block">{w}&nbsp;</span>
            </span>
          ))}
        </p>

        <a data-link href="#desk" className="group relative mt-8 inline-block text-sm font-semibold tracking-wide text-gold sm:mt-10">
          Make a request
          <span data-link-line aria-hidden="true" className="absolute inset-x-0 -bottom-1 h-px origin-left bg-gold transition-transform duration-500 ease-[var(--ease-brand)] group-hover:scale-x-0 group-hover:[transform-origin:right]" />
        </a>
      </div>
    </section>
  )
}
