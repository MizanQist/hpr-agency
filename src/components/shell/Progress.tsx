import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../lib/motion'

/* A hairline of gold along the top edge that fills as the page is read. */
export function Progress() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const tween = gsap.fromTo(ref.current, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.4 } })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])
  useEffect(() => void ScrollTrigger.refresh(), [])
  return <div ref={ref} aria-hidden="true" className="pointer-events-none fixed top-0 left-0 z-[60] h-[2px] w-full origin-left bg-gold" />
}
