import { clamp } from '../../../lib/math'
import { drawLabel, drawShadow, fitViewport, type GameColors, type Viewport } from './shared'

/** Logical table size; everything below is in these units. */
export const TABLE = { width: 160, height: 100 } as const
/** Floor around the table, so a ball going out is visibly seen leaving it. */
export const TABLE_MARGIN = 7
const VIEW = { width: TABLE.width + TABLE_MARGIN * 2, height: TABLE.height + TABLE_MARGIN * 2 }

const PADDLE = { width: 3.2, height: 20, inset: 7 }
/** How close to the sideline a paddle's centre may go. */
const PADDLE_REACH = 2
const BALL_RADIUS = 1.9
const SERVE_SPEED = 82
const MAX_SPEED = 185
const CPU_SPEED = 64
const WINNING_SCORE = 5
const POINT_PAUSE = 1.1
/** Steepest return angle, in radians; enough for a corner-to-corner cross-court winner. */
const MAX_ANGLE = 0.62
/**
 * Where a paddle-edge hit lands, as a multiple of the half-table width. Slightly over 1, so
 * only the very edge of the paddle sends the ball past the sideline.
 */
const AIM_REACH = 1.1
/** How often the CPU goes for too much and misses the table. */
const CPU_ERROR_RATE = 0.06
/** Where a shot bounces on the receiver's half, as a share of that half measured from the net. */
const BOUNCE_DEPTH: [number, number] = [0.3, 0.75]
/** Peak drawn height of the ball before and after its bounce, in table units. */
const ARC_HEIGHT = { flight: 6, rebound: 4 }
const MARK_SECONDS = 1.2

export type PongStatus = 'ready' | 'rally' | 'point' | 'over'
export type PongEvent = 'paddle' | 'bounce' | 'out' | 'point' | 'win' | 'lose'
export type Side = 'player' | 'cpu'

export interface PongState {
  status: PongStatus
  ball: { x: number; y: number; vx: number; vy: number }
  speed: number
  playerY: number
  cpuY: number
  cpuAim: number
  score: { player: number; cpu: number }
  pause: number
  /** Which way the next serve travels: toward whoever lost the last point. */
  serveDirection: 1 | -1
  /** Whoever touched the ball last; they lose the point if it lands off the table. */
  lastHitter: Side
  /** Umpire's call for the point just played, shown during the pause. */
  call: 'out' | 'winner' | null
  /**
   * The shot in flight. Every shot must bounce on the receiver's half: off the side before that
   * bounce is out; off the side after it is a clean winner the receiver couldn't reach.
   */
  shot: { fromX: number; bounceX: number; bounced: boolean }
  /** Where the last bounce landed, for the fading mark on the table. */
  mark: { x: number; y: number; age: number } | null
  trail: [number, number][]
}

export function createPong(): PongState {
  return {
    status: 'ready',
    ball: { x: TABLE.width / 2, y: TABLE.height / 2, vx: 0, vy: 0 },
    speed: SERVE_SPEED,
    playerY: TABLE.height / 2,
    cpuY: TABLE.height / 2,
    cpuAim: 0,
    score: { player: 0, cpu: 0 },
    pause: 0,
    serveDirection: 1,
    lastHitter: 'player',
    call: null,
    shot: { fromX: TABLE.width / 2, bounceX: TABLE.width * 0.75, bounced: false },
    mark: null,
    trail: [],
  }
}

/** Starts (or restarts) play from the ready / game-over screens. */
export function startPong(state: PongState) {
  if (state.status === 'over') state.score = { player: 0, cpu: 0 }
  if (state.status === 'ready' || state.status === 'over') serve(state)
}

