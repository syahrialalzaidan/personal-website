import { motion, useReducedMotion, type MotionValue } from 'motion/react'
import { useState, type RefObject } from 'react'
import { useSound } from '../../../audio/useSound'
import { Sticker } from '../../../components/Sticker/Sticker'
import { TennisBall } from '../../../components/TennisBall/TennisBall'
import styles from '../CenterCourt.module.css'

interface HeroBallProps {
  constraintsRef: RefObject<HTMLElement | null>
  /** False once the hero is off-screen; the idle bounce stops so it costs nothing there. */
  active: boolean
  /** False while the walkout intro is still covering the page; the hint waits for it. */
  ready: boolean
  /** Fades the hint out with the broadcast caption as the page scrolls; phones leave it out. */
  hintOpacity?: MotionValue<number>
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
      data-bouncing={bouncing}
      role="img"
      aria-label="A tennis ball. Drag and throw it."
    >
      <Sticker
        show={ready && !played}
        rotate={7}
        delay={1.6}
        size="small"
        className={styles.ballSticker}
        style={hintOpacity && { opacity: hintOpacity }}
      >
        Throw me
      </Sticker>
      {/* The bounce is a CSS animation, so it runs off the main thread and never fights scrolling. */}
      <div className={styles.heroBallBody}>
        <TennisBall size="100%" />
      </div>
      <div className={styles.heroBallShadow} />
    </motion.div>
  )
}
