import { useRef, type KeyboardEvent } from 'react'
import { useSound } from '../../../audio/useSound'
import { useCanvasLoop } from '../../../hooks/useCanvasLoop'
import { useThemeColors } from '../../../theme/useThemeColors'
import styles from '../OffCourt.module.css'
import { GAME_TOKENS, type GameProps } from './shared'
import {
  beginCharge,
  cancelCharge,
  createServe,
  drawServe,
  releaseServe,
  stepServe,
  type ServeEvent,
} from './tennisServe.engine'

const TOKENS = [...GAME_TOKENS, 'court', 'court-apron'] as const

/** A serve speed gun: time the release in the green zone for an ace. */
export function TennisServe({ active }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const game = useRef(createServe())
  const colors = useThemeColors(TOKENS)
  const { play } = useSound()

  const react = (events: ServeEvent[]) => {
    for (const event of events) {
      if (event === 'serve') play('pock', 1)
      else if (event === 'bounce') play('pock', 0.4)
      else if (event === 'ace') play('swell')
      else if (event === 'fault' || event === 'net') play('tick')
    }
  }

  useCanvasLoop(
    canvasRef,
    ({ context, width, height, delta }) => {
      react(stepServe(game.current, delta))
      drawServe(context, width, height, game.current, colors)
    },
    { active },
  )

  const onKey = (event: KeyboardEvent<HTMLCanvasElement>, pressed: boolean) => {
    if (event.key !== ' ' && event.key !== 'Enter') return
    event.preventDefault()
    if (pressed && !event.repeat) beginCharge(game.current)
    if (!pressed) react(releaseServe(game.current))
  }

  return (
    <canvas
      ref={canvasRef}
      className={styles.gameCanvas}
      style={{ touchAction: 'manipulation' }}
      tabIndex={0}
      aria-label="Tennis serve mini-game. Press and hold (or hold Space) to charge, and release while the meter is in the green zone to serve an ace."
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        beginCharge(game.current)
      }}
      onPointerUp={() => react(releaseServe(game.current))}
      onPointerCancel={() => cancelCharge(game.current)}
      onKeyDown={(event) => onKey(event, true)}
      onKeyUp={(event) => onKey(event, false)}
    />
  )
}