function serve(state: PongState) {
  const angle = (Math.random() - 0.5) * 0.5
  state.speed = SERVE_SPEED
  state.ball = {
    x: TABLE.width / 2,
    y: TABLE.height / 2,
    vx: Math.cos(angle) * SERVE_SPEED * state.serveDirection,
    vy: Math.sin(angle) * SERVE_SPEED,
  }
  state.lastHitter = state.serveDirection === 1 ? 'player' : 'cpu'
  state.call = null
  state.trail = []
  state.status = 'rally'
  planBounce(state, state.serveDirection)
}

/** Picks where the shot now in flight will bounce on the receiver's half. */
function planBounce(state: PongState, direction: 1 | -1) {
  const [near, far] = BOUNCE_DEPTH
  const depth = near + Math.random() * (far - near)
  state.shot = {
    fromX: state.ball.x,
    bounceX: TABLE.width / 2 + direction * depth * (TABLE.width / 2),
    bounced: false,
  }
}

function launch(state: PongState, angle: number, direction: 1 | -1) {
  state.speed = Math.min(state.speed * 1.07, MAX_SPEED)
  state.ball.vx = Math.cos(angle) * state.speed * direction
  state.ball.vy = Math.sin(angle) * state.speed
}

const RUN = TABLE.width - PADDLE.inset * 2 - PADDLE.width * 2

/** Angle that carries the ball from its current height to `landingY` at the far paddle. */
const angleTo = (state: PongState, landingY: number) =>
  clamp(Math.atan2(landingY - state.ball.y, RUN), -MAX_ANGLE, MAX_ANGLE)

/**
 * The visitor's return. Like aiming a real bat, the contact point picks a landing spot on the
 * far side: centre of the paddle → middle of the table, edges → the sidelines (or just past).
 */
function playerReturn(state: PongState) {
  const offset = clamp((state.ball.y - state.playerY) / (PADDLE.height / 2), -1, 1)
  const landing = TABLE.height / 2 + offset * (TABLE.height / 2) * AIM_REACH
  launch(state, angleTo(state, landing), 1)
  planBounce(state, 1)
  state.lastHitter = 'player'
}

/** The CPU aims its bounce at a spot on your half, and now and then misses the table with it. */
function cpuReturn(state: PongState) {
  planBounce(state, -1)
  const overcook = Math.random() < CPU_ERROR_RATE
  const bounceY = overcook
    ? Math.random() < 0.5
      ? -6
      : TABLE.height + 6
    : 10 + Math.random() * (TABLE.height - 20)
  const run = Math.abs(state.shot.bounceX - state.ball.x)
  const angle = clamp(Math.atan2(bounceY - state.ball.y, run), -MAX_ANGLE, MAX_ANGLE)
  launch(state, angle, -1)
  state.lastHitter = 'cpu'
}

const offTable = (y: number) => y < 0 || y > TABLE.height

/** Drawn height of the ball: an arc down to the bounce, then a smaller one after it. */
function ballHeight(state: PongState): number {
  const { fromX, bounceX, bounced } = state.shot
  const x = state.ball.x
  if (!bounced) {
    const t = clamp((x - fromX) / (bounceX - fromX || 1), 0, 1)
    return 4 * ARC_HEIGHT.flight * t * (1 - t)
  }
  const t = clamp(Math.abs(x - bounceX) / 70, 0, 1)
  return 4 * ARC_HEIGHT.rebound * t * (1 - t)
}

function awardPoint(state: PongState, winner: Side, call: PongState['call'], events: PongEvent[]) {
  state.score[winner] += 1
  state.call = call
  state.serveDirection = winner === 'player' ? 1 : -1
  events.push('point')
  if (state.score.player >= WINNING_SCORE || state.score.cpu >= WINNING_SCORE) {
    state.status = 'over'
    events.push(state.score.player > state.score.cpu ? 'win' : 'lose')
  } else {
    state.status = 'point'
    state.pause = POINT_PAUSE
  }
}

