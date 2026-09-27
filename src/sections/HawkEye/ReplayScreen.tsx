import { AnimatePresence, motion, useTransform, type MotionValue } from 'motion/react'
import { useId, useMemo } from 'react'
import type { Replay } from '../../content/types'
import { useTilt } from '../../hooks/useTilt'
import {
  APRON_SURFACE,
  BOUNCE_AT,
  COURT_LINES,
  COURT_SURFACE,
  NET,
  NET_TAPE,
  VIEW,
  buildShot,
  pointAt,
} from './replay'
import styles from './HawkEye.module.css'

interface ReplayScreenProps {
  replay: Replay
  index: number
  total: number
  /** Replay progress for the active shot, 0 → 1. */
  progress: MotionValue<number>
  /** True while the "IN" verdict from a challenge is on screen. */
  showVerdict: boolean
}

/** The broadcast Hawk-Eye monitor: projected court, ball flight, bounce mark and the verdict. */
export function ReplayScreen({ replay, index, total, progress, showVerdict }: ReplayScreenProps) {
  const id = useId()
  const tilt = useTilt(4)
  const shot = useMemo(() => buildShot(replay), [replay])

  const ballX = useTransform(progress, (t) => pointAt(shot, t).x)
  const ballY = useTransform(progress, (t) => pointAt(shot, t).y)
  const ballR = useTransform(progress, (t) => pointAt(shot, t).radius)
  const shadowX = useTransform(progress, (t) => pointAt(shot, t).shadowX)
  const shadowY = useTransform(progress, (t) => pointAt(shot, t).shadowY)
  const markOpacity = useTransform(progress, [BOUNCE_AT - 0.02, BOUNCE_AT + 0.05], [0, 1])
  const markScale = useTransform(progress, [BOUNCE_AT - 0.02, BOUNCE_AT + 0.1], [0.3, 1])

  return (
    <motion.div
      className={styles.screen}
      style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
      {...tilt.handlers}
    >
      <div className={styles.screenBar}>
        <span className={styles.brand}>
          <span className={styles.eye} aria-hidden="true" />
          Hawk-Eye
        </span>
        <span>
          Review {index + 1}/{total}
        </span>
        <span className={styles.rec}>
          <span aria-hidden="true" />
          Replay
        </span>
      </div>

      <div className={styles.viewport}>
        <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className={styles.replaySvg} role="img">
          <title>{`Replay of ${replay.title}: the ball lands in.`}</title>
          <defs>
            <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: 'var(--bg-sunken)' }} />
              <stop offset="1" style={{ stopColor: 'var(--bg-raised)' }} />
            </linearGradient>
            <pattern id={`${id}-grid`} width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" style={{ stroke: 'var(--line)' }} strokeWidth="1" />
            </pattern>
            <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id={`${id}-ball`} cx="0.35" cy="0.3" r="0.8">
              <stop offset="0" style={{ stopColor: 'var(--ball-light)' }} />
              <stop offset="0.6" style={{ stopColor: 'var(--ball)' }} />
              <stop offset="1" style={{ stopColor: 'var(--ball-shade)' }} />
            </radialGradient>
          </defs>

          <rect width={VIEW.width} height={VIEW.height} fill={`url(#${id}-bg)`} />
          <rect width={VIEW.width} height={VIEW.height} fill={`url(#${id}-grid)`} />
          <polygon points={APRON_SURFACE} style={{ fill: 'var(--court-apron)' }} />
          <polygon points={COURT_SURFACE} style={{ fill: 'var(--court)' }} />
          <g style={{ fill: 'var(--court-line)' }}>
            {COURT_LINES.map((points) => (
              <polygon key={points} points={points} />
            ))}
          </g>

          <AnimatePresence mode="wait">
            <motion.g
              key={replay.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.path
                d={shot.shadowPath}
                className={styles.shadowTrail}
                style={{ pathLength: progress }}
              />
              <motion.path
                d={shot.flightPath}
                className={styles.flightTrail}
                filter={`url(#${id}-glow)`}
                style={{ pathLength: progress }}
              />
              <motion.ellipse
                cx={shot.bounce.x}
                cy={shot.bounce.y}
                rx={shot.bounce.rx}
                ry={shot.bounce.ry}
                className={styles.bounceMark}
                style={{ opacity: markOpacity, scale: markScale }}
              />
              <motion.ellipse
                cx={shadowX}
                cy={shadowY}
                rx={ballR}
                ry={4}
                className={styles.ballShadow}
              />
              <motion.circle cx={ballX} cy={ballY} r={ballR} fill={`url(#${id}-ball)`} />
            </motion.g>
          </AnimatePresence>

          <polygon points={NET} style={{ fill: 'var(--net)' }} opacity="0.45" />
          <polyline
            points={NET_TAPE}
            fill="none"
            style={{ stroke: 'var(--net-tape)' }}
            strokeWidth="2.5"
          />
        </svg>

        <div className={styles.scanlines} aria-hidden="true" />

        <motion.div className={styles.inset} style={{ opacity: markOpacity }} aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <rect width="120" height="120" style={{ fill: 'var(--court)' }} />
            <rect x="70" y="0" width="22" height="120" style={{ fill: 'var(--court-line)' }} />
            <ellipse cx="58" cy="60" rx="26" ry="34" className={styles.insetMark} />
          </svg>
          <span>IN · {replay.readout.margin}</span>
        </motion.div>

        <AnimatePresence>
          {showVerdict && (
            <motion.div
              className={styles.verdict}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              role="status"
            >
              <motion.span
                className={styles.verdictWord}
                initial={{ scale: 2.4, opacity: 0, filter: 'blur(14px)' }}
                animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              >
                IN
              </motion.span>
              <motion.span
                className={styles.verdictNote}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                Call stands · {replay.title}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <dl className={styles.readouts}>
        <div>
          <dt>Speed</dt>
          <dd>{replay.readout.speed} km/h</dd>
        </div>
        <div>
          <dt>Spin</dt>
          <dd>{replay.readout.spin.toLocaleString('en-US')} rpm</dd>
        </div>
        <div>
          <dt>Shot</dt>
          <dd>{replay.title}</dd>
        </div>
      </dl>
    </motion.div>
  )
}
