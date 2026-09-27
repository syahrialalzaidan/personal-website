import { clamp } from '../../../lib/math'
import {
  drawBall,
  drawHint,
  drawLabel,
  drawShadow,
  fitViewport,
  type GameColors,
  type Viewport,
} from './shared'

/** A 20 m × 10 m padel court seen from above, at 10 units per metre, plus the wall frame. */
export const FIELD = { width: 200, height: 100, wall: 7 } as const
export const PADEL_VIEW = {
  width: FIELD.width + FIELD.wall * 2,
  height: FIELD.height + FIELD.wall * 2,
} as const

const BALL_RADIUS = 3.2
const GLASS_REACH = 40
const GLASS_BOUNCE = 0.9
const MESH_BOUNCE = 0.5
const GRAVITY = 260
const FLASH_SECONDS = 0.5

export type PadelEvent = 'hit' | 'glass' | 'mesh' | 'bounce'

interface Impact {
  x: number
  y: number
  age: number
  glass: boolean
}

export interface PadelState {
  ball: { x: number; y: number; vx: number; vy: number; z: number; vz: number }
  impacts: Impact[]
  chain: number
  best: number
  hits: number
}

export function createPadel(): PadelState {
  return {
    ball: { x: 60, y: 50, vx: 0, vy: 0, z: 0, vz: 0 },
    impacts: [],
    chain: 0,
    best: 0,
    hits: 0,
  }
}

/** Smashes the ball toward a point on the court (court units). */
export function smash(state: PadelState, targetX: number, targetY: number): PadelEvent[] {
  const { ball } = state
  const dx = targetX - ball.x
  const dy = targetY - ball.y
  const distance = Math.hypot(dx, dy) || 1
  const speed = clamp(distance * 2.6, 140, 340)
  ball.vx = (dx / distance) * speed
  ball.vy = (dy / distance) * speed
  ball.vz = 70 + speed * 0.15
  state.chain = 0
  state.hits += 1
  return ['hit']
}

/** End walls are all glass; side walls are glass only near the ends, mesh fence in between. */
const isGlass = (x: number, vertical: boolean) =>
  vertical || x < GLASS_REACH || x > FIELD.width - GLASS_REACH

export function stepPadel(state: PadelState, delta: number): PadelEvent[] {
  const events: PadelEvent[] = []
  const { ball } = state

  ball.x += ball.vx * delta
  ball.y += ball.vy * delta
  const drag = Math.exp(-(ball.z > 0 ? 0.35 : 1.1) * delta)
  ball.vx *= drag
  ball.vy *= drag

  ball.vz -= GRAVITY * delta
  ball.z += ball.vz * delta
  if (ball.z < 0) {
    ball.z = 0
    if (Math.abs(ball.vz) > 30) events.push('bounce')
    ball.vz = Math.abs(ball.vz) > 30 ? -ball.vz * 0.55 : 0
  }

  const bounce = (vertical: boolean, x: number, y: number) => {
    const glass = isGlass(x, vertical)
    const restitution = glass ? GLASS_BOUNCE : MESH_BOUNCE
    if (vertical) ball.vx *= -restitution
    else ball.vy *= -restitution
    const speed = Math.hypot(ball.vx, ball.vy)
    if (speed > 25) {
      state.impacts.push({ x, y, age: 0, glass })
      if (glass) {
        state.chain += 1
        state.best = Math.max(state.best, state.chain)
      }
      events.push(glass ? 'glass' : 'mesh')
    }
  }

  if (ball.x < BALL_RADIUS) {
    ball.x = BALL_RADIUS
    bounce(true, 0, ball.y)
  } else if (ball.x > FIELD.width - BALL_RADIUS) {
    ball.x = FIELD.width - BALL_RADIUS
    bounce(true, FIELD.width, ball.y)
  }
  if (ball.y < BALL_RADIUS) {
    ball.y = BALL_RADIUS
    bounce(false, ball.x, 0)
  } else if (ball.y > FIELD.height - BALL_RADIUS) {
    ball.y = FIELD.height - BALL_RADIUS
    bounce(false, ball.x, FIELD.height)
  }

  for (const impact of state.impacts) impact.age += delta
  state.impacts = state.impacts.filter((impact) => impact.age < FLASH_SECONDS)
  return events
}

const TURF = { day: '#2d74c4', night: '#1c4f8f' }

