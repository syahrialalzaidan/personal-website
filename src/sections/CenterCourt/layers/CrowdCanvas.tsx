import { useEffect, useMemo, useRef } from 'react'
import { useCanvasLoop } from '../../../hooks/useCanvasLoop'
import { useTheme } from '../../../theme/useTheme'
import { useThemeColors } from '../../../theme/useThemeColors'
import {
  crowdPalette,
  drawFan,
  drawRoofShade,
  drawStands,
  generateCrowd,
  type Crowd,
  type CrowdPalette,
} from '../crowd'
import type { StadiumLayout } from '../stadium'
import styles from '../CenterCourt.module.css'

const TOKENS = ['stand-back', 'stand-front', 'board', 'light'] as const
const WAVE_SECONDS = 2.8
const FLASH_SECONDS = 0.14
/** Night-time twinkles (phones, camera flashes) don't need 60 fps; ~20 fps reads the same. */
const NIGHT_FRAME_SECONDS = 1 / 20
/** The crowd is small, soft detail: a lower pixel ratio is indistinguishable and far cheaper. */
const MAX_PIXEL_RATIO = 1.5

interface CrowdCanvasProps {
  layout: StadiumLayout
  /** Increment to send a Mexican wave around the stands. */
  waveKey: number
  /** Night-time phone screens and camera flashes; off on phones, where the crowd stays still. */
  twinkle: boolean
}

interface Flash {
  x: number
  y: number
  size: number
  born: number
}

export function CrowdCanvas({ layout, waveKey, twinkle }: CrowdCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const tokens = useThemeColors(TOKENS)
  const crowd = useMemo(() => generateCrowd(layout), [layout])
  const palette = useMemo(() => crowdPalette(theme, tokens), [theme, tokens])

  const cache = useRef<{ key: string; canvas: HTMLCanvasElement } | null>(null)
  const waveStart = useRef<number | null>(null)
  const flashes = useRef<Flash[]>([])
  const lastPaint = useRef({ key: '', time: 0 })

  useEffect(() => {
    if (waveKey > 0) waveStart.current = performance.now() / 1000
  }, [waveKey])

  useCanvasLoop(
    canvasRef,
    ({ context, width, height, time, delta, sizeVersion }) => {
      const canvas = context.canvas
      const ratio = canvas.width / width
      const scale = Math.max(width / layout.width, height / layout.height)
      const offsetX = (width - layout.width * scale) / 2
      const offsetY = (height - layout.height * scale) / 2
      const toView = (target: CanvasRenderingContext2D) =>
        target.setTransform(ratio * scale, 0, 0, ratio * scale, ratio * offsetX, ratio * offsetY)

      const waveAge = waveStart.current === null ? Infinity : time - waveStart.current
      const waving = waveAge < WAVE_SECONDS

      // Only repaint when something changed: a wave, night twinkles, or a new size / theme.
      const sceneKey = `${sizeVersion}:${theme}:${layout.width}`
      const stale = lastPaint.current.key !== sceneKey
      const twinkleDue =
        twinkle && theme === 'night' && time - lastPaint.current.time >= NIGHT_FRAME_SECONDS
      if (!waving && !stale && !twinkleDue) return
      const elapsed = stale ? delta : Math.min(time - lastPaint.current.time, 0.1)
      // During a wave the key is cleared, so the first still frame after it repaints cleanly.
      lastPaint.current = { key: waving ? '' : sceneKey, time }

      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.clearRect(0, 0, width, height)

      if (waving) {
        toView(context)
        const waveX = -200 + (waveAge / WAVE_SECONDS) * (layout.width + 400)
        paintScene(context, layout, crowd, palette, theme, (fan) => {
          const distance = fan.x - waveX
          return fan.height * 0.55 * Math.exp(-(distance * distance) / (2 * 70 * 70))
        })
      } else {
        const key = `${canvas.width}x${canvas.height}:${theme}:${layout.width}`
        if (cache.current?.key !== key) {
          const offscreen = cache.current?.canvas ?? document.createElement('canvas')
          offscreen.width = canvas.width
          offscreen.height = canvas.height
          const offscreenContext = offscreen.getContext('2d')
          if (offscreenContext) {
            offscreenContext.clearRect(0, 0, offscreen.width, offscreen.height)
            toView(offscreenContext)
            paintScene(offscreenContext, layout, crowd, palette, theme)
          }
          cache.current = { key, canvas: offscreen }
        }
        context.drawImage(cache.current.canvas, 0, 0, width, height)
      }

      if (twinkle && theme === 'night') {
        toView(context)
        paintNightLife(context, crowd, flashes.current, time, elapsed)
      }
    },
    { maxPixelRatio: MAX_PIXEL_RATIO },
  )

  return <canvas ref={canvasRef} className={styles.canvasLayer} aria-hidden="true" />
}

function paintScene(
  context: CanvasRenderingContext2D,
  layout: StadiumLayout,
  crowd: Crowd,
  palette: CrowdPalette,
  theme: 'day' | 'night',
  liftFor?: (fan: Crowd['fans'][number]) => number,
) {
  drawStands(context, layout, crowd, palette)
  for (const fan of crowd.fans) drawFan(context, fan, palette, liftFor?.(fan) ?? 0)
  drawRoofShade(context, layout, palette)

  if (theme === 'night') {
    // Lamps along the roof edge.
    const roofY = layout.standsTop - 2
    context.save()
    context.fillStyle = palette.light
    context.shadowColor = palette.light
    context.shadowBlur = 14
    for (let x = 30; x < layout.width; x += 64) {
      context.beginPath()
      context.arc(x, roofY, 2.6, 0, Math.PI * 2)
      context.fill()
    }
    context.restore()
  }
}

function paintNightLife(
  context: CanvasRenderingContext2D,
  crowd: Crowd,
  flashes: Flash[],
  time: number,
  delta: number,
) {
  // Phone screens glowing in the crowd.
  for (const fan of crowd.fans) {
    if (!fan.phone) continue
    const glow = 0.55 + 0.45 * Math.sin(time * 1.7 + fan.x * 0.13)
    context.fillStyle = `rgba(190, 220, 255, ${0.35 + glow * 0.5})`
    const size = fan.height * 0.18
    context.fillRect(fan.x + fan.height * 0.12, fan.y - fan.height * 0.78, size * 0.7, size)
  }

  // Camera flashes.
  if (Math.random() < delta * 7 && crowd.fans.length > 0) {
    const fan = crowd.fans[Math.floor(Math.random() * crowd.fans.length)]
    flashes.push({ x: fan.x, y: fan.y - fan.height * 0.7, size: fan.height * 1.3, born: time })
  }
  for (let index = flashes.length - 1; index >= 0; index -= 1) {
    const flash = flashes[index]
    const age = time - flash.born
    if (age > FLASH_SECONDS) {
      flashes.splice(index, 1)
      continue
    }
    const alpha = 1 - age / FLASH_SECONDS
    const gradient = context.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, flash.size)
    gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`)
    gradient.addColorStop(0.25, `rgba(235, 245, 255, ${alpha * 0.6})`)
    gradient.addColorStop(1, 'rgba(235, 245, 255, 0)')
    context.fillStyle = gradient
    context.beginPath()
    context.arc(flash.x, flash.y, flash.size, 0, Math.PI * 2)
    context.fill()
  }
}
