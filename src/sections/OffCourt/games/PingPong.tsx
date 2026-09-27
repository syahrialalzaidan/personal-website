import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { useSound } from '../../../audio/useSound'
import { useCanvasLoop } from '../../../hooks/useCanvasLoop'
import { useTheme } from '../../../theme/useTheme'
import { useThemeColors } from '../../../theme/useThemeColors'
import styles from '../OffCourt.module.css'
import { TABLE, TABLE_MARGIN, createPong, drawPong, startPong, stepPong } from './pingPong.engine'
import { GAME_TOKENS, type GameProps, canvasPoint, toLogical, type Viewport } from './shared'

const KEY_SPEED = 110

/** Pong on a ping pong table: you're on the left, the CPU is on the right. */
export function PingPong({ active }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const game = useRef(createPong())
  const targetY = useRef<number>(TABLE.height / 2)
  const keys = useRef({ up: false, down: false })
  const viewport = useRef<Viewport | null>(null)
  const colors = useThemeColors(GAME_TOKENS)
  const { theme } = useTheme()
  const { play } = useSound()
  // Touch only drives the paddle during a match, so the page still scrolls over an idle table.
  const [playing, setPlaying] = useState(false)

  const start = () => {
    startPong(game.current)
    setPlaying(true)
  }

  useCanvasLoop(
    canvasRef,
    ({ context, width, height, delta }) => {
      if (keys.current.up) targetY.current -= KEY_SPEED * delta
      if (keys.current.down) targetY.current += KEY_SPEED * delta
      for (const event of stepPong(game.current, delta, targetY.current)) {
        if (event === 'paddle') play('pock', 0.7)
        else if (event === 'bounce') play('pock', 0.3)
        else if (event === 'out') play('tick')
        else if (event === 'win') play('swell')
        if (event === 'win' || event === 'lose') setPlaying(false)
      }
      viewport.current = drawPong(context, width, height, game.current, colors, theme)
    },
    { active },
  )

  const aim = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!viewport.current) return
    const [, y] = toLogical(viewport.current, ...canvasPoint(event))
    targetY.current = y - TABLE_MARGIN
  }

  const setKey = (event: KeyboardEvent<HTMLCanvasElement>, pressed: boolean) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') keys.current.up = pressed
    else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') keys.current.down = pressed
    else if (pressed && (event.key === ' ' || event.key === 'Enter')) start()
    else return
    event.preventDefault()
  }

  return (
    <canvas
      ref={canvasRef}
      className={styles.gameCanvas}
      style={{ touchAction: playing ? 'none' : 'pan-y' }}
      tabIndex={0}
      aria-label="Ping pong mini-game. Move the pointer, or use the arrow keys, to move your paddle. Click or press Space to serve."
      onPointerMove={aim}
      onPointerDown={(event) => {
        aim(event)
        start()
      }}
      onKeyDown={(event) => setKey(event, true)}
      onKeyUp={(event) => setKey(event, false)}
    />
  )
}
