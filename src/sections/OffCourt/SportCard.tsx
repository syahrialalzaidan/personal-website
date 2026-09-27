import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'motion/react'
import {
  lazy,
  Suspense,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type LazyExoticComponent,
} from 'react'
import type { Sport, SportId } from '../../content/types'
import type { GameProps } from './games/shared'
import styles from './OffCourt.module.css'

// The games live far down the page, so their code loads on demand instead of up front.
const GAMES: Record<SportId, LazyExoticComponent<ComponentType<GameProps>>> = {
  tennis: lazy(() =>
    import('./games/TennisServe').then((module) => ({ default: module.TennisServe })),
  ),
  padel: lazy(() =>
    import('./games/PadelGlass').then((module) => ({ default: module.PadelGlass })),
  ),
  'ping-pong': lazy(() =>
    import('./games/PingPong').then((module) => ({ default: module.PingPong })),
  ),
  golf: lazy(() => import('./games/GolfPutt').then((module) => ({ default: module.GolfPutt }))),
}

const METER_SEGMENTS = 10
const STACK_OFFSET = 22

interface SportCardProps {
  sport: Sport
  index: number
  total: number
  /** Scroll progress through the whole stack, 0 → 1. */
  progress: MotionValue<number>
}

/** A sticky card in the stack. Cards underneath shrink and dim as new ones slide over. */
export function SportCard({ sport, index, total, progress }: SportCardProps) {
  const depth = total - 1 - index
  const start = index / total
  const scale = useTransform(progress, [start, 1], [1, 1 - depth * 0.045])
  const dim = useTransform(progress, [start, 1], [0, depth * 0.16])
  const Game = GAMES[sport.id]

  // A card is covered once the next one has slid more than halfway over it. Its game then
  // pauses, so only the card you're looking at spends frames.
  const cardRef = useRef<HTMLElement>(null)
  const [covered, setCovered] = useState(false)
  useMotionValueEvent(progress, 'change', () => {
    const card = cardRef.current
    const next = card?.nextElementSibling
    if (!card || !next) return
    const own = card.getBoundingClientRect()
    setCovered(next.getBoundingClientRect().top < own.top + own.height / 2)
  })
  const filled = Math.round(sport.rating * METER_SEGMENTS)
  const number = String(index + 1).padStart(2, '0')

  return (
    <motion.article
      ref={cardRef}
      className={styles.card}
      data-sport={sport.id}
      style={{ scale, '--stack-top': `${index * STACK_OFFSET}px` } as unknown as CSSProperties}
      aria-labelledby={`sport-${sport.id}`}
    >
      <span className={styles.bigName} aria-hidden="true">
        {sport.name}
      </span>

      <div className={styles.info}>
        <p className={styles.number}>
          <span>{number}</span> / {String(total).padStart(2, '0')}
        </p>
        <h3 id={`sport-${sport.id}`} className={styles.name}>
          {sport.name}
        </h3>
        <div className={styles.level}>
          <span className={styles.levelLabel}>{sport.level}</span>
          <span
            className={styles.meter}
            role="meter"
            aria-label={`Skill level: ${sport.level}`}
            aria-valuemin={0}
            aria-valuemax={METER_SEGMENTS}
            aria-valuenow={filled}
          >
            {Array.from({ length: METER_SEGMENTS }, (_, segment) => (
              <span
                key={segment}
                data-on={segment < filled}
                style={{ height: `${30 + segment * 7}%` }}
              />
            ))}
          </span>
        </div>
        <p className={styles.line}>{sport.line}</p>
        <p className={styles.how}>
          <span>How to play</span>
          {sport.howToPlay}
        </p>
      </div>

      <div className={styles.gameFrame} data-native-cursor>
        <Suspense fallback={<p className={styles.gameLoading}>Warming up…</p>}>
          <Game active={!covered} />
        </Suspense>
      </div>

      <motion.div className={styles.dim} style={{ opacity: dim }} aria-hidden="true" />
    </motion.article>
  )
}
