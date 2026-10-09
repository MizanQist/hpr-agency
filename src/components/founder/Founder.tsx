import { founder } from '../../content/site'
import { t } from '../ui/Placeholder'

const img = (file: string) => `${import.meta.env.BASE_URL}img/${file}`

/*
  Two things placed on the studio grey: the wall photograph whole at its own 9:16 (columns 1–5, bleeding
  left) and a plaster panel beside it (columns 7–12, bleeding right). The grid's two rows split the photo's
  height 22/78 so the panel's top sits on the founder's cap line; the panel ends where its text ends.
  Mobile: the 4:5 crop full-bleed, then the same text on flat plaster.
*/
export function Founder() {
  return (
    <section
      id="founder"
      aria-labelledby="founder-heading"
      className="bg-studio [--ring:var(--color-navy)] lg:grid lg:grid-cols-12 lg:grid-rows-[22fr_78fr] lg:gap-x-6 lg:px-spine"
    >
      <picture className="block lg:col-start-1 lg:col-end-6 lg:row-span-2 lg:-ml-spine">
        <source
          media="(min-width: 1024px)"
          type="image/webp"
          srcSet={`${img('founder-wall-780.webp')} 780w, ${img('founder-wall-1170.webp')} 1170w`}
          sizes="45vw"
          width={1170}
          height={2080}
        />
        <source
          media="(min-width: 1024px)"
          type="image/jpeg"
          srcSet={`${img('founder-wall-780.jpg')} 780w, ${img('founder-wall-1170.jpg')} 1170w`}
          sizes="45vw"
          width={1170}
          height={2080}
        />
        <source
          type="image/webp"
          srcSet={`${img('founder-wall-4x5-780.webp')} 780w, ${img('founder-wall-4x5-1170.webp')} 1170w`}
          sizes="100vw"
          width={1170}
          height={1462}
        />
        <img
          src={img('founder-wall-4x5-1170.jpg')}
          srcSet={`${img('founder-wall-4x5-780.jpg')} 780w, ${img('founder-wall-4x5-1170.jpg')} 1170w`}
          sizes="100vw"
          alt={founder.photoAlt}
          width={1170}
          height={1462}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
      </picture>

      <div className="bg-plaster px-spine py-12 text-paper [--ring:var(--color-paper)] lg:col-start-7 lg:col-end-13 lg:row-start-2 lg:-mr-spine lg:self-start lg:p-14">
        <h2 id="founder-heading" className="text-h2 font-normal">
          {t(founder.name)}
        </h2>
        <p className="mt-2 text-body">{t(founder.title)}</p>
        <p className="mt-8 max-w-[62ch] text-body">{t(founder.bio)}</p>
        <p className="mt-6 text-body">{t(founder.discretion)}</p>

        <h3 className="mt-12 text-h4 font-normal">{founder.conditionsHeading}</h3>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-body">
          {founder.conditions.map((c) => (
            <div key={c.term} className="contents">
              <dt className="font-medium">{c.term}</dt>
              <dd>{t(c.line)}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 text-body">
          {founder.pressLabel} {t(founder.press)}
        </p>
      </div>
    </section>
  )
}
