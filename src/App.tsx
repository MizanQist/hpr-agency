import { ScrubVideo } from './ScrubVideo'
import { Masthead } from './components/masthead/Masthead'
import { CategoryList } from './components/list/CategoryList'
import { Founder } from './components/founder/Founder'
import { ObjectSection } from './components/object/ObjectSection'
import { RequestDesk } from './components/desk/RequestDesk'
import { Office } from './components/office/Office'

export default function App() {
  return (
    <>
      {/* Approved hero: the cursor-scrubbed video sits fixed behind this full-height section; the page scrolls over it. */}
      <section aria-label="hpr" className="relative h-screen">
        <ScrubVideo />
        <header className="absolute top-0 left-0 z-[1] px-spine py-4 sm:py-5">
          <h1 className="m-0">
            <img
              src={`${import.meta.env.BASE_URL}hpr-logo.png`}
              alt="hpr — Hoomsuk PR Agency"
              width={518}
              height={376}
              className="h-16 w-auto drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)] sm:h-28"
            />
          </h1>
        </header>
      </section>
      <Masthead />
      <main className="relative z-[1]">
        <CategoryList />
        <Founder />
        <ObjectSection />
        <RequestDesk />
      </main>
      <Office />
    </>
  )
}
