import { useEffect, useState } from 'react'
import { gsap, prefersReducedMotion } from '../../lib/motion'

const MASK = `${import.meta.env.BASE_URL}img/hpr-wordmark-mask.png`

/* The curtain: navy, the wordmark wipes on in gold, then the whole thing lifts to reveal the hero. */
export function Loader({ onDone }: { onDone: () => void }) {
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setGone(true)
      onDone()
      return
    }
    const tl = gsap.timeline({
      onComplete: () => {
        setGone(true)
        onDone()
      },
    })
    tl.fromTo('[data-loader-mark]', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power3.inOut' }, 0.15)
      .to('[data-loader-mark]', { y: -24, opacity: 0, duration: 0.5, ease: 'power3.in' }, 1.25)
      .to('[data-loader]', { yPercent: -100, duration: 1, ease: 'expo.inOut' }, 1.35)
    return () => {
      tl.kill()
    }
  }, [onDone])

  if (gone) return null
  return (
    <div data-loader aria-hidden="true" className="fixed inset-0 z-[100] flex items-center justify-center bg-navy">
      <div
        data-loader-mark
        className="h-24 w-[33.4rem] max-w-[60vw] bg-gold"
        style={{
          aspectRatio: '501 / 360',
          height: 'auto',
          width: 'min(60vw, 14rem)',
          maskImage: `url(${MASK})`,
          WebkitMaskImage: `url(${MASK})`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }}
      />
    </div>
  )
}
