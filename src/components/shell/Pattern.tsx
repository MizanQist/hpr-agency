import { useId } from 'react'

type Props = {
  line: string
  dot: string
  lineOpacity?: number
  dotOpacity?: number
  size?: number
  drift?: boolean
  className?: string
}

/*
  The client's lattice: on a 128px grid, an outlined square sits inside a diamond whose corners touch the
  neighbouring diamonds, with a dot at every centre. Drawn as an SVG pattern so it stays crisp at any scale
  and takes any colour; it drifts one tile diagonally over a minute, which reads as still until you watch it.
*/
export function Pattern({ line, dot, lineOpacity = 0.18, dotOpacity = 0.35, size = 128, drift = true, className = '' }: Props) {
  const id = useId()
  const half = size / 2
  const square = size / 2
  const diamond = size / Math.SQRT2
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <svg className={`absolute -top-[128px] -left-[128px] h-[calc(100%+128px)] w-[calc(100%+128px)] ${drift ? 'pattern-drift' : ''}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
            <rect x={half - square / 2} y={half - square / 2} width={square} height={square} fill="none" stroke={line} strokeOpacity={lineOpacity} strokeWidth="1" />
            <rect
              x={half - diamond / 2}
              y={half - diamond / 2}
              width={diamond}
              height={diamond}
              fill="none"
              stroke={line}
              strokeOpacity={lineOpacity}
              strokeWidth="1"
              transform={`rotate(45 ${half} ${half})`}
            />
            <circle cx={half} cy={half} r={size * 0.045} fill={dot} fillOpacity={dotOpacity} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  )
}
