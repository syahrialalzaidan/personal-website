import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type MotionValue,
  type Transition,
} from 'motion/react'
import { useState, type RefObject } from 'react'
import { useSound } from '../../../audio/useSound'
import { TennisBall } from '../../../components/TennisBall/TennisBall'
import styles from '../CenterCourt.module.css'

interface HeroBallProps {
  constraintsRef: RefObject<HTMLElement | null>
  /** False once the hero is off-screen; the idle bounce stops so it costs nothing there. */
  active: boolean
  /** False while the walkout intro is still covering the page; the hint waits for it. */
  ready: boolean
  /** Fades the hint out with the broadcast caption as the page scrolls. */
  hintOpacity: MotionValue<number>
}

const BOUNCE: Transition = {
  duration: 1.15,
  repeat: Infinity,
  times: [0, 0.5, 1],
  ease: ['easeOut', 'easeIn'],
}

/** A foreground ball that bounces in place and can be grabbed and thrown around the stage. */
export function HeroBall({ constraintsRef, active, ready, hintOpacity }: HeroBallProps) {
  const { play } = useSound()
  const reduceMotion = useReducedMotion()
  const bouncing = active && !reduceMotion
  // The "Throw me" hint only needs to land once: it leaves for good on the first grab.
  const [played, setPlayed] = useState(false)

  return (
    <motion.div
      className={styles.heroBall}
      drag
      dragConstraints={constraintsRef}
      dragElastic={0.25}
      dragTransition={{ bounceStiffness: 260, bounceDamping: 14, power: 0.35 }}
      whileDrag={{ scale: 1.12 }}
      onDragStart={() => {
        play('pock', 0.6)
        setPlayed(true)
      }}
      onDragEnd={() => play('pock')}
      role="img"
      aria-label="A tennis ball. Drag and throw it."
    >
      <AnimatePresence>
        {!played && (
          <motion.div
            key="hint"
            className={styles.ballSticker}
            style={{ opacity: hintOpacity }}
            initial={{ scale: 0, rotate: 20 }}
            animate={ready ? { scale: 1, rotate: 7 } : { scale: 0, rotate: 20 }}
            exit={{ scale: 0, rotate: 20, transition: { duration: 0.2, ease: 'easeIn' } }}
            transition={{ type: 'spring', stiffness: 380, damping: 18, delay: ready ? 1.6 : 0 }}
            aria-hidden="true"
          >
            <span className={styles.stickerBody}>Throw me</span>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className={styles.heroBallBody}
        animate={bouncing ? { y: [0, -90, 0] } : { y: 0 }}
        transition={BOUNCE}
      >
        <TennisBall size="100%" />
      </motion.div>
      <motion.div
        className={styles.heroBallShadow}
        animate={
          bouncing
            ? { scale: [1, 0.5, 1], opacity: [0.55, 0.2, 0.55] }
            : { scale: 1, opacity: 0.55 }
        }
        transition={BOUNCE}
      />
    </motion.div>
  )
}
