import type { ReactNode } from 'react'
import { placeholderPrefix } from '../../content/site'

export function isPlaceholder(value: string): boolean {
  return value.startsWith(placeholderPrefix)
}

/** Renders content strings; anything the client has not supplied yet is visibly marked. */
export function t(value: string): ReactNode {
  if (!isPlaceholder(value)) return value
  return (
    <span className="placeholder" title="Awaiting the client">
      {value}
    </span>
  )
}