/** Advances the simulation; `targetY` is where the visitor wants their paddle. */
export function stepPong(state: PongState, delta: number, targetY: number): PongEvent[] {
  const events: PongEvent[] = []
  const halfPaddle = PADDLE.height / 2
  // Paddles can reach past the corners, so a ball in the corner can still be hit back inward.
  const reach = PADDLE_REACH
  // The paddle sits exactly where the pointer is: any easing here reads as input lag.
  state.playerY = clamp(targetY, reach, TABLE.height - reach)
  if (state.mark) {
    state.mark.age += delta
    if (state.mark.age > MARK_SECONDS) state.mark = null
  }

  if (state.status === 'point') {
    state.pause -= delta
    if (state.pause <= 0) serve(state)
    return events
  }
  if (state.status !== 'rally') return events

  const { ball } = state
  ball.x += ball.vx * delta
  ball.y += ball.vy * delta
  state.trail.push([ball.x, ball.y])
  if (state.trail.length > 10) state.trail.shift()

  const hitter = state.lastHitter
  const receiver: Side = hitter === 'player' ? 'cpu' : 'player'
  const { shot } = state

  if (!shot.bounced) {
    // Reaching the planned bounce: it has to land on the table.
    const reached = ball.vx > 0 ? ball.x >= shot.bounceX : ball.x <= shot.bounceX
    if (reached) {
      shot.bounced = true
      state.mark = { x: shot.bounceX, y: ball.y, age: 0 }
      if (offTable(ball.y)) {
        events.push('out')
        awardPoint(state, receiver, 'out', events)
        return events
      }
      events.push('bounce')
    } else if (ball.y < -BALL_RADIUS * 2 || ball.y > TABLE.height + BALL_RADIUS * 2) {
      // Off the side before bouncing: it can only land outside the table.
      events.push('out')
      awardPoint(state, receiver, 'out', events)
      return events
    }
  } else if (ball.y < -TABLE_MARGIN - 4 || ball.y > TABLE.height + TABLE_MARGIN + 4) {
    // Bounced in, then kicked off wide: a clean winner the receiver can't reach.
    awardPoint(state, hitter, 'winner', events)
    return events
  }

  // CPU tracks the ball when it's coming its way, with a small, re-rolled aiming error.
  const cpuTarget = ball.vx > 0 ? ball.y + state.cpuAim : TABLE.height / 2
  const cpuStep = CPU_SPEED * delta
  state.cpuY += clamp(cpuTarget - state.cpuY, -cpuStep, cpuStep)
  state.cpuY = clamp(state.cpuY, reach, TABLE.height - reach)

  const playerFace = PADDLE.inset + PADDLE.width
  if (ball.vx < 0 && ball.x - BALL_RADIUS <= playerFace && ball.x > PADDLE.inset - BALL_RADIUS) {
    if (Math.abs(ball.y - state.playerY) <= halfPaddle + BALL_RADIUS) {
      ball.x = playerFace + BALL_RADIUS
      playerReturn(state)
      state.cpuAim = (Math.random() - 0.5) * 22
      events.push('paddle')
    }
  }

  const cpuFace = TABLE.width - PADDLE.inset - PADDLE.width
  if (
    ball.vx > 0 &&
    ball.x + BALL_RADIUS >= cpuFace &&
    ball.x < TABLE.width - PADDLE.inset + BALL_RADIUS
  ) {
    if (Math.abs(ball.y - state.cpuY) <= halfPaddle + BALL_RADIUS) {
      ball.x = cpuFace - BALL_RADIUS
      cpuReturn(state)
      events.push('paddle')
    }
  }

  // Past a paddle: that side couldn't get it back.
  if (ball.x > TABLE.width + TABLE_MARGIN) awardPoint(state, 'player', 'winner', events)
  else if (ball.x < -TABLE_MARGIN) awardPoint(state, 'cpu', 'winner', events)

  return events
}

const TABLE_COLOR = { day: '#1f7a57', night: '#15563f' }

