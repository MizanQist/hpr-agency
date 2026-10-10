import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, hasFinePointer, prefersReducedMotion } from '../../lib/motion'

/* The brand palette plus a few mid-tones so a face survives quantisation. */
const PALETTE = ['#111112', '#0e2b4b', '#16375d', '#2f4f78', '#5b7190', '#8a6f3c', '#d1ad65', '#bdbabb', '#f4f3ee', '#3a2a24', '#6b4a3a', '#a07a62'].map(hex)

function hex(h: string): [number, number, number] {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
}
function nearest(r: number, g: number, b: number): [number, number, number] {
  let best = PALETTE[0]
  let bestD = Infinity
  for (const p of PALETTE) {
    const d = (p[0] - r) ** 2 + (p[1] - g) ** 2 + (p[2] - b) ** 2
    if (d < bestD) {
      bestD = d
      best = p
    }
  }
  return best
}

type Props = { src: string; cols?: number; rows?: number; className?: string }

/*
  A photograph as pixel art: sampled onto a coarse grid, every cell snapped to the palette. The cells assemble in a
  random order as the section scrolls in, scatter away from a fine pointer and spring back, and a scan line sweeps
  the portrait every few seconds.
*/
export function PixelPortrait({ src, cols = 56, rows = 70, className = '' }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = canvas.current
    if (!el) return
    const ctx = el.getContext('2d')
    if (!ctx) return
    const still = prefersReducedMotion()
    const n = cols * rows
    const colors = new Array<[number, number, number]>(n)
    const order = new Float32Array(n) // 0..1, when each cell appears
    const ox = new Float32Array(n)
    const oy = new Float32Array(n)
    const bright = new Float32Array(n)
    const state = { progress: still ? 1 : 0, scan: -1, mx: -1e4, my: -1e4, hot: false }
    let cell = 8
    let frame = 0
    let ready = false

    /* a deterministic shuffle so the reveal order is stable across renders */
    let seed = 7
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
    for (let i = 0; i < n; i++) order[i] = rand()

    const sample = (img: HTMLImageElement) => {
      const off = document.createElement('canvas')
      off.width = cols
      off.height = rows
      const c = off.getContext('2d')
      if (!c) return
      c.drawImage(img, 0, 0, cols, rows)
      const data = c.getImageData(0, 0, cols, rows).data
      for (let i = 0; i < n; i++) colors[i] = nearest(data[i * 4], data[i * 4 + 1], data[i * 4 + 2])
      ready = true
      draw()
    }

    const resize = () => {
      const r = el.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      cell = r.width / cols
      el.width = Math.round(r.width * dpr)
      el.height = Math.round(cell * rows * dpr)
      el.style.height = `${cell * rows}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw()
    }

    const draw = () => {
      if (!ready) return
      ctx.clearRect(0, 0, el.width, el.height)
      const gap = Math.max(0.5, cell * 0.08)
      for (let i = 0; i < n; i++) {
        if (order[i] > state.progress) continue
        const x = (i % cols) * cell + ox[i]
        const y = Math.floor(i / cols) * cell + oy[i]
        const [r, g, b] = colors[i]
        const row = Math.floor(i / cols)
        const scanBoost = state.scan >= 0 ? Math.max(0, 1 - Math.abs(row - state.scan) / 4) * 0.35 : 0
        const k = 1 + bright[i] + scanBoost
        ctx.fillStyle = `rgb(${Math.min(255, r * k)}, ${Math.min(255, g * k)}, ${Math.min(255, b * k)})`
        ctx.fillRect(x + gap / 2, y + gap / 2, cell - gap, cell - gap)
      }
    }

    /* cells near the pointer are pushed away and lit; everything eases back */
    const tick = () => {
      let moving = false
      const R = cell * 9
      for (let i = 0; i < n; i++) {
        const cx = (i % cols) * cell + cell / 2
        const cy = Math.floor(i / cols) * cell + cell / 2
        const dx = cx - state.mx
        const dy = cy - state.my
        const d = Math.hypot(dx, dy)
        let tx = 0
        let ty = 0
        let tb = 0
        if (state.hot && d < R) {
          const f = (1 - d / R) ** 2
          tx = (dx / (d || 1)) * f * cell * 2.4
          ty = (dy / (d || 1)) * f * cell * 2.4
          tb = f * 0.9
        }
        ox[i] += (tx - ox[i]) * 0.14
        oy[i] += (ty - oy[i]) * 0.14
        bright[i] += (tb - bright[i]) * 0.12
        if (Math.abs(ox[i]) > 0.05 || Math.abs(oy[i]) > 0.05 || Math.abs(bright[i]) > 0.01) moving = true
      }
      draw()
      if (!moving && !state.hot && state.scan < 0) {
        gsap.ticker.remove(tick)
        frame = 0
      }
    }
    const wake = () => {
      if (!frame) {
        gsap.ticker.add(tick)
        frame = 1
      }
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      sample(img)
      resize()
    }
    img.src = src

    const ro = new ResizeObserver(resize)
    ro.observe(el)

    /* assemble on scroll */
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      end: 'top 35%',
      scrub: still ? false : 0.6,
      onUpdate: (self) => {
        state.progress = still ? 1 : self.progress
        draw()
      },
    })

    /* a scan line every few seconds while on screen */
    let scanTimer = 0
    const io = new IntersectionObserver(([entry]) => {
      window.clearInterval(scanTimer)
      if (!entry.isIntersecting || still) return
      scanTimer = window.setInterval(() => {
        state.scan = -3
        const sweep = { v: -3 }
        gsap.to(sweep, {
          v: rows + 3,
          duration: 1.6,
          ease: 'none',
          onUpdate: () => {
            state.scan = sweep.v
            wake()
          },
          onComplete: () => void (state.scan = -1),
        })
      }, 5200)
    })
    io.observe(el)

    let onMove: ((e: MouseEvent) => void) | undefined
    let onLeave: (() => void) | undefined
    if (hasFinePointer() && !still) {
      onMove = (e) => {
        const r = el.getBoundingClientRect()
        state.mx = e.clientX - r.left
        state.my = e.clientY - r.top
        state.hot = true
        wake()
      }
      onLeave = () => {
        state.hot = false
        wake()
      }
      el.addEventListener('mousemove', onMove, { passive: true })
      el.addEventListener('mouseleave', onLeave)
    }

    return () => {
      ro.disconnect()
      io.disconnect()
      st.kill()
      window.clearInterval(scanTimer)
      gsap.ticker.remove(tick)
      if (onMove) el.removeEventListener('mousemove', onMove)
      if (onLeave) el.removeEventListener('mouseleave', onLeave)
    }
  }, [src, cols, rows])

  return <canvas ref={canvas} role="img" aria-label="The founder of HPR, drawn in pixels." data-cursor="Scatter" className={`block w-full ${className}`} />
}
