import { useId } from 'react'

interface TennisBallProps {
  size?: number | string
  className?: string
}

/** The optic-yellow ball, drawn in SVG and shaded from theme tokens. */
export function TennisBall({ size = 48, className }: TennisBallProps) {
  const id = useId()
  const fill = `${id}-fill`

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      // Height follows width, so a ball sized by its container (or by CSS) always stays square.
      style={{ height: 'auto', aspectRatio: '1' }}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={fill} cx="34%" cy="30%" r="78%">
          <stop offset="0" style={{ stopColor: 'var(--ball-light)' }} />
          <stop offset="0.5" style={{ stopColor: 'var(--ball)' }} />
          <stop offset="1" style={{ stopColor: 'var(--ball-shade)' }} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="47" fill={`url(#${fill})`} />
      <g
        fill="none"
        stroke="var(--ball-seam)"
        strokeWidth="4.5"
        strokeLinecap="round"
        opacity="0.92"
      >
        <path d="M13 24 C 35 36, 39 64, 19 83" />
        <path d="M87 24 C 65 36, 61 64, 81 83" />
      </g>
    </svg>
  )
}
