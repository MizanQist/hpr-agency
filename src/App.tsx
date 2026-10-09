import { useCallback, useEffect, useRef, useState } from 'react'
import { initSmoothScroll } from './lib/motion'
import type { Lenis } from './lib/motion'
import { Loader } from './components/shell/Loader'
import { Cursor } from './components/shell/Cursor'
import { Progress } from './components/shell/Progress'
import { Nav } from './components/shell/Nav'
import { Pattern } from './components/shell/Pattern'
import { Hero } from './components/hero/Hero'
import { Statement } from './components/statement/Statement'

export default function App() {
  const lenis = useRef<Lenis | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    lenis.current = initSmoothScroll()
    return () => lenis.current?.destroy()
  }, [])

  const onLoaded = useCallback(() => setReady(true), [])
  const onMenuToggle = useCallback((open: boolean) => (open ? lenis.current?.stop() : lenis.current?.start()), [])

  return (
    <>
      <Loader onDone={onLoaded} />
      <Cursor />
      <Progress />
      <Nav onMenuToggle={onMenuToggle} />
      {/* The page's own ground: navy with the gold lattice; sections that want it stay transparent. */}
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-navy">
        <Pattern line="#d1ad65" dot="#d1ad65" lineOpacity={0.16} dotOpacity={0.32} />
      </div>
      <main className={ready ? '' : 'pointer-events-none'}>
        <Hero />
        <Statement />
      </main>
    </>
  )
}
