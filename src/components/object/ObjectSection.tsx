import { object } from '../../content/site'
import { t } from '../ui/Placeholder'

const img = (file: string) => `${import.meta.env.BASE_URL}img/${file}`

/** The kind of thing we find: one object on the Carbon ground, its facts beside it. */
export function ObjectSection() {
  return (
    <section
      id="object"
      aria-labelledby="object-heading"
      className="bg-carbon px-spine py-section text-studio [--ring:var(--color-gold)] lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-6"
    >
      {/* Mobile: the watch first, on the spine, about 70% wide, capped at tablet so it stays a modest object. Desktop: columns 8–11, not bleeding. */}
      <picture className="block w-[70%] max-w-[22rem] lg:col-start-8 lg:col-end-12 lg:row-start-1 lg:w-full lg:max-w-none">
        <source type="image/webp" srcSet={`${img('watch-480.webp')} 480w, ${img('watch-720.webp')} 720w`} sizes="(min-width: 1024px) 30vw, 70vw" />
        <img
          src={img('watch-720.jpg')}
          srcSet={`${img('watch-480.jpg')} 480w, ${img('watch-720.jpg')} 720w`}
          sizes="(min-width: 1024px) 30vw, 70vw"
          alt={object.photoAlt}
          width={720}
          height={900}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
      </picture>

      <div className="mt-8 max-w-measure lg:col-start-1 lg:col-end-6 lg:row-start-1 lg:mt-0">
        <h2 id="object-heading" className="text-h2 font-normal">
          {t(object.statement)}
        </h2>
        <ul className="mt-6 space-y-2 text-body">
          {object.facts.map((fact) => (
            <li key={fact}>{t(fact)}</li>
          ))}
        </ul>
        <p className="mt-6 text-caption">{t(object.note)}</p>
      </div>
    </section>
  )
}
