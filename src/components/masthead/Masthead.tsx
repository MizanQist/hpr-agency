import { masthead } from '../../content/site'
import { t } from '../ui/Placeholder'

/**
 * The hero's edge. A 56px Studio bar placed in flow directly under the hero and sticky from there;
 * its 1px Carbon rule is the line the founder's figure is cut by. No ancestor may clip overflow.
 * No stuck-state styling is wanted, so no scroll-state query: position: sticky alone is the whole mechanism.
 */
export function Masthead() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-carbon bg-studio px-spine [--ring:var(--color-navy)]">
      <p className="text-h4 font-normal text-navy">{t(masthead.brand)}</p>
      <nav>
        <a
          href="#desk"
          className="inline-flex h-14 items-center text-body font-medium text-carbon underline decoration-1 underline-offset-4 hover:decoration-2"
        >
          {t(masthead.link)}
        </a>
      </nav>
    </header>
  )
}