/** Racket blade half-sizes (across / along the table) and the handle behind it. */
const BLADE = { rx: 5, ry: PADDLE.height / 2 }
const HANDLE = { length: 6, width: 3.4 }

/**
 * A table tennis bat seen from above. Its blade's inner edge sits exactly on `faceX`, the same
 * hitting line the physics uses, and the handle points back off the table. `facing` is +1 for
 * a bat facing right (yours, on the left) and -1 for the CPU's.
 */
function drawRacket(
  context: CanvasRenderingContext2D,
  faceX: number,
  y: number,
  facing: 1 | -1,
  rubber: string,
) {
  const cx = faceX - facing * BLADE.rx
  const back = cx - facing * BLADE.rx
  const handleX = facing === 1 ? back - HANDLE.length : back - 1.5
  const ellipse = (x: number, cy: number, rx: number, ry: number) => {
    context.beginPath()
    context.ellipse(x, cy, rx, ry, 0, 0, Math.PI * 2)
    context.fill()
  }

  // Shadow
  context.fillStyle = 'rgba(0, 0, 0, 0.28)'
  ellipse(cx + 1, y + 1.4, BLADE.rx, BLADE.ry)
  context.beginPath()
  context.roundRect(handleX + 1, y - HANDLE.width / 2 + 1.4, HANDLE.length + 1.5, HANDLE.width, 1.2)
  context.fill()

  // Handle, tucked under the blade so the joint is hidden
  context.fillStyle = '#8a5a2b'
  context.beginPath()
  context.roundRect(handleX, y - HANDLE.width / 2, HANDLE.length + 1.5, HANDLE.width, 1.2)
  context.fill()
  context.strokeStyle = 'rgba(255, 255, 255, 0.18)'
  context.lineWidth = 0.35
  context.beginPath()
  for (const offset of [-0.7, 0.7]) {
    context.moveTo(handleX + 0.8, y + offset)
    context.lineTo(handleX + HANDLE.length + 0.7, y + offset)
  }
  context.stroke()

  // Blade: wooden edge, rubber face, soft sheen
  context.fillStyle = '#c99a5b'
  ellipse(cx, y, BLADE.rx + 0.6, BLADE.ry + 0.6)
  context.fillStyle = rubber
  ellipse(cx, y, BLADE.rx, BLADE.ry)
  context.fillStyle = 'rgba(255, 255, 255, 0.14)'
  ellipse(cx - facing * 1, y - BLADE.ry * 0.35, BLADE.rx * 0.45, BLADE.ry * 0.35)
}

