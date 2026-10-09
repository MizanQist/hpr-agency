import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export const EASE_BRAND = 'cubic-bezier(0.65, 0.05, 0, 1)'

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function hasFinePointer(): boolean {
  return window.matchMedia('(pointer: fine)').matches
}

let current: Lenis | null = null

/** Scroll the page to y through Lenis when it is running, natively otherwise. */
export function scrollPageTo(y: number, immediate = false): void {
  if (current) current.scrollTo(y, { immediate })
  else window.scrollTo({ top: y, behavior: immediate ? 'instant' : 'smooth' })
}

/** Lenis drives the scroll; GSAP's ticker drives Lenis, so ScrollTrigger and the smoothing never disagree. */
export function initSmoothScroll(): Lenis | null {
  if (prefersReducedMotion()) return null
  const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, touchMultiplier: 1.4 })
  current = lenis
  lenis.on('scroll', ScrollTrigger.update)
  const tick = (time: number) => lenis.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  const original = lenis.destroy.bind(lenis)
  lenis.destroy = () => {
    gsap.ticker.remove(tick)
    current = null
    original()
  }
  return lenis
}

export { gsap, ScrollTrigger }
export type { Lenis }
