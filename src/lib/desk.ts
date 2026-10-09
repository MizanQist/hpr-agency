/*
  A category row on the list opens the request desk with that option chosen.
  No router and no shared store: the row is an <a href="#desk"> (the hash does the scrolling) and announces the choice; the desk listens.
  Focus follows the action: once the hash navigation has run (it is the link's default action, so it lands after this
  click handler and after React has committed the chosen option), focus moves to the Request line so the next Tab
  continues down the memo and a screen reader hears the preselected value.
*/
const EVENT = 'hpr:request'
const REQUEST_CONTROL_ID = 'desk-request'

export function requestDesk(categoryId: string): void {
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: categoryId }))
  requestAnimationFrame(() => {
    document.getElementById(REQUEST_CONTROL_ID)?.focus({ preventScroll: true })
  })
}

export function onDeskRequest(handler: (categoryId: string) => void): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<string>).detail)
  window.addEventListener(EVENT, listener)
  return () => window.removeEventListener(EVENT, listener)
}
