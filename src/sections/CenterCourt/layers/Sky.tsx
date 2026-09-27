import { useId } from 'react'
import { floodlightRig, type StadiumLayout } from '../stadium'
import styles from '../CenterCourt.module.css'

interface SkyProps {
  layout: StadiumLayout
}

/** Sky, sun (day) and the floodlight towers that power up for the night session. */
export function Sky({ layout }: SkyProps) {
  const id = useId()
  const { width, skyBottom } = layout
  const landscape = width > layout.height
  const { towers: towerX, headY, headWidth, headHeight } = floodlightRig(layout)

  return (
    <svg
      className={styles.svgLayer}
      viewBox={`0 0 ${width} ${layout.height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--sky-top)' }} />
          <stop offset="0.55" style={{ stopColor: 'var(--sky-mid)' }} />
          <stop offset="1" style={{ stopColor: 'var(--sky-low)' }} />
        </linearGradient>
        <radialGradient id={`${id}-sun`}>
          <stop offset="0" stopColor="#fffdf2" />
          <stop offset="0.18" stopColor="#fff3c9" />
          <stop offset="0.4" stopColor="#ffe2a0" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" style={{ stopColor: 'var(--light)' }} stopOpacity="0.9" />
          <stop offset="0.3" style={{ stopColor: 'var(--light)' }} stopOpacity="0.3" />
          <stop offset="1" style={{ stopColor: 'var(--light)' }} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={width} height={skyBottom + 60} fill={`url(#${id}-sky)`} />

      <g className={styles.dayOnly}>
        <circle
          cx={width * (landscape ? 0.74 : 0.7)}
          cy={skyBottom * 0.34}
          r={skyBottom * 1.1}
          fill={`url(#${id}-sun)`}
        />
      </g>

      {towerX.map((x, towerIndex) => (
        <g key={x} className={styles.tower}>
          <rect
            x={x - 5}
            y={headY + headHeight}
            width="10"
            height={skyBottom}
            style={{ fill: 'var(--board)' }}
          />
          <g className={styles.nightOnly}>
            <circle
              cx={x}
              cy={headY + headHeight / 2}
              r={headWidth * 1.5}
              fill={`url(#${id}-glow)`}
            />
          </g>
          <rect
            x={x - headWidth / 2 - 6}
            y={headY - 6}
            width={headWidth + 12}
            height={headHeight + 12}
            rx="4"
            style={{ fill: 'var(--board)' }}
          />
          {Array.from({ length: 3 }, (_, row) =>
            Array.from({ length: 6 }, (_, column) => (
              <circle
                key={`${row}-${column}`}
                className={styles.lamp}
                style={{ animationDelay: `${towerIndex * 180 + (row * 6 + column) * 22}ms` }}
                cx={x - headWidth / 2 + (column + 0.5) * (headWidth / 6)}
                cy={headY + (row + 0.5) * (headHeight / 3)}
                r={headHeight / 7.5}
              />
            )),
          )}
        </g>
      ))}
    </svg>
  )
}
