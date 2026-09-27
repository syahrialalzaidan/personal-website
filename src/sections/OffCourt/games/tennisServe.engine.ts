import {
  COURT_M,
  courtLineRects,
  project,
  type Camera,
  type Vec3,
} from '../../../components/Court/geometry'
import { lerp } from '../../../lib/math'
import {
  drawBall,
  drawHint,
  drawLabel,
  drawShadow,
  fitViewport,
  type GameColors,
  type Viewport,
} from './shared'

export const SERVE_VIEW = { width: 200, height: 125 } as const

/** Elevated camera behind the server's baseline. */
const CAMERA: Camera = {
  position: [0, -3, 9],
  pitch: 0.6,
  focal: 96,
  center: [SERVE_VIEW.width / 2, 45],
}

const CHARGE_SECONDS = 1.05
const ACE_ZONE: [number, number] = [0.72, 0.86]
const RESULT_SECONDS = 1.6
const CONTACT: Vec3 = [0.8, -0.3, 2.9]
const BALL_RADIUS_M = 0.2

export type ServeResult = 'ace' | 'in' | 'fault' | 'net'
export type ServePhase = 'idle' | 'charging' | 'flight' | 'result'
export type ServeEvent = 'serve' | 'bounce' | ServeResult

export interface ServeState {
  phase: ServePhase
  charge: number
  held: number
  flight: number
  flightSeconds: number
  target: Vec3
  result: ServeResult | null
  speed: number
  best: number
  aces: number
  resultTimer: number
  bounced: boolean
  idle: number
}

export function createServe(): ServeState {
  return {
    phase: 'idle',
    charge: 0,
    held: 0,
    flight: 0,
    flightSeconds: 0.6,
    target: [-2, 16, 0],
    result: null,
    speed: 0,
    best: 0,
    aces: 0,
    resultTimer: 0,
    bounced: false,
    idle: 0,
  }
}

/** Triangle wave: the meter fills, then drains, then fills again, so timing matters. */
const triangle = (t: number) => {
  const phase = t % 2
  return phase < 1 ? phase : 2 - phase
}

export function beginCharge(state: ServeState) {
  if (state.phase !== 'idle' && state.phase !== 'result') return
  state.phase = 'charging'
  state.held = 0
  state.charge = 0
}

export function releaseServe(state: ServeState): ServeEvent[] {
  if (state.phase !== 'charging') return []
  const power = state.charge
  const { net, serviceFromNet, singlesHalfWidth } = COURT_M
  const serviceLine = net + serviceFromNet
  let result: ServeResult
  let speed: number
  let target: Vec3

  if (power < 0.38) {
    result = 'net'
    speed = Math.round(95 + power * 80)
    target = [-1.2, net - 0.6, 0]
  } else if (power < ACE_ZONE[0]) {
    result = 'in'
    speed = Math.round(128 + power * 60)
    target = [-1.4 - power * 1.6, net + 2 + power * 3.2, 0]
  } else if (power <= ACE_ZONE[1]) {
    result = 'ace'
    const zone = (power - ACE_ZONE[0]) / (ACE_ZONE[1] - ACE_ZONE[0])
    speed = Math.round(186 + zone * 36)
    const wide = Math.random() < 0.5
    target = [wide ? -singlesHalfWidth + 0.35 : -0.3, serviceLine - 0.45, 0]
  } else {
    result = 'fault'
    speed = Math.round(205 + (power - ACE_ZONE[1]) * 90)
    target = [-2.2, serviceLine + 1.4 + (power - ACE_ZONE[1]) * 6, 0]
  }

  Object.assign(state, {
    phase: 'flight',
    flight: 0,
    flightSeconds: 0.9 - (speed - 100) / 400,
    target,
    result,
    speed,
    bounced: false,
  } satisfies Partial<ServeState>)
  return ['serve']
}

/** Cancels a charge without serving, e.g. when a touch turns into a page scroll. */
export function cancelCharge(state: ServeState) {
  if (state.phase === 'charging') state.phase = 'idle'
}

