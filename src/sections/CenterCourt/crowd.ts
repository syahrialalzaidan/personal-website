import { createRandom } from '../../lib/math'
import type { StadiumLayout } from './stadium'

export interface Fan {
  x: number
  /** Seat line — where the fan's body meets the row. */
  y: number
  height: number
  shirt: number
  skin: number
  hat: number | null
  phone: boolean
}

export interface StandRow {
  top: number
  bottom: number
}

export interface Crowd {
  rows: StandRow[]
  fans: Fan[]
  aisles: number[]
  aisleWidth: number
}

export interface CrowdPalette {
  shirts: string[]
  skins: string[]
  hats: string[]
  standBack: string
  standFront: string
  roof: string
  light: string
  shade: string
}

const SHIRTS = {
  night: [
    '#2b477a',
    '#46356b',
    '#1f5552',
    '#6a2f42',
    '#34405a',
    '#56592e',
    '#7a4526',
    '#303754',
    '#c9ccd6',
  ],
  day: [
    '#f6f2ea',
    '#e05a3a',
    '#2f6db5',
    '#f2c14e',
    '#3a8f6a',
    '#d9d2c3',
    '#1f2d44',
    '#c2446b',
    '#88b04b',
  ],
}
const SKINS = ['#f1c7a3', '#d9a47a', '#b57b52', '#8a5a3b', '#e8b690']
const HATS = ['#ffffff', '#f2c14e', '#2f6db5', '#e05a3a']

export function crowdPalette(theme: 'day' | 'night', tokens: Record<string, string>): CrowdPalette {
  return {
    shirts: SHIRTS[theme],
    skins: SKINS,
    hats: HATS,
    standBack: tokens['stand-back'] ?? '#0a1730',
    standFront: tokens['stand-front'] ?? '#0e1f3f',
    roof: tokens.board ?? '#03070f',
    light: tokens.light ?? '#fff6de',
    shade: theme === 'night' ? 'rgba(2, 6, 16, 0.42)' : 'rgba(60, 30, 10, 0.2)',
  }
}

/** Builds tiered stands whose rows shrink with distance, then seats a deterministic crowd. */
export function generateCrowd(layout: StadiumLayout, seed = 7): Crowd {
  const random = createRandom(seed)
  const rowCount = layout.width > layout.height ? 9 : 12
  const shrink = 0.9
  const total = layout.standsBottom - layout.standsTop
  const firstRow = (total * (1 - shrink)) / (1 - Math.pow(shrink, rowCount))

  const rows: StandRow[] = []
  let bottom = layout.standsBottom
  for (let index = 0; index < rowCount; index += 1) {
    const height = firstRow * Math.pow(shrink, index)
    rows.push({ top: bottom - height, bottom })
    bottom -= height
  }

  const aisleWidth = firstRow * 1.3
  const aisleEvery = layout.width / (layout.width > layout.height ? 7 : 4)
  const aisles: number[] = []
  for (let x = aisleEvery / 2; x < layout.width; x += aisleEvery) aisles.push(x)

  const fans: Fan[] = []
  // Paint back rows first so nearer fans overlap them.
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const row = rows[index]
    const rowHeight = row.bottom - row.top
    const spacing = rowHeight * 0.64
    for (let x = -spacing; x < layout.width + spacing; x += spacing * (0.9 + random() * 0.25)) {
      const inAisle = aisles.some((aisle) => Math.abs(aisle - x) < aisleWidth * 0.6)
      if (inAisle || random() < 0.07) continue
      fans.push({
        x,
        y: row.bottom - rowHeight * 0.12,
        height: rowHeight * (1.02 + random() * 0.14),
        shirt: Math.floor(random() * 9),
        skin: Math.floor(random() * SKINS.length),
        hat: random() < 0.16 ? Math.floor(random() * HATS.length) : null,
        phone: random() < 0.035,
      })
    }
  }

  return { rows, fans, aisles, aisleWidth }
}

export function drawStands(
  context: CanvasRenderingContext2D,
  layout: StadiumLayout,
  crowd: Crowd,
  palette: CrowdPalette,
) {
  crowd.rows.forEach((row, index) => {
    context.fillStyle = index % 2 === 0 ? palette.standBack : palette.standFront
    context.fillRect(0, row.top, layout.width, row.bottom - row.top + 0.5)
  })

  context.fillStyle = palette.shade
  for (const aisle of crowd.aisles) {
    context.fillRect(
      aisle - crowd.aisleWidth / 2,
      layout.standsTop,
      crowd.aisleWidth,
      layout.standsBottom - layout.standsTop,
    )
  }

  // Roof overhang.
  const roofHeight = (layout.standsBottom - layout.standsTop) * 0.12
  context.fillStyle = palette.roof
  context.fillRect(0, layout.standsTop - roofHeight, layout.width, roofHeight + 2)
}

export function drawFan(
  context: CanvasRenderingContext2D,
  fan: Fan,
  palette: CrowdPalette,
  lift = 0,
) {
  const { height } = fan
  const width = height * 0.46
  const y = fan.y - lift
  const bodyHeight = height * 0.5

  if (lift > height * 0.25) {
    context.strokeStyle = palette.skins[fan.skin]
    context.lineWidth = height * 0.09
    context.lineCap = 'round'
    context.beginPath()
    context.moveTo(fan.x - width * 0.4, y - bodyHeight * 0.9)
    context.lineTo(fan.x - width * 0.55, y - height * 1.05)
    context.moveTo(fan.x + width * 0.4, y - bodyHeight * 0.9)
    context.lineTo(fan.x + width * 0.55, y - height * 1.05)
    context.stroke()
  }

  context.fillStyle = palette.shirts[fan.shirt]
  context.beginPath()
  context.roundRect(fan.x - width / 2, y - bodyHeight, width, bodyHeight + lift, width * 0.4)
  context.fill()

  const headRadius = height * 0.17
  const headY = y - bodyHeight - headRadius * 0.85
  context.fillStyle = palette.skins[fan.skin]
  context.beginPath()
  context.arc(fan.x, headY, headRadius, 0, Math.PI * 2)
  context.fill()

  if (fan.hat !== null) {
    context.fillStyle = palette.hats[fan.hat]
    context.beginPath()
    context.ellipse(
      fan.x,
      headY - headRadius * 0.35,
      headRadius * 1.5,
      headRadius * 0.38,
      0,
      0,
      Math.PI * 2,
    )
    context.fill()
    context.beginPath()
    context.arc(fan.x, headY - headRadius * 0.35, headRadius * 0.95, Math.PI, 0)
    context.fill()
  }
}

/** Soft shading from the roof over the back rows. */
export function drawRoofShade(
  context: CanvasRenderingContext2D,
  layout: StadiumLayout,
  palette: CrowdPalette,
) {
  const depth = (layout.standsBottom - layout.standsTop) * 0.55
  const gradient = context.createLinearGradient(0, layout.standsTop, 0, layout.standsTop + depth)
  gradient.addColorStop(0, palette.shade)
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  context.fillStyle = gradient
  context.fillRect(0, layout.standsTop, layout.width, depth)
}
