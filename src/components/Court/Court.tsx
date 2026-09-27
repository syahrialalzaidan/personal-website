import { useId } from 'react'
import { COURT } from './geometry'

interface CourtProps {
  className?: string
  /** Draw the run-off area around the lines. */
  apron?: boolean
}

const { width, length, singlesInset, serviceFromNet, apronSide, apronEnd } = COURT
const net = length / 2
const serviceNear = net - serviceFromNet
const serviceFar = net + serviceFromNet

/** A regulation tennis court, top-down, in centimetres. Colors come from the theme. */
export function Court({ className, apron = true }: CourtProps) {
  const id = useId()
  const viewBox = apron
    ? `${-apronSide} ${-apronEnd} ${width + apronSide * 2} ${length + apronEnd * 2}`
    : `0 0 ${width} ${length}`

  return (
    <svg viewBox={viewBox} className={className} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>
        <pattern id={`${id}-grain`} width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="24" height="24" fill="transparent" />
          <circle cx="4" cy="6" r="1.4" fill="#000" opacity="0.08" />
          <circle cx="16" cy="18" r="1.1" fill="#fff" opacity="0.06" />
        </pattern>
      </defs>

      {apron && (
        <rect
          x={-apronSide}
          y={-apronEnd}
          width={width + apronSide * 2}
          height={length + apronEnd * 2}
          style={{ fill: 'var(--court-apron)' }}
        />
      )}
      <rect width={width} height={length} style={{ fill: 'var(--court)' }} />
      <rect width={width} height={length} fill={`url(#${id}-grain)`} />
      <rect
        x={-apronSide}
        y={-apronEnd}
        width={width + apronSide * 2}
        height={length + apronEnd * 2}
        fill={`url(#${id}-sheen)`}
      />

      <g fill="none" style={{ stroke: 'var(--court-line)' }} strokeWidth="7">
        <rect width={width} height={length} />
        <line x1={singlesInset} y1="0" x2={singlesInset} y2={length} />
        <line x1={width - singlesInset} y1="0" x2={width - singlesInset} y2={length} />
        <line x1={singlesInset} y1={serviceNear} x2={width - singlesInset} y2={serviceNear} />
        <line x1={singlesInset} y1={serviceFar} x2={width - singlesInset} y2={serviceFar} />
        <line x1={width / 2} y1={serviceNear} x2={width / 2} y2={serviceFar} />
        <line x1={width / 2} y1="0" x2={width / 2} y2="22" />
        <line x1={width / 2} y1={length - 22} x2={width / 2} y2={length} />
      </g>
    </svg>
  )
}
