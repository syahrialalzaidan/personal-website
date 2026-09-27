import { useId } from 'react'
import { floodlightRig, type StadiumLayout } from '../stadium'
import styles from '../CenterCourt.module.css'

interface BeamsProps {
  layout: StadiumLayout
}

/**
 * Soft edges come from stacking progressively wider, fainter copies of each beam rather than
 * from a blur filter, so the layer rasterizes once and stays cheap to move and scale.
 */
const SOFTNESS = [0.55, 0.8, 1.05]

/** Volumetric light: floodlight beams at night, a warm sun shaft by day. */
export function Beams({ layout }: BeamsProps) {
  const id = useId()
  const { width, height, floorTop } = layout
  const landscape = width > height
  const rig = floodlightRig(layout)
  const headY = rig.headY + rig.headHeight / 2
  const spread = width * (landscape ? 0.2 : 0.28)
  const beamBottom = floorTop + 180

  return (
    <svg
      className={styles.svgLayer}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--light)' }} stopOpacity="0.12" />
          <stop offset="0.6" style={{ stopColor: 'var(--light)' }} stopOpacity="0.03" />
          <stop offset="1" style={{ stopColor: 'var(--light)' }} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-shaft`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff1c9" stopOpacity="0.14" />
          <stop offset="1" stopColor="#fff1c9" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g className={styles.nightOnly} fill={`url(#${id}-beam)`}>
        {rig.towers.flatMap((x) => {
          const toward = width / 2 + (x < width / 2 ? -spread * 0.2 : spread * 0.2)
          return SOFTNESS.map((scale) => (
            <polygon
              key={`${x}-${scale}`}
              points={`${x - 30 * scale},${headY} ${x + 30 * scale},${headY} ${toward + spread * scale},${beamBottom} ${toward - spread * scale},${beamBottom}`}
            />
          ))
        })}
      </g>

      <g className={styles.dayOnly} fill={`url(#${id}-shaft)`}>
        {SOFTNESS.map((scale) => {
          const inset = (1 - scale) * width * 0.08
          return (
            <polygon
              key={scale}
              points={`${width * 0.62 + inset},0 ${width * 0.86 - inset},0 ${width * 0.6 - inset},${height} ${width * 0.22 + inset},${height}`}
            />
          )
        })}
      </g>
    </svg>
  )
}