export function stepServe(state: ServeState, delta: number): ServeEvent[] {
  const events: ServeEvent[] = []
  state.idle += delta

  if (state.phase === 'charging') {
    state.held += delta
    state.charge = triangle(state.held / CHARGE_SECONDS)
  } else if (state.phase === 'flight') {
    state.flight += delta / state.flightSeconds
    if (!state.bounced && state.flight >= 1) {
      state.bounced = true
      events.push('bounce')
    }
    if (state.flight >= 1.45) {
      state.phase = 'result'
      state.resultTimer = RESULT_SECONDS
      if (state.result === 'ace') state.aces += 1
      if (state.result === 'ace' || state.result === 'in')
        state.best = Math.max(state.best, state.speed)
      if (state.result) events.push(state.result)
    }
  } else if (state.phase === 'result') {
    state.resultTimer -= delta
    if (state.resultTimer <= 0) state.phase = 'idle'
  }
  return events
}

/** Ball position along the serve: contact → bounce, then a skid past it. */
function ballPosition(state: ServeState): Vec3 {
  const t = state.flight
  const [tx, ty] = state.target
  if (t <= 1) {
    const netDrop = state.result === 'net' ? 0.6 : 0
    return [
      lerp(CONTACT[0], tx, t),
      lerp(CONTACT[1], ty, t),
      lerp(CONTACT[2], 0, t) + 4 * (0.35 - netDrop * 0.4) * t * (1 - t),
    ]
  }
  const local = (t - 1) / 0.45
  const carry = state.result === 'net' ? 0.4 : 5
  const direction = [tx - CONTACT[0], ty - CONTACT[1]]
  const length = Math.hypot(direction[0], direction[1]) || 1
  return [
    tx + (direction[0] / length) * carry * local,
    ty + (direction[1] / length) * carry * local,
    4 * (state.result === 'net' ? 0.15 : 0.7) * local * (1 - local),
  ]
}

const toPoints = (context: CanvasRenderingContext2D, points: Vec3[]) => {
  context.beginPath()
  points.forEach((point, index) => {
    const [x, y] = project(point, CAMERA)
    if (index === 0) context.moveTo(x, y)
    else context.lineTo(x, y)
  })
  context.closePath()
}

const rect = (x1: number, y1: number, x2: number, y2: number): Vec3[] => [
  [x1, y1, 0],
  [x2, y1, 0],
  [x2, y2, 0],
  [x1, y2, 0],
]

const LINES = courtLineRects(0.09)
const RESULT_LABEL: Record<ServeResult, string> = {
  ace: 'ACE!',
  in: 'IN',
  fault: 'FAULT',
  net: 'NET',
}

