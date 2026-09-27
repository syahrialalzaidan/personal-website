import { motion, useReducedMotion, type Transition } from 'motion/react'
import type { RefObject } from 'react'
import { useSound } from '../../../audio/useSound'
import { TennisBall } from '../../../components/TennisBall/TennisBall'
import styles from '../CenterCourt.module.css'

interface HeroBallProps {
  constraintsRef: RefObject<HTMLElement | null>
  /** False once the hero is off-screen; the idle bounce stops so it costs nothing there. */
  active: boolean
}

const BOUNCE: Transition = {
  duration: 1.15,
  repeat: Infinity,
  times: [0, 0.5, 1],
  ease: ['easeOut', 'easeIn'],
}

/** A foreground ball that bounces in place and can be grabbed and thrown around the stage. */
export function HeroBall({ constraintsRef, active }: HeroBallProps) {
  const { play } = useSound()
  const reduceMotion = useReducedMotion()
  const bouncing = active && !reduceMotion

  return (
    <motion.div
      className={styles.heroBall}
      drag
      dragConstraints={constraintsRef}
      dragElastic={0.25}
      dragTransition={{ bounceStiffness: 260, bounceDamping: 14, power: 0.35 }}
      whileDrag={{ scale: 1.12 }}
      onDragStart={() => play('pock', 0.6)}
      onDragEnd={() => play('pock')}
      role="img"
      aria-label="A tennis ball. Drag and throw it."
      data-cursor="Drag"
    >
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
