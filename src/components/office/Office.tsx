import { contact, office } from '../../content/site'
import { t } from '../ui/Placeholder'

const REACH = 1
const REGISTERED = 2

/* Only the WhatsApp and email lines have a known destination; telephone and Instagram stay plain text until the client supplies them. */
const reachHrefs: Record<number, string> = {
  0: `https://wa.me/${contact.whatsapp}`,
  2: `mailto:${contact.email}`,
}

function lineHref(column: number, line: number): string | undefined {
  return column === REACH ? reachHrefs[line] : undefined
}

export function Office() {
  return (
    <footer id="office" className="relative z-[1] bg-navy px-spine pt-24 pb-section text-studio [--ring:var(--color-gold)] lg:grid lg:grid-cols-12 lg:gap-x-6">
      <img
        src={`${import.meta.env.BASE_URL}hpr-logo.png`}
        alt={office.logoAlt}
        width={518}
        height={376}
        loading="lazy"
        decoding="async"
        className="h-20 w-auto sm:h-28 lg:col-start-1 lg:col-end-4"
      />

      <h2 className="sr-only">{office.heading}</h2>

      <div className="mt-12 grid gap-8 lg:col-start-5 lg:col-end-13 lg:mt-0 lg:grid-cols-3">
        {office.columns.map((column, c) => {
          const lines = (
            <ul role="list" className="mt-2 text-caption">
              {column.lines.map((line, i) => {
                const href = lineHref(c, i)
                return (
                  /* Every line is a 44px row so the two link targets never overlap the plain-text lines between them. */
                  <li key={line} className="flex min-h-11 items-center">
                    {href ? (
                      <a
                        href={href}
                        className="link"
                      >
                        {t(line)}
                      </a>
                    ) : (
                      t(line)
                    )}
                  </li>
                )
              })}
            </ul>
          )
          return (
            <div key={column.heading}>
              <h3 className="text-caption font-medium">{column.heading}</h3>
              {c === REGISTERED ? lines : <address className="not-italic">{lines}</address>}
            </div>
          )
        })}
      </div>

      <p className="mt-12 text-caption lg:col-span-12">{office.legal}</p>
    </footer>
  )
}
