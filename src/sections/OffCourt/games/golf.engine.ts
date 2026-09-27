import { clamp, lerp } from '../../../lib/math'
import {
  drawHint,
  drawLabel,
  drawShadow,
  fitViewport,
  type GameColors,
  type Viewport,
} from './shared'

export const GREEN_VIEW = { width: 200, height: 125 } as const

const GREEN = { x: 100, y: 64, rx: 90, ry: 52 }
const BALL_RADIUS = 2.4
const HOLE_RADIUS = 3.6
const MAX_SPEED = 190
const POWER = 2.3
const GREEN_FRICTION = 36
const ROUGH_FRICTION = 120
const CAPTURE_SPEED = 90
const PAR = 2

export type GolfPhase = 'aim' | 'rolling' | 'sinking' | 'holed'
export type GolfEvent = 'putt' | 'lip' | 'holed' | 'wall'

export interface GolfState {
  phase: GolfPhase
  ball: { x: number; y: number; vx: number; vy: number }
  hole: { x: number; y: number }
  slope: { x: number; y: number }
  drag: { fromX: number; fromY: number; toX: number; toY: number } | null
  strokes: number
  holesPlayed: number
  totalStrokes: number
  timer: number
  time: number
}

const insideGreen = (x: number, y: number, margin = 0) =>
  ((x - GREEN.x) / (GREEN.rx - margin)) ** 2 + ((y - GREEN.y) / (GREEN.ry - margin)) ** 2 <= 1

function newHole(state: GolfState) {
  state.ball = { x: 30 + Math.random() * 20, y: 45 + Math.random() * 38, vx: 0, vy: 0 }
  let hole = { x: 150, y: 64 }
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = { x: 120 + Math.random() * 55, y: 30 + Math.random() * 68 }
    if (insideGreen(candidate.x, candidate.y, 12)) {
      hole = candidate
      break
    }
  }
  state.hole = hole
  const angle = Math.random() * Math.PI * 2
  const strength = 4 + Math.random() * 8
  state.slope = { x: Math.cos(angle) * strength, y: Math.sin(angle) * strength }
  state.strokes = 0
  state.phase = 'aim'
}

export function createGolf(): GolfState {
  const state: GolfState = {
    phase: 'aim',
    ball: { x: 40, y: 64, vx: 0, vy: 0 },
    hole: { x: 150, y: 64 },
    slope: { x: 0, y: 6 },
    drag: null,
    strokes: 0,
    holesPlayed: 0,
    totalStrokes: 0,
    timer: 0,
    time: 0,
  }
  newHole(state)
  return state
}

export function startAim(state: GolfState, x: number, y: number) {
  if (state.phase !== 'aim') return
  state.drag = { fromX: x, fromY: y, toX: x, toY: y }
}

export function moveAim(state: GolfState, x: number, y: number) {
  if (!state.drag) return
  state.drag.toX = x
  state.drag.toY = y
}

/** Pull-back putt: the ball travels opposite to the drag, like a slingshot. */
export function releaseAim(state: GolfState): GolfEvent[] {
  const drag = state.drag
  state.drag = null
  if (!drag || state.phase !== 'aim') return []
  const dx = drag.fromX - drag.toX
  const dy = drag.fromY - drag.toY
  if (Math.hypot(dx, dy) < 3) return []
  const speed = Math.min(Math.hypot(dx, dy) * POWER, MAX_SPEED)
  const length = Math.hypot(dx, dy)
  state.ball.vx = (dx / length) * speed
  state.ball.vy = (dy / length) * speed
  state.strokes += 1
  state.phase = 'rolling'
  return ['putt']
}

export function cancelAim(state: GolfState) {
  state.drag = null
}

