import { AnimatePresence, motion, type MotionStyle } from 'motion/react'
import type { ReactNode } from 'react'
import styles from './Sticker.module.css'

interface StickerProps {
  children: ReactNode
  /** While true the sticker pops in; once false it pops away. */
  show: boolean
  /** Resting tilt in degrees. */
  rotate: number
  /** Seconds to wait before popping in. */
  delay?: number
  /** Which bottom corner the tail hangs from; it should be the corner nearer the target. */
  tail?: 'left' | 'right'
  size?: 'regular' | 'small'
  /** Positions the sticker; it is absolutely placed within its container. */
  className?: string
  style?: MotionStyle
}

/**
 * A tilted, hand-stuck speech bubble that points at something playable, e.g. "Tap me".
 * It's decoration only: hidden from assistive tech and transparent to clicks.
 */
export function Sticker({
  children,
  show,
  rotate,
  delay = 0,
  tail = 'right',
  size = 'regular',
  className,
  style,
}: StickerProps) {
  // Pops in from a steeper tilt, as if slapped on.
  const tucked = rotate + Math.sign(rotate || 1) * 16

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={[styles.sticker, className].filter(Boolean).join(' ')}
          style={style}
          data-tail={tail}
          data-size={size}
          initial={{ scale: 0, rotate: tucked }}
          animate={{ scale: 1, rotate }}
          exit={{ scale: 0, rotate: tucked, transition: { duration: 0.2, ease: 'easeIn' } }}
          transition={{ type: 'spring', stiffness: 380, damping: 18, delay }}
          aria-hidden="true"
        >
          <span className={styles.body}>{children}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
