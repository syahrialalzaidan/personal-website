import { motion, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'
import { useTrackReveal } from './useTrackReveal'
import styles from './Tour.module.css'

interface BracketLinkProps {
  trackX: MotionValue<number>
  /** Direction of the elbow: from the upper lane down, or from the lower lane up. */
  direction: 'down' | 'up'
}

const LANE_OFFSET = 6

/** The bracket line joining two rounds; it draws itself as it scrolls into view. */
export function BracketLink({ trackX, direction }: BracketLinkProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reveal = useTrackReveal(ref, trackX, 0.35)
  const pathLength = useTransform(reveal, [0.15, 1], [0, 1])
  const ballOpacity = useTransform(reveal, [0.9, 1], [0, 1])
  const from = 50 + (direction === 'down' ? -LANE_OFFSET : LANE_OFFSET)
  const to = 50 + (direction === 'down' ? LANE_OFFSET : -LANE_OFFSET)

  return (
    <div ref={ref} className={styles.link} aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d={`M0 ${from} H50 V${to} H100`}
          className={styles.linkGhost}
          vectorEffect="non-scaling-stroke"
        />
        <motion.path
          d={`M0 ${from} H50 V${to} H100`}
          className={styles.linkLine}
          vectorEffect="non-scaling-stroke"
          style={{ pathLength }}
        />
      </svg>
      <motion.span className={styles.linkBall} style={{ top: `${to}%`, opacity: ballOpacity }} />
    </div>
  )
}
