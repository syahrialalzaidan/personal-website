import { useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { useSound } from '../../../audio/useSound'
import { useCanvasLoop } from '../../../hooks/useCanvasLoop'
import { useTheme } from '../../../theme/useTheme'
import { useThemeColors } from '../../../theme/useThemeColors'
import styles from '../OffCourt.module.css'
import { FIELD, createPadel, drawPadel, smash, stepPadel, type PadelEvent } from './padel.engine'
import { GAME_TOKENS, type GameProps, canvasPoint, toLogical, type Viewport } from './shared'

/** Smash the ball around a glass-walled padel court and chain rebounds off the glass. */
export function PadelGlass({ active }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const game = useRef(createPadel())
  const viewport = useRef<Viewport | null>(null)
  const colors = useThemeColors(GAME_TOKENS)
  const { theme } = useTheme()
  const { play } = useSound()

  const react = (events: PadelEvent[]) => {
    for (const event of events) {
      if (event === 'hit') play('pock')
      else if (event === 'glass') play('glass')
      else if (event === 'mesh') play('tick')
    }
  }

  useCanvasLoop(
    canvasRef,
    ({ context, width, height, delta }) => {
      react(stepPadel(game.current, delta))
      viewport.current = drawPadel(context, width, height, game.current, colors, theme)
    },
    { active },
  )

  const onPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!viewport.current) return
    const [x, y] = toLogical(viewport.current, ...canvasPoint(event))
    react(smash(game.current, x - FIELD.wall, y - FIELD.wall))
  }

  const onKeyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    if (event.key !== ' ' && event.key !== 'Enter') return
    event.preventDefault()
    // Keyboard players smash toward a random corner of the glass.
    const corner = Math.random() < 0.5 ? 0 : FIELD.width
    react(smash(game.current, corner, Math.random() * FIELD.height))
  }

  return (
    <canvas
      ref={canvasRef}
      className={styles.gameCanvas}
      style={{ touchAction: 'manipulation' }}
      tabIndex={0}
      aria-label="Padel mini-game. Click anywhere on the court, or press Space, to smash the ball and chain rebounds off the glass walls."
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    />
  )
}
