/*
  Sections tag their stage with data-ground="hero" | "dark" | "light" (and may change it as they animate).
  The header samples whatever ground is under it, so its glass and text always match the room it is over —
  no event ordering to get wrong.
  hero: navy text, gold logo (the grey video). dark: paper text, gold logo. light: navy text, navy mark.
*/
export type NavTheme = 'dark' | 'light' | 'hero'

export function groundUnderHeader(): NavTheme {
  const probes = [window.innerWidth / 2, window.innerWidth * 0.18]
  for (const x of probes) {
    for (const el of document.elementsFromPoint(x, 56)) {
      const ground = (el as HTMLElement).closest<HTMLElement>('[data-ground]')?.dataset.ground
      if (ground === 'hero' || ground === 'dark' || ground === 'light') return ground
    }
  }
  return 'dark'
}
