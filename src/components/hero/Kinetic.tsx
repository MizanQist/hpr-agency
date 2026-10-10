import { useEffect, useRef } from 'react'
import { gsap, hasFinePointer, prefersReducedMotion } from '../../lib/motion'

/*
  Kinetic type for the room the hero shrinks into. Three lines above the card and the punchline below it.
  Entrance is scrubbed by the hero's timeline (see Hero.tsx, which targets [data-k-line]); afterwards the words keep
  moving: letters near the pointer widen and thicken on Mona Sans's width and weight axes.
*/
const LINES_TOP = ['If it is rare,', 'hard to reach,', 'or not for sale —']
const PUNCH = 'Ask HPR.'
const CATEGORIES = ['Watches', 'Private jets', 'Cars', 'Animals', 'Properties']

const REST = "'wdth' 100, 'wght' 760"

function Words({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <span key={i} data-k-word className={`inline-block will-change-[font-variation-settings] ${className ?? ''}`} style={{ fontVariationSettings: REST }}>
          {w}
          {i < text.split(' ').length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  )
}

export function Kinetic() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el || !hasFinePointer() || prefersReducedMotion()) return
    const words = [...el.querySelectorAll<HTMLElement>('[data-k-word]')]
    const onMove = (e: MouseEvent) => {
      for (const w of words) {
        const r = w.getBoundingClientRect()
        const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2))
        const k = Math.max(0, 1 - d / 320)
        gsap.to(w, { fontVariationSettings: `'wdth' ${100 + 25 * k}, 'wght' ${760 + 140 * k}`, duration: 0.5, ease: 'power3.out', overwrite: 'auto' })
      }
    }
    const onLeave = () => words.forEach((w) => gsap.to(w, { fontVariationSettings: REST, duration: 0.9, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' }))
    const stage = el.parentElement ?? el
    stage.addEventListener('mousemove', onMove, { passive: true })
    stage.addEventListener('mouseleave', onLeave)
    return () => {
      stage.removeEventListener('mousemove', onMove)
      stage.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div ref={root} aria-hidden="true" className="absolute inset-0 flex select-none flex-col justify-center px-spine text-paper">
      <div className="space-y-[0.04em] font-sans text-[clamp(1.75rem,4.8vw,4.4rem)] uppercase leading-[0.92] tracking-[-0.03em]">
        {LINES_TOP.map((line, i) => (
          <p key={i} data-k-line={i} className={`whitespace-nowrap ${i === 1 ? 'text-right' : i === 2 ? 'text-center' : 'text-left'}`}>
            <Words text={line} />
          </p>
        ))}
      </div>

      {/* the card lands here, with its caption beneath */}
      <div aria-hidden="true" className="h-[calc(min(44vw,18rem)+11rem)] sm:h-[calc(min(44vw,18rem)+6.5rem)]" />

      <p data-k-line={3} className="text-center font-display text-[clamp(3rem,9.5vw,8.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.04em] text-gold">
        {PUNCH}
      </p>
      <p data-k-line={4} className="mt-3 flex flex-wrap justify-center gap-x-[1.4em] gap-y-1 font-sans text-[clamp(0.65rem,1.05vw,0.9rem)] font-semibold uppercase tracking-[0.3em] text-paper/70 sm:mt-5">
        {CATEGORIES.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </p>
    </div>
  )
}