export function drawPadel(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: PadelState,
  colors: GameColors,
  theme: 'day' | 'night',
): Viewport {
  const viewport = fitViewport(width, height, PADEL_VIEW.width, PADEL_VIEW.height)
  context.clearRect(0, 0, width, height)
  context.save()
  context.translate(viewport.offsetX, viewport.offsetY)
  context.scale(viewport.scale, viewport.scale)

  const { wall } = FIELD
  // Wall frame: glass at both ends and the first 4 m of each side, mesh fence in between.
  context.fillStyle = 'rgba(20, 26, 38, 0.9)'
  context.beginPath()
  context.roundRect(0, 0, PADEL_VIEW.width, PADEL_VIEW.height, 4)
  context.fill()
  context.fillStyle = 'rgba(175, 215, 255, 0.35)'
  context.fillRect(0, 0, wall + GLASS_REACH, PADEL_VIEW.height)
  context.fillRect(PADEL_VIEW.width - wall - GLASS_REACH, 0, wall + GLASS_REACH, PADEL_VIEW.height)

  context.translate(wall, wall)

  context.fillStyle = TURF[theme]
  context.fillRect(0, 0, FIELD.width, FIELD.height)
  context.fillStyle = 'rgba(255, 255, 255, 0.04)'
  for (let x = 0; x < FIELD.width; x += 20) context.fillRect(x, 0, 10, FIELD.height)

  // Mesh texture on the fence sections
  context.strokeStyle = 'rgba(255, 255, 255, 0.18)'
  context.lineWidth = 0.4
  context.beginPath()
  for (let x = GLASS_REACH; x <= FIELD.width - GLASS_REACH; x += 3) {
    context.moveTo(x, -wall)
    context.lineTo(x + 3, 0)
    context.moveTo(x, FIELD.height)
    context.lineTo(x + 3, FIELD.height + wall)
  }
  context.stroke()

  // Lines
  context.strokeStyle = colors['court-line']
  context.lineWidth = 0.8
  context.beginPath()
  context.moveTo(30.5, 0)
  context.lineTo(30.5, FIELD.height)
  context.moveTo(FIELD.width - 30.5, 0)
  context.lineTo(FIELD.width - 30.5, FIELD.height)
  context.moveTo(30.5, FIELD.height / 2)
  context.lineTo(FIELD.width - 30.5, FIELD.height / 2)
  context.stroke()

  // Net
  context.fillStyle = 'rgba(0, 0, 0, 0.3)'
  context.fillRect(FIELD.width / 2 + 0.8, -wall, 2, FIELD.height + wall * 2)
  context.fillStyle = '#0d1119'
  context.fillRect(FIELD.width / 2 - 0.9, -wall, 1.8, FIELD.height + wall * 2)
  context.fillStyle = '#ffffff'
  context.fillRect(FIELD.width / 2 - 0.9, -wall, 1.8, 1.2)

  // Glass impacts: a flash plus a ripple
  for (const impact of state.impacts) {
    const t = impact.age / FLASH_SECONDS
    const radius = 6 + t * 26
    const alpha = (1 - t) * (impact.glass ? 0.9 : 0.4)
    const glow = context.createRadialGradient(impact.x, impact.y, 0, impact.x, impact.y, radius)
    glow.addColorStop(0, `rgba(255, 255, 255, ${alpha})`)
    glow.addColorStop(1, 'rgba(200, 235, 255, 0)')
    context.fillStyle = glow
    context.beginPath()
    context.arc(impact.x, impact.y, radius, 0, Math.PI * 2)
    context.fill()
  }

  // Ball
  const { ball } = state
  drawShadow(context, ball.x + ball.z * 0.25, ball.y + ball.z * 0.35, BALL_RADIUS * 1.1, 0.3)
  drawBall(context, ball.x, ball.y - ball.z * 0.15, BALL_RADIUS * (1 + ball.z / 90), colors)

  // HUD
  const display = colors['font-display']
  const mono = colors['font-mono']
  drawLabel(context, `×${state.chain}`, 8, 12, {
    size: 16,
    color: '#ffffff',
    font: display,
    align: 'left',
    weight: 900,
  })
  drawLabel(context, `OFF THE GLASS · BEST ×${state.best}`, 8, 24, {
    size: 4.2,
    color: '#ffffff',
    font: mono,
    align: 'left',
    weight: 700,
    alpha: 0.75,
  })
  if (state.hits === 0) {
    drawHint(context, 'Click anywhere to smash', FIELD.width / 2, FIELD.height - 10, mono, {
      size: 5,
    })
  }

  context.restore()
  return viewport
}
