/** Theme tokens every mini-game reads when drawing. */
export const GAME_TOKENS = [
  'ball',
  'ball-light',
  'ball-shade',
  'ball-seam',
  'court-line',
  'ink',
  'board',
  'board-ink',
  'live',
  'shadow',
  'font-mono',
  'font-display',
] as const

export type GameColors = Record<(typeof GAME_TOKENS)[number], string>

export interface GameProps {
  /** False while the game's card is covered by the next one in the stack; the loop pauses. */
  active: boolean
}

export interface Viewport {
  scale: number
  offsetX: number
  offsetY: number
}

/** Letterboxes a fixed logical playfield into the canvas. */
export function fitViewport(
  width: number,
  height: number,
  logicalWidth: number,
  logicalHeight: number,
): Viewport {
  const scale = Math.min(width / logicalWidth, height / logicalHeight)
  return {
    scale,
    offsetX: (width - logicalWidth * scale) / 2,
    offsetY: (height - logicalHeight * scale) / 2,
  }
}

export function toLogical(viewport: Viewport, x: number, y: number): [number, number] {
  return [(x - viewport.offsetX) / viewport.scale, (y - viewport.offsetY) / viewport.scale]
}

/** Pointer position relative to the canvas, in CSS pixels. */
export function canvasPoint(event: {
  clientX: number
  clientY: number
  currentTarget: Element
}): [number, number] {
  const rect = event.currentTarget.getBoundingClientRect()
  return [event.clientX - rect.left, event.clientY - rect.top]
}

export function drawBall(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  colors: GameColors,
  seams = true,
) {
  const gradient = context.createRadialGradient(
    x - radius * 0.35,
    y - radius * 0.4,
    radius * 0.1,
    x,
    y,
    radius,
  )
  gradient.addColorStop(0, colors['ball-light'])
  gradient.addColorStop(0.55, colors.ball)
  gradient.addColorStop(1, colors['ball-shade'])
  context.fillStyle = gradient
  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2)
  context.fill()
  if (!seams || radius < 5) return
  context.strokeStyle = colors['ball-seam']
  context.lineWidth = Math.max(1, radius * 0.14)
  context.beginPath()
  context.arc(x - radius * 1.25, y, radius * 0.95, -0.7, 0.7)
  context.stroke()
  context.beginPath()
  context.arc(x + radius * 1.25, y, radius * 0.95, Math.PI - 0.7, Math.PI + 0.7)
  context.stroke()
}

export function drawShadow(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  alpha = 0.35,
) {
  context.fillStyle = `rgba(0, 0, 0, ${alpha})`
  context.beginPath()
  context.ellipse(x, y, radius, radius * 0.55, 0, 0, Math.PI * 2)
  context.fill()
}

interface LabelOptions {
  size: number
  color: string
  font: string
  align?: CanvasTextAlign
  weight?: number
  alpha?: number
}

/**
 * An instruction line on a dark pill, so it stays readable over court lines and bright turf.
 * `x` is the pill's centre, or its left edge when `anchor` is 'left'.
 */
export function drawHint(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  { size = 4.4, anchor = 'center' }: { size?: number; anchor?: 'center' | 'left' } = {},
) {
  context.save()
  context.font = `700 ${size}px ${font}`
  const width = context.measureText(text).width + size * 2.4
  const height = size * 2.1
  const centre = anchor === 'left' ? x + width / 2 : x
  context.fillStyle = 'rgba(3, 8, 16, 0.74)'
  context.beginPath()
  context.roundRect(centre - width / 2, y - height / 2, width, height, height / 2)
  context.fill()
  context.restore()
  drawLabel(context, text, centre, y, { size, color: '#ffffff', font, weight: 700 })
}

export function drawLabel(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  { size, color, font, align = 'center', weight = 800, alpha = 1 }: LabelOptions,
) {
  context.save()
  context.globalAlpha = alpha
  context.fillStyle = color
  context.font = `${weight} ${size}px ${font}`
  context.textAlign = align
  context.textBaseline = 'middle'
  context.fillText(text, x, y)
  context.restore()
}
