import { useId } from 'react'
import { COURT_M, courtLineRects } from '../../../components/Court/geometry'
import { floorQuad, projectFloor, type StadiumLayout } from '../stadium'
import styles from '../CenterCourt.module.css'

interface FloorProps {
  layout: StadiumLayout
}

/** Exaggerated from the real 5 cm so lines still read at the far baseline. */
const LINES = courtLineRects(0.11)

/** The court: surface, lines, net and umpire chair, all through one perspective camera. */
export function Floor({ layout }: FloorProps) {
  const id = useId()
  const { camera, width, height, floorTop } = layout
  const { halfWidth, length, net, postHalfSpan, netCenter, netPost, runBack } = COURT_M
  const at = (x: number, y: number, z = 0) => projectFloor(camera, x, y, z)
  const points = (list: [number, number][]) =>
    list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

  const netScale = camera.focal / (net + camera.distance)
  const [postLeftX, netBottomY] = at(-postHalfSpan, net)
  const [postRightX] = at(postHalfSpan, net)
  const netTop = (x: number) => at(x, net, x === 0 ? netCenter : netPost)[1]
  const netOutline = points([
    at(-postHalfSpan, net),
    at(postHalfSpan, net),
    at(postHalfSpan, net, netPost),
    at(0, net, netCenter),
    at(-postHalfSpan, net, netPost),
  ])
  const mesh = Math.max(3, netScale * 0.16)
  const postWidth = netScale * 0.12

  // Umpire chair beside the left net post, facing the court.
  const chairX = -postHalfSpan - 1.4
  const chair = (x: number, z: number) => at(chairX + x, net, z)
  const [chairLeft, chairBase] = chair(-0.45, 0)
  const [chairRight] = chair(0.45, 0)
  const [, seatY] = chair(0, 1.9)
  const [, backTop] = chair(0, 2.7)

  const wallShadow = floorQuad(camera, -30, length + runBack - 3.2, 30, length + runBack)

  return (
    <svg
      className={styles.svgLayer}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-depth`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.28" />
          <stop offset="0.35" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.3" />
        </linearGradient>
        <radialGradient id={`${id}-pool`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" style={{ stopColor: 'var(--light)' }} stopOpacity="0.22" />
          <stop offset="1" style={{ stopColor: 'var(--light)' }} stopOpacity="0" />
        </radialGradient>
        <pattern id={`${id}-mesh`} width={mesh} height={mesh} patternUnits="userSpaceOnUse">
          <path
            d={`M ${mesh} 0 L 0 0 0 ${mesh}`}
            fill="none"
            stroke="#fff"
            strokeOpacity="0.28"
            strokeWidth="0.8"
          />
        </pattern>
      </defs>

      <rect
        x="0"
        y={floorTop}
        width={width}
        height={height - floorTop}
        style={{ fill: 'var(--court-apron)' }}
      />
      <polygon
        points={floorQuad(camera, -halfWidth, 0, halfWidth, length)}
        style={{ fill: 'var(--court)' }}
      />
      <polygon points={wallShadow} className={styles.dayOnly} fill="#3b1a0a" opacity="0.28" />

      <ellipse
        className={styles.nightOnly}
        cx={width / 2}
        cy={at(0, net)[1]}
        rx={width * 0.42}
        ry={(height - floorTop) * 0.5}
        fill={`url(#${id}-pool)`}
      />

      <g style={{ fill: 'var(--court-line)' }}>
        {LINES.map(([x1, y1, x2, y2]) => (
          <polygon key={`${x1}:${y1}:${x2}:${y2}`} points={floorQuad(camera, x1, y1, x2, y2)} />
        ))}
      </g>

      {/* Net shadow on the court (day) */}
      <polygon
        className={styles.dayOnly}
        points={floorQuad(camera, -postHalfSpan, net - 0.9, postHalfSpan, net - 0.05)}
        fill="#3b1a0a"
        opacity="0.18"
      />

      {/* Net */}
      <polygon points={netOutline} style={{ fill: 'var(--net)' }} opacity="0.62" />
      <polygon points={netOutline} fill={`url(#${id}-mesh)`} />
      <polyline
        points={points([
          at(-postHalfSpan, net, netPost),
          at(0, net, netCenter),
          at(postHalfSpan, net, netPost),
        ])}
        fill="none"
        style={{ stroke: 'var(--net-tape)' }}
        strokeWidth={netScale * 0.07}
        strokeLinejoin="round"
      />
      <rect
        x={width / 2 - netScale * 0.025}
        y={netTop(0)}
        width={netScale * 0.05}
        height={netBottomY - netTop(0)}
        style={{ fill: 'var(--net-tape)' }}
      />
      {[postLeftX, postRightX].map((x) => (
        <rect
          key={x}
          x={x - postWidth / 2}
          y={netTop(postHalfSpan) - postWidth * 0.3}
          width={postWidth}
          height={netBottomY - netTop(postHalfSpan) + postWidth * 0.3}
          rx={postWidth * 0.3}
          style={{ fill: 'var(--net)' }}
        />
      ))}

      {/* Umpire chair */}
      <g
        style={{ stroke: 'var(--net)', fill: 'var(--net)' }}
        strokeWidth={netScale * 0.06}
        strokeLinecap="round"
      >
        <line x1={chairLeft} y1={chairBase} x2={chairLeft + netScale * 0.15} y2={seatY} />
        <line x1={chairRight} y1={chairBase} x2={chairRight - netScale * 0.15} y2={seatY} />
        {[0.5, 1.1, 1.6].map((rung) => (
          <line
            key={rung}
            x1={chair(-0.38, rung)[0]}
            y1={chair(0, rung)[1]}
            x2={chair(0.38, rung)[0]}
            y2={chair(0, rung)[1]}
          />
        ))}
        <rect
          x={chair(-0.42, 0)[0]}
          y={seatY - netScale * 0.1}
          width={netScale * 0.84}
          height={netScale * 0.12}
          rx={netScale * 0.03}
        />
        <line x1={chair(0.38, 0)[0]} y1={seatY} x2={chair(0.38, 0)[0]} y2={backTop} />
      </g>

      <rect
        x="0"
        y={floorTop}
        width={width}
        height={height - floorTop}
        fill={`url(#${id}-depth)`}
      />
    </svg>
  )
}
