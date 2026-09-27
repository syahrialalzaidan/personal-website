import { useId, useLayoutEffect, useRef, useState } from 'react'
import { profile } from '../../../content/profile'
import type { StadiumLayout } from '../stadium'
import styles from '../CenterCourt.module.css'

interface WallProps {
  layout: StadiumLayout
}

/** The stadium wall with the greeting painted across it. */
export function Wall({ layout }: WallProps) {
  const id = useId()
  const { width, wallTop, floorTop } = layout
  const landscape = width > layout.height
  const wallHeight = floorTop - wallTop
  const fontSize = wallHeight * (landscape ? 0.95 : 0.9)
  const maxWidth = width * (landscape ? 0.84 : 0.82)
  // Leave room under the baseline for descenders (the "y" in Iyal).
  const baseline = floorTop - fontSize * 0.22
  const panel = landscape ? 200 : 150

  // Shrink the greeting only if it would run wider than the wall allows. The scale sits on a
  // wrapper, so measuring the text itself always returns its natural width.
  const textRef = useRef<SVGTextElement>(null)
  const [fit, setFit] = useState(1)
  useLayoutEffect(() => {
    let cancelled = false
    void document.fonts.ready.then(() => {
      const length = textRef.current?.getComputedTextLength() ?? 0
      if (!cancelled && length > 0) setFit(Math.min(1, maxWidth / length))
    })
    return () => {
      cancelled = true
    }
  }, [maxWidth, fontSize])

  return (
    <svg
      className={styles.svgLayer}
      viewBox={`0 0 ${width} ${layout.height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-wallShade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.07" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      <rect x="0" y={wallTop} width={width} height={wallHeight} style={{ fill: 'var(--wall)' }} />
      <g stroke="#000" strokeOpacity="0.18" strokeWidth="1.5">
        {Array.from({ length: Math.ceil(width / panel) }, (_, index) => (
          <line key={index} x1={index * panel} y1={wallTop} x2={index * panel} y2={floorTop} />
        ))}
      </g>
      <rect x="0" y={wallTop} width={width} height="6" fill="#fff" opacity="0.12" />

      <g transform={`translate(${width / 2} ${baseline}) scale(${fit})`}>
        <text ref={textRef} textAnchor="middle" className={styles.wallName} style={{ fontSize }}>
          {profile.greeting}
        </text>
      </g>

      <rect x="0" y={wallTop} width={width} height={wallHeight} fill={`url(#${id}-wallShade)`} />
      <rect x="0" y={floorTop - 10} width={width} height="10" fill="#000" opacity="0.28" />
    </svg>
  )
}