export function stepGolf(state: GolfState, delta: number): GolfEvent[] {
  const events: GolfEvent[] = []
  state.time += delta
  const { ball, hole } = state

  if (state.phase === 'rolling') {
    ball.x += ball.vx * delta
    ball.y += ball.vy * delta
    const speed = Math.hypot(ball.vx, ball.vy)
    const friction = insideGreen(ball.x, ball.y) ? GREEN_FRICTION : ROUGH_FRICTION
    const nextSpeed = Math.max(0, speed - friction * delta)
    const factor = speed > 0 ? nextSpeed / speed : 0
    ball.vx = ball.vx * factor + state.slope.x * delta
    ball.vy = ball.vy * factor + state.slope.y * delta

    if (ball.x < BALL_RADIUS || ball.x > GREEN_VIEW.width - BALL_RADIUS) {
      ball.x = clamp(ball.x, BALL_RADIUS, GREEN_VIEW.width - BALL_RADIUS)
      ball.vx *= -0.5
      events.push('wall')
    }
    if (ball.y < BALL_RADIUS || ball.y > GREEN_VIEW.height - BALL_RADIUS) {
      ball.y = clamp(ball.y, BALL_RADIUS, GREEN_VIEW.height - BALL_RADIUS)
      ball.vy *= -0.5
      events.push('wall')
    }

    const toHole = Math.hypot(hole.x - ball.x, hole.y - ball.y)
    const currentSpeed = Math.hypot(ball.vx, ball.vy)
    if (toHole < HOLE_RADIUS) {
      if (currentSpeed < CAPTURE_SPEED) {
        state.phase = 'sinking'
        state.timer = 0.35
      } else {
        // Too hot: it lips out, losing pace and kicking sideways.
        ball.vx = ball.vx * 0.7 + (ball.y - hole.y) * 6
        ball.vy = ball.vy * 0.7 - (ball.x - hole.x) * 6
        events.push('lip')
      }
    } else if (currentSpeed < 3) {
      ball.vx = 0
      ball.vy = 0
      state.phase = 'aim'
    }
  } else if (state.phase === 'sinking') {
    state.timer -= delta
    const pull = 1 - Math.exp(-18 * delta)
    ball.x = lerp(ball.x, hole.x, pull)
    ball.y = lerp(ball.y, hole.y, pull)
    if (state.timer <= 0) {
      state.phase = 'holed'
      state.timer = 1.8
      state.holesPlayed += 1
      state.totalStrokes += state.strokes
      events.push('holed')
    }
  } else if (state.phase === 'holed') {
    state.timer -= delta
    if (state.timer <= 0) newHole(state)
  }

  return events
}

function scoreName(strokes: number): string {
  if (strokes === 1) return 'Hole in one!'
  const diff = strokes - PAR
  if (diff < 0) return 'Birdie'
  if (diff === 0) return 'Par'
  if (diff === 1) return 'Bogey'
  return `Holed in ${strokes}`
}

const TURF = {
  day: { rough: '#3f7d3a', green: '#5fae52', fringe: '#4e9646' },
  night: { rough: '#1f4a27', green: '#327c3a', fringe: '#2a6532' },
}

