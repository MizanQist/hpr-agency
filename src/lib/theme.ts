/*
  Sections tell the header what ground they are on, so the glass and its text can switch between
  paper-on-dark and navy-on-light as the page changes colour underneath.
*/
/* dark: paper text, gold logo. light: navy text, navy mark. hero: navy text on the grey video, gold logo kept. */
export type NavTheme = 'dark' | 'light' | 'hero'
const EVENT = 'hpr:theme'

export function setNavTheme(theme: NavTheme): void {
  window.dispatchEvent(new CustomEvent<NavTheme>(EVENT, { detail: theme }))
}

export function onNavTheme(handler: (theme: NavTheme) => void): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<NavTheme>).detail)
  window.addEventListener(EVENT, listener)
  return () => window.removeEventListener(EVENT, listener)
}
