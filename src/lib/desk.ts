/*
  A category row on the list opens the request desk with that option chosen.
  No router and no shared store: the row scrolls to #desk and announces the choice; the desk listens.
*/
const EVENT = 'hpr:request'

export function requestDesk(categoryId: string): void {
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: categoryId }))
  document.getElementById('desk')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function onDeskRequest(handler: (categoryId: string) => void): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<string>).detail)
  window.addEventListener(EVENT, listener)
  return () => window.removeEventListener(EVENT, listener)
}