export function drawPong(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: PongState,
  colors: GameColors,
  theme: 'day' | 'night',
): Viewport {
  const viewport = fitViewport(width, height, VIEW.width, VIEW.height)
  context.clearRect(0, 0, width, height)
  context.save()
  context.translate(viewport.offsetX, viewport.offsetY)
  context.scale(viewport.scale, viewport.scale)
  context.translate(TABLE_MARGIN, TABLE_MARGIN)

  // Table
  context.fillStyle = TABLE_COLOR[theme]
  context.beginPath()
  context.roundRect(0, 0, TABLE.width, TABLE.height, 3)
  context.fill()
  context.strokeStyle = '#ffffff'
  context.lineWidth = 1.2
  context.strokeRect(0.6, 0.6, TABLE.width - 1.2, TABLE.height - 1.2)
  context.lineWidth = 0.5
  context.beginPath()
  context.moveTo(0, TABLE.height / 2)
  context.lineTo(TABLE.width, TABLE.height / 2)
  context.stroke()

  // Scores, painted faintly on each half
  const font = colors['font-display']
  drawLabel(context, String(state.score.player), TABLE.width * 0.27, TABLE.height / 2, {
    size: 46,
    color: '#ffffff',
    font,
    alpha: 0.12,
    weight: 900,
  })
  drawLabel(context, String(state.score.cpu), TABLE.width * 0.73, TABLE.height / 2, {
    size: 46,
    color: '#ffffff',
    font,
    alpha: 0.12,
    weight: 900,
  })

  // Net
  context.fillStyle = 'rgba(0, 0, 0, 0.28)'
  context.fillRect(TABLE.width / 2 + 0.6, -3, 2.2, TABLE.height + 6)
  context.fillStyle = '#0d1119'
  context.fillRect(TABLE.width / 2 - 0.9, -3, 1.8, TABLE.height + 6)
  context.fillStyle = '#ffffff'
  context.fillRect(TABLE.width / 2 - 0.9, -3, 1.8, 0.8)

  // Rackets
  drawRacket(context, PADDLE.inset + PADDLE.width, state.playerY, 1, '#d6343c')
  drawRacket(context, TABLE.width - PADDLE.inset - PADDLE.width, state.cpuY, -1, '#15171c')

  // Bounce mark
  if (state.mark) {
    const alpha = 1 - state.mark.age / MARK_SECONDS
    context.fillStyle = `rgba(255, 255, 255, ${0.45 * alpha})`
    context.beginPath()
    context.ellipse(state.mark.x, state.mark.y, 2.6, 1.6, 0, 0, Math.PI * 2)
    context.fill()
  }

  // Ball
  const { ball } = state
  const lift = ballHeight(state)
  state.trail.forEach(([x, y], index) => {
    context.fillStyle = `rgba(255, 255, 255, ${(index / state.trail.length) * 0.25})`
    context.beginPath()
    context.arc(x, y, BALL_RADIUS * (index / state.trail.length), 0, Math.PI * 2)
    context.fill()
  })
  // Higher ball: shadow drifts further away and fades, and the ball looks a touch bigger.
  drawShadow(
    context,
    ball.x + 0.6 + lift * 0.5,
    ball.y + 0.8 + lift * 0.7,
    BALL_RADIUS * 0.9,
    0.34 - lift * 0.025,
  )
  const radius = BALL_RADIUS * (1 + lift * 0.035)
  const gradient = context.createRadialGradient(
    ball.x - 0.6,
    ball.y - 0.7,
    0.2,
    ball.x,
    ball.y,
    radius,
  )
  gradient.addColorStop(0, '#ffffff')
  gradient.addColorStop(1, '#f1dcc3')
  context.fillStyle = gradient
  context.beginPath()
  context.arc(ball.x, ball.y, radius, 0, Math.PI * 2)
  context.fill()

  // Status
  const mono = colors['font-mono']
  if (state.status === 'point' && state.call === 'out') {
    drawLabel(context, 'OUT', TABLE.width / 2, TABLE.height / 2, {
      size: 30,
      color: colors.live,
      font: colors['font-display'],
      weight: 900,
      alpha: Math.min(1, state.pause * 2),
    })
  }
  if (state.status === 'ready' || state.status === 'over') {
    context.fillStyle = 'rgba(3, 8, 16, 0.55)'
    context.beginPath()
    context.roundRect(TABLE.width / 2 - 46, TABLE.height / 2 - 13, 92, 26, 5)
    context.fill()
    const won = state.score.player > state.score.cpu
    const title =
      state.status === 'ready'
        ? 'Click to serve'
        : won
          ? `You win ${state.score.player}–${state.score.cpu}`
          : `CPU wins ${state.score.cpu}–${state.score.player}`
    drawLabel(context, title, TABLE.width / 2, TABLE.height / 2 - 3, {
      size: 7,
      color: colors.ball,
      font: mono,
    })
    drawLabel(
      context,
      state.status === 'ready' ? 'First to 5' : 'Click for a rematch',
      TABLE.width / 2,
      TABLE.height / 2 + 6,
      {
        size: 4.2,
        color: '#ffffff',
        font: mono,
        weight: 600,
        alpha: 0.75,
      },
    )
  }

  context.restore()
  return viewport
}
