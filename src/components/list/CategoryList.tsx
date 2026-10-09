import { list } from '../../content/site'
import { requestDesk } from '../../lib/desk'
import { t } from '../ui/Placeholder'

/*
  The list: what HPR is in one breath, then the five categories in the client's own words.
  Studio ground, 48px under the masthead's rule, 96px beneath the last row (held to one viewport at 1440×900).
  Rows are a plain list on the 12-column grid via subgrid: word in columns 1–4, line in 5–10; no rules, no cards.
*/
export function CategoryList() {
  return (
    <section
      id="list"
      aria-labelledby="list-heading"
      className="bg-studio px-spine pt-12 pb-24 text-carbon [--ring:var(--color-navy)] lg:grid lg:grid-cols-12 lg:gap-x-6"
    >
      <h2 id="list-heading" className="text-h1 font-light text-balance lg:col-start-1 lg:col-end-10">
        {t(list.headline)}
      </h2>

      <p className="mt-12 max-w-measure text-body text-pretty lg:col-start-1 lg:col-end-7">{t(list.paragraph)}</p>

      <ul role="list" className="mt-12 flex flex-col gap-6 lg:col-span-12 lg:grid lg:grid-cols-subgrid">
        {list.categories.map((category) => (
          <li
            key={category.id}
            className="flex flex-col gap-1 lg:col-span-12 lg:grid lg:grid-cols-subgrid lg:items-baseline"
          >
            <a
              href="#desk"
              onClick={() => requestDesk(category.id)}
              className="min-h-11 py-1 text-left text-h3 font-normal text-carbon decoration-1 underline-offset-4 hover:underline [@media(hover:none)]:underline lg:col-start-1 lg:col-end-5"
            >
              {t(category.name)}
            </a>
            <p className="text-body text-pretty lg:col-start-5 lg:col-end-11">{t(category.line)}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
