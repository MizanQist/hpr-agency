import { useEffect, useRef } from 'react'
import { gsap, hasFinePointer } from '../../lib/motion'

/*
  A dot that sits exactly on the pointer and a ring that chases it. The ring widens over anything clickable
  and reads a label from [data-cursor] (the gallery uses "Drag", the hero "Move"). Touch devices never see it.
*/
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!hasFinePointer() || !dot.current || !ring.current || !label.current) return
    const root = document.documentElement
    root.classList.add('has-cursor')
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const eased = { x: target.x, y: target.y }
    let scale = 1
    let shown = false

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX
      target.y = e.clientY
      if (!shown) {
        shown = true
        eased.x = target.x
        eased.y = target.y
        gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.4 })
      }
      dot.current!.style.transform = `translate(${target.x}px, ${target.y}px)`
    }
    const onOver = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('a, button, [data-cursor]')
      const text = el?.dataset.cursor ?? ''
      label.current!.textContent = text
      scale = text ? 3.2 : el ? 1.8 : 1
      ring.current!.classList.toggle('is-active', Boolean(el))
    }
    const onLeave = () => gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.3 })
    const onEnter = () => gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.3 })
    const tick = () => {
      eased.x += (target.x - eased.x) * 0.16
      eased.y += (target.y - eased.y) * 0.16
      ring.current!.style.transform = `translate(${eased.x}px, ${eased.y}px) scale(${scale})`
      label.current!.style.transform = `translate(${eased.x}px, ${eased.y}px)`
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    gsap.ticker.add(tick)
    return () => {
      root.classList.remove('has-cursor')
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      gsap.ticker.remove(tick)
    }
  }, [])

  return (
    <>
      <div ref={dot} aria-hidden="true" className="pointer-events-none fixed top-0 left-0 z-[9999] -mt-[3px] -ml-[3px] h-1.5 w-1.5 rounded-full bg-paper opacity-0 mix-blend-difference" />
      <div
        ref={ring}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9998] -mt-4 -ml-4 h-8 w-8 rounded-full border border-gold opacity-0 transition-[background-color,border-width] duration-500 ease-out [&.is-active]:border-[0.5px] [&.is-active]:bg-gold/15"
      />
      <span ref={label} aria-hidden="true" className="pointer-events-none fixed top-0 left-0 z-[9999] -mt-2 -ml-6 w-12 text-center text-[10px] font-medium tracking-wide text-navy" />
    </>
  )
}
