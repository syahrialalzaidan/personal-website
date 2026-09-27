import {
  COURT_M,
  courtLineRects,
  courtPercentToMetres,
  project,
  type Camera,
  type Vec3,
} from '../../components/Court/geometry'
import { lerp } from '../../lib/math'
import type { Replay } from '../../content/types'

export const VIEW = { width: 800, height: 500 } as const

/** Elevated broadcast camera behind the near baseline, like the real Hawk-Eye replays. */
export const CAMERA: Camera = {
  position: [0, -3, 6.5],
  pitch: 0.42,
  focal: 330,
  center: [VIEW.width / 2, 190],
}

/** Share of the replay spent before the bounce; the rest is the ball skidding on. */
export const BOUNCE_AT = 1 / 1.35

const CONTACT_HEIGHT = 1.1
const SAMPLES = 60
/** Rendered ball radius in metres, exaggerated so it reads on screen. */
const BALL_RADIUS = 0.19

export interface ShotPoint {
  x: number
  y: number
  shadowX: number
  shadowY: number
  radius: number
}

export interface Shot {
  points: ShotPoint[]
  flightPath: string
  shadowPath: string
  bounce: { x: number; y: number; rx: number; ry: number }
}

const toPoints = (list: [number, number][]) =>
  list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

export function projectRect(x1: number, y1: number, x2: number, y2: number): string {
  return toPoints([
    project([x1, y1, 0], CAMERA),
    project([x2, y1, 0], CAMERA),
    project([x2, y2, 0], CAMERA),
    project([x1, y2, 0], CAMERA),
  ])
}

export const COURT_SURFACE = projectRect(-COURT_M.halfWidth, 0, COURT_M.halfWidth, COURT_M.length)
export const APRON_SURFACE = projectRect(
  -COURT_M.halfWidth - 3.6,
  -2.5,
  COURT_M.halfWidth + 3.6,
  COURT_M.length + 5.5,
)
export const COURT_LINES = courtLineRects(0.07).map(([x1, y1, x2, y2]) =>
  projectRect(x1, y1, x2, y2),
)

export const NET = (() => {
  const { postHalfSpan: span, net, netCenter, netPost } = COURT_M
  return toPoints([
    project([-span, net, 0], CAMERA),
    project([span, net, 0], CAMERA),
    project([span, net, netPost], CAMERA),
    project([0, net, netCenter], CAMERA),
    project([-span, net, netPost], CAMERA),
  ])
})()

export const NET_TAPE = (() => {
  const { postHalfSpan: span, net, netCenter, netPost } = COURT_M
  return toPoints([
    project([-span, net, netPost], CAMERA),
    project([0, net, netCenter], CAMERA),
    project([span, net, netPost], CAMERA),
  ])
})()

/**
 * Builds a 3D flight: contact → apex over the net → bounce → a short skid,
 * sampled and projected into the replay view.
 */
export function buildShot(replay: Replay): Shot {
  const [fromX, fromY] = courtPercentToMetres(replay.shot.from)
  const [toX, toY] = courtPercentToMetres(replay.shot.bounce)
  const apex = 1.4 + (replay.shot.apex / 100) * 3
  const skidX = toX + (toX - fromX) * 0.35
  const skidY = toY + (toY - fromY) * 0.35

  const points: ShotPoint[] = []
  for (let index = 0; index <= SAMPLES; index += 1) {
    const t = index / SAMPLES
    let position: Vec3
    if (t <= BOUNCE_AT) {
      const local = t / BOUNCE_AT
      position = [
        lerp(fromX, toX, local),
        lerp(fromY, toY, local),
        lerp(CONTACT_HEIGHT, 0, local) + 4 * (apex - CONTACT_HEIGHT / 2) * local * (1 - local),
      ]
    } else {
      const local = (t - BOUNCE_AT) / (1 - BOUNCE_AT)
      position = [lerp(toX, skidX, local), lerp(toY, skidY, local), 4 * 0.85 * local * (1 - local)]
    }
    const [x, y] = project(position, CAMERA)
    const [shadowX, shadowY] = project([position[0], position[1], 0], CAMERA)
    const [edgeX] = project([position[0] + BALL_RADIUS, position[1], position[2]], CAMERA)
    points.push({ x, y, shadowX, shadowY, radius: Math.max(2.5, edgeX - x) })
  }

  const [bx, by] = project([toX, toY, 0], CAMERA)
  const [bxEdge] = project([toX + 0.28, toY, 0], CAMERA)
  const [, byEdge] = project([toX, toY + 0.28, 0], CAMERA)
  const path = (key: 'flight' | 'shadow') =>
    points
      .map((point, index) => {
        const x = key === 'flight' ? point.x : point.shadowX
        const y = key === 'flight' ? point.y : point.shadowY
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
      })
      .join(' ')

  return {
    points,
    flightPath: path('flight'),
    shadowPath: path('shadow'),
    bounce: { x: bx, y: by, rx: bxEdge - bx, ry: Math.abs(by - byEdge) },
  }
}

/** Ball state at replay progress `t` (0–1), interpolated between samples. */
export function pointAt(shot: Shot, t: number): ShotPoint {
  const scaled = Math.min(Math.max(t, 0), 1) * (shot.points.length - 1)
  const index = Math.floor(scaled)
  const next = shot.points[Math.min(index + 1, shot.points.length - 1)]
  const current = shot.points[index]
  const local = scaled - index
  return {
    x: lerp(current.x, next.x, local),
    y: lerp(current.y, next.y, local),
    shadowX: lerp(current.shadowX, next.shadowX, local),
    shadowY: lerp(current.shadowY, next.shadowY, local),
    radius: lerp(current.radius, next.radius, local),
  }
}
