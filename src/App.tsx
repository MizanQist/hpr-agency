import { ScrubVideo } from './ScrubVideo'

export default function App() {
  return (
    <>
      <ScrubVideo />
      <header className="fixed top-0 left-0 z-10 px-5 py-4 sm:px-8 sm:py-5">
        <img src={`${import.meta.env.BASE_URL}hpr-logo.png`} alt="hpr — Hoomsuk PR Agency" className="h-16 w-auto drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)] sm:h-28" />
      </header>
    </>
  )
}