export function drawGolf(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: GolfState,
  colors: GameColors,
  theme: 'day' | 'night',
): Viewport {
  const viewport = fitViewport(width, height, GREEN_VIEW.width, GREEN_VIEW.height)
  const turf = TURF[theme]
  context.clearRect(0, 0, width, height)
  context.save()
  context.translate(viewport.offsetX, viewport.offsetY)
  context.scale(viewport.scale, viewport.scale)
  context.beginPath()
  context.roundRect(0, 0, GREEN_VIEW.width, GREEN_VIEW.height, 4)
  context.clip()

  context.fillStyle = turf.rough
  context.fillRect(0, 0, GREEN_VIEW.width, GREEN_VIEW.height)
  context.fillStyle = 'rgba(0, 0, 0, 0.06)'
  for (let x = -40; x < GREEN_VIEW.width; x += 24) context.fillRect(x, 0, 12, GREEN_VIEW.height)

  context.fillStyle = turf.fringe
  context.beginPath()
  context.ellipse(GREEN.x, GREEN.y, GREEN.rx + 5, GREEN.ry + 5, 0, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = turf.green
  context.beginPath()
  context.ellipse(GREEN.x, GREEN.y, GREEN.rx, GREEN.ry, 0, 0, Math.PI * 2)
  context.fill()

  // Mowing stripes, clipped to the green
  context.save()
  context.clip()
  context.fillStyle = 'rgba(255, 255, 255, 0.07)'
  for (let x = -60; x < GREEN_VIEW.width + 60; x += 20) {
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x + 10, 0)
    context.lineTo(x - 30, GREEN_VIEW.height)
    context.lineTo(x - 40, GREEN_VIEW.height)
    context.fill()
  }
  context.restore()

  // Slope arrow
  const { slope } = state
  const slopeLength = Math.hypot(slope.x, slope.y)
  const arrowX = 18
  const arrowY = GREEN_VIEW.height - 18
  context.save()
  context.translate(arrowX, arrowY)
  context.rotate(Math.atan2(slope.y, slope.x))
  context.strokeStyle = 'rgba(255, 255, 255, 0.85)'
  context.lineWidth = 1.2
  context.beginPath()
  context.moveTo(-6, 0)
  context.lineTo(6, 0)
  context.lineTo(3, -2.5)
  context.moveTo(6, 0)
  context.lineTo(3, 2.5)
  context.stroke()
  context.restore()
  drawLabel(context, `SLOPE ${Math.round(slopeLength * 10) / 10}`, arrowX, arrowY + 10, {
    size: 3.6,
    color: '#ffffff',
    font: colors['font-mono'],
    weight: 700,
    alpha: 0.8,
  })

  // Hole and flag
  const { hole, ball } = state
  context.fillStyle = '#0b0f0a'
  context.beginPath()
  context.arc(hole.x, hole.y, HOLE_RADIUS, 0, Math.PI * 2)
  context.fill()
  context.strokeStyle = 'rgba(255, 255, 255, 0.5)'
  context.lineWidth = 0.5
  context.stroke()

  const flagTop = { x: hole.x + 7, y: hole.y - 34 }
  context.strokeStyle = 'rgba(0, 0, 0, 0.25)'
  context.lineWidth = 1.2
  context.beginPath()
  context.moveTo(hole.x, hole.y)
  context.lineTo(hole.x + 26, hole.y + 9)
  context.stroke()
  context.strokeStyle = '#f4f1ea'
  context.beginPath()
  context.moveTo(hole.x, hole.y)
  context.lineTo(flagTop.x, flagTop.y)
  context.stroke()
  const wave = Math.sin(state.time * 4) * 1.5
  context.fillStyle = colors.live
  context.beginPath()
  context.moveTo(flagTop.x, flagTop.y)
  context.quadraticCurveTo(flagTop.x + 8, flagTop.y + 1 + wave, flagTop.x + 15, flagTop.y + 3)
  context.lineTo(flagTop.x - 1, flagTop.y + 9)
  context.closePath()
  context.fill()

  // Aim line
  if (state.drag) {
    const dx = state.drag.fromX - state.drag.toX
    const dy = state.drag.fromY - state.drag.toY
    const power = Math.min(Math.hypot(dx, dy) * POWER, MAX_SPEED) / MAX_SPEED
    const angle = Math.atan2(dy, dx)
    const reach = 12 + power * 60
    context.strokeStyle = `rgba(255, 255, 255, ${0.5 + power * 0.5})`
    context.lineWidth = 1
    context.setLineDash([2.5, 2.5])
    context.beginPath()
    context.moveTo(ball.x, ball.y)
    context.lineTo(ball.x + Math.cos(angle) * reach, ball.y + Math.sin(angle) * reach)
    context.stroke()
    context.setLineDash([])
    context.strokeStyle = colors.ball
    context.lineWidth = 1.4
    context.beginPath()
    context.arc(ball.x, ball.y, 7, -Math.PI / 2, -Math.PI / 2 + power * Math.PI * 2)
    context.stroke()
  }

  // Ball
  if (state.phase !== 'holed') {
    const scale = state.phase === 'sinking' ? Math.max(0.2, state.timer / 0.35) : 1
    drawShadow(context, ball.x + 1, ball.y + 1.4, BALL_RADIUS * scale, 0.3)
    const gradient = context.createRadialGradient(
      ball.x - 0.8,
      ball.y - 0.8,
      0.2,
      ball.x,
      ball.y,
      BALL_RADIUS * scale,
    )
    gradient.addColorStop(0, '#ffffff')
    gradient.addColorStop(1, '#cfd3d6')
    context.fillStyle = gradient
    context.beginPath()
    context.arc(ball.x, ball.y, BALL_RADIUS * scale, 0, Math.PI * 2)
    context.fill()
  }

  // HUD
  const mono = colors['font-mono']
  const display = colors['font-display']
  drawLabel(context, `STROKE ${state.strokes} · PAR ${PAR}`, 8, 9, {
    size: 4.4,
    color: '#ffffff',
    font: mono,
    align: 'left',
    weight: 700,
  })
  drawLabel(
    context,
    `HOLES ${state.holesPlayed} · TOTAL ${state.totalStrokes}`,
    GREEN_VIEW.width - 8,
    9,
    {
      size: 4.4,
      color: '#ffffff',
      font: mono,
      align: 'right',
      weight: 700,
      alpha: 0.8,
    },
  )
  if (state.phase === 'holed') {
    drawLabel(context, scoreName(state.strokes), GREEN_VIEW.width / 2, GREEN_VIEW.height / 2, {
      size: 20,
      color: colors.ball,
      font: display,
      weight: 900,
    })
  } else if (state.phase === 'aim' && state.strokes === 0 && !state.drag) {
    drawHint(
      context,
      'Drag back from the ball, release to putt',
      GREEN_VIEW.width / 2,
      GREEN_VIEW.height - 8,
      mono,
    )
  }

  context.restore()
  return viewport
}