export function drawServe(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: ServeState,
  colors: GameColors & { court: string; 'court-apron': string },
): Viewport {
  const viewport = fitViewport(width, height, SERVE_VIEW.width, SERVE_VIEW.height)
  context.clearRect(0, 0, width, height)
  context.save()
  context.translate(viewport.offsetX, viewport.offsetY)
  context.scale(viewport.scale, viewport.scale)
  context.beginPath()
  context.roundRect(0, 0, SERVE_VIEW.width, SERVE_VIEW.height, 4)
  context.clip()

  const {
    halfWidth,
    length,
    net,
    serviceFromNet,
    singlesHalfWidth,
    postHalfSpan,
    netPost,
    netCenter,
  } = COURT_M

  context.fillStyle = colors['court-apron']
  context.fillRect(0, 0, SERVE_VIEW.width, SERVE_VIEW.height)
  context.fillStyle = colors.court
  toPoints(context, rect(-halfWidth, 0, halfWidth, length))
  context.fill()

  // Target box glows while charging
  if (state.phase === 'charging') {
    context.fillStyle = 'rgba(216, 255, 62, 0.16)'
    toPoints(context, rect(-singlesHalfWidth, net, 0, net + serviceFromNet))
    context.fill()
  }

  context.fillStyle = colors['court-line']
  for (const [x1, y1, x2, y2] of LINES) {
    toPoints(context, rect(x1, y1, x2, y2))
    context.fill()
  }

  const ball = state.phase === 'flight' || state.phase === 'result' ? ballPosition(state) : null

  // Bounce mark
  if (ball && state.flight >= 1) {
    const [bx, by] = project(state.target, CAMERA)
    context.fillStyle = 'rgba(255, 255, 255, 0.35)'
    context.beginPath()
    context.ellipse(bx, by, 2.4, 1.1, 0, 0, Math.PI * 2)
    context.fill()
  }

  // Net
  context.fillStyle = 'rgba(10, 14, 22, 0.55)'
  toPoints(context, [
    [-postHalfSpan, net, 0],
    [postHalfSpan, net, 0],
    [postHalfSpan, net, netPost],
    [0, net, netCenter],
    [-postHalfSpan, net, netPost],
  ])
  context.fill()
  context.strokeStyle = '#ffffff'
  context.lineWidth = 0.8
  context.beginPath()
  const [lx, ly] = project([-postHalfSpan, net, netPost], CAMERA)
  const [cx, cy] = project([0, net, netCenter], CAMERA)
  const [rx, ry] = project([postHalfSpan, net, netPost], CAMERA)
  context.moveTo(lx, ly)
  context.lineTo(cx, cy)
  context.lineTo(rx, ry)
  context.stroke()

  // Ball: in hand, tossed while charging, or in flight
  const position: Vec3 =
    ball ??
    (state.phase === 'charging'
      ? [CONTACT[0], CONTACT[1], CONTACT[2] + Math.min(state.held, 0.5)]
      : [CONTACT[0], CONTACT[1], 1.2 + Math.abs(Math.sin(state.idle * 3)) * 0.6])
  const [sx, sy] = project([position[0], position[1], 0], CAMERA)
  const [px, py] = project(position, CAMERA)
  const [edge] = project([position[0] + BALL_RADIUS_M, position[1], position[2]], CAMERA)
  const radius = Math.max(1.6, edge - px)
  drawShadow(context, sx, sy, radius, 0.3)
  drawBall(context, px, py, radius, colors)

  // Power meter
  const meterX = 8
  const meterY = 30
  const meterHeight = 70
  context.fillStyle = 'rgba(3, 8, 16, 0.6)'
  context.beginPath()
  context.roundRect(meterX, meterY, 7, meterHeight, 3.5)
  context.fill()
  context.fillStyle = 'rgba(80, 220, 120, 0.55)'
  context.fillRect(
    meterX,
    meterY + meterHeight * (1 - ACE_ZONE[1]),
    7,
    meterHeight * (ACE_ZONE[1] - ACE_ZONE[0]),
  )
  context.fillStyle = colors.ball
  const fill = meterHeight * state.charge
  context.beginPath()
  context.roundRect(meterX + 1.5, meterY + meterHeight - fill, 4, fill, 2)
  context.fill()

  // Radar gun
  const mono = colors['font-mono']
  const display = colors['font-display']
  context.fillStyle = 'rgba(3, 8, 16, 0.72)'
  context.beginPath()
  context.roundRect(SERVE_VIEW.width - 62, 6, 56, 26, 3)
  context.fill()
  drawLabel(context, state.speed ? `${state.speed}` : '---', SERVE_VIEW.width - 44, 20, {
    size: 14,
    color: '#ffb21e',
    font: display,
    weight: 900,
  })
  drawLabel(context, 'KM/H', SERVE_VIEW.width - 17, 22, {
    size: 4.2,
    color: '#ffb21e',
    font: mono,
    weight: 700,
  })
  drawLabel(context, `BEST ${state.best || '—'} · ACES ${state.aces}`, SERVE_VIEW.width - 34, 38, {
    size: 3.8,
    color: '#ffffff',
    font: mono,
    weight: 700,
    alpha: 0.8,
  })

  if (state.phase === 'result' && state.result) {
    const good = state.result === 'ace' || state.result === 'in'
    drawLabel(context, RESULT_LABEL[state.result], SERVE_VIEW.width / 2, 58, {
      size: 26,
      color: good ? colors.ball : colors.live,
      font: display,
      weight: 900,
      alpha: Math.min(1, state.resultTimer * 2),
    })
  } else if (state.phase === 'idle') {
    drawHint(context, 'Hold to charge · release in the green', 20, 8, mono, { anchor: 'left' })
  }

  context.restore()
  return viewport
}
