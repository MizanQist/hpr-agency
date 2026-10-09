import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../lib/motion'

type Props = { color: string; opacity?: number; className?: string; speed?: number }

/*
  Slow topographic contour lines drawn on a canvas that fills its parent: a few centres, a dozen rings each,
  the radius of every ring breathing with two sines so the lines drift like a map coming into focus.
  Paused while off-screen; a single still frame under reduced motion.
*/
export function Contours({ color, opacity = 0.14, className = '', speed = 1 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const still = prefersReducedMotion()
    let frame = 0
    let visible = true
    let last = 0
    let width = 0
    let height = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const centres = [
      { x: 0.18, y: 0.3, rings: 13, step: 0.055 },
      { x: 0.78, y: 0.72, rings: 15, step: 0.05 },
      { x: 0.55, y: 0.05, rings: 9, step: 0.06 },
    ]

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height)
      ctx.strokeStyle = color
      ctx.globalAlpha = opacity
      ctx.lineWidth = 1
      const base = Math.max(width, height)
      for (let c = 0; c < centres.length; c++) {
        const { x, y, rings, step } = centres[c]
        const cx = x * width
        const cy = y * height
        for (let k = 1; k <= rings; k++) {
          const r = k * step * base
          ctx.beginPath()
          for (let i = 0; i <= 96; i++) {
            const a = (i / 96) * Math.PI * 2
            const wobble = 1 + 0.11 * Math.sin(3 * a + t * 0.25 + k * 0.7 + c) + 0.07 * Math.sin(5 * a - t * 0.18 + k * 0.4)
            const px = cx + Math.cos(a) * r * wobble
            const py = cy + Math.sin(a) * r * wobble * 0.82
            if (i === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.closePath()
          ctx.stroke()
        }
      }
    }

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop)
      if (!visible || now - last < 1000 / 30) return
      last = now
      draw((now / 1000) * speed)
    }

    resize()
    draw(0)
    if (!still) frame = requestAnimationFrame(loop)

    const io = new IntersectionObserver(([entry]) => void (visible = entry.isIntersecting))
    io.observe(canvas)
    const ro = new ResizeObserver(() => {
      resize()
      draw(last / 1000)
    })
    ro.observe(canvas)
    return () => {
      cancelAnimationFrame(frame)
      io.disconnect()
      ro.disconnect()
    }
  }, [color, opacity, speed])

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />
}
