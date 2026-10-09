import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { gsap, hasFinePointer } from '../../lib/motion'

type Props = { children: ReactNode; strength?: number; className?: string }

/* The element leans toward a nearby pointer and springs back when it leaves. */
export function Magnetic({ children, strength = 0.35, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !hasFinePointer()) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      gsap.to(el, { x: dx * strength, y: dy * strength, duration: 0.6, ease: 'power3.out' })
    }
    const onLeave = () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' })
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [strength])

  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {children}
    </div>
  )
}
