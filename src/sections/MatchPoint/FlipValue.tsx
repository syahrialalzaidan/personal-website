import { AnimatePresence, motion } from 'motion/react'
import styles from './MatchPoint.module.css'

interface FlipValueProps {
  value: string
}

/** A split-flap style cell: the old value flips away as the new one drops in. */
export function FlipValue({ value }: FlipValueProps) {
  return (
    <span className={styles.flip}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className={styles.flipFace}
          initial={{ rotateX: -95, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 95, opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
