import { useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { useSound } from '../../../audio/useSound'
import { useCanvasLoop } from '../../../hooks/useCanvasLoop'
import { useTheme } from '../../../theme/useTheme'
import { useThemeColors } from '../../../theme/useThemeColors'
import styles from '../OffCourt.module.css'
import {
  cancelAim,
  createGolf,
  drawGolf,
  moveAim,
  releaseAim,
  startAim,
  stepGolf,
  type GolfEvent,
} from './golf.engine'
import { GAME_TOKENS, type GameProps, canvasPoint, toLogical, type Viewport } from './shared'

/** A putting green with a random slope and pin position every hole. */
export function GolfPutt({ active }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const game = useRef(createGolf())
  const viewport = useRef<Viewport | null>(null)
  const colors = useThemeColors(GAME_TOKENS)
  const { theme } = useTheme()
  const { play } = useSound()

  const react = (events: GolfEvent[]) => {
    for (const event of events) {
      if (event === 'putt') play('pock', 0.5)
      else if (event === 'holed') play('cup')
      else play('tick')
    }
  }

  useCanvasLoop(
    canvasRef,
    ({ context, width, height, delta }) => {
      react(stepGolf(game.current, delta))
      viewport.current = drawGolf(context, width, height, game.current, colors, theme)
    },
    { active },
  )

  const logical = (event: PointerEvent<HTMLCanvasElement>) =>
    viewport.current ? toLogical(viewport.current, ...canvasPoint(event)) : null

  const onKeyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    if (event.key !== ' ' && event.key !== 'Enter') return
    event.preventDefault()
    // Keyboard putt: a medium-pace stroke straight at the hole.
    const { ball, hole } = game.current
    const dx = hole.x - ball.x
    const dy = hole.y - ball.y
    const length = Math.hypot(dx, dy) || 1
    const pull = Math.min(length * 0.45, 70)
    startAim(game.current, ball.x, ball.y)
    moveAim(game.current, ball.x - (dx / length) * pull, ball.y - (dy / length) * pull)
    react(releaseAim(game.current))
  }

  return (
    <canvas
      ref={canvasRef}
      className={styles.gameCanvas}
      style={{ touchAction: 'none' }}
      tabIndex={0}
      aria-label="Golf putting mini-game. Drag back from the ball and release to putt; the ball rolls the opposite way. Press Space for a straight putt at the hole."
      onPointerDown={(event) => {
        const point = logical(event)
        if (!point) return
        event.currentTarget.setPointerCapture(event.pointerId)
        startAim(game.current, ...point)
      }}
      onPointerMove={(event) => {
        const point = logical(event)
        if (point) moveAim(game.current, ...point)
      }}
      onPointerUp={() => react(releaseAim(game.current))}
      onPointerCancel={() => cancelAim(game.current)}
      onKeyDown={onKeyDown}
    />
  )
}
