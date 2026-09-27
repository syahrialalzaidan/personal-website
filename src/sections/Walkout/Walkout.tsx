import { AnimatePresence, motion } from 'motion/react'
import { useLenis } from 'lenis/react'
import { useEffect, useState } from 'react'
import { useSound } from '../../audio/useSound'
import { TennisBall } from '../../components/TennisBall/TennisBall'
import { profile } from '../../content/profile'
import styles from './Walkout.module.css'

interface WalkoutProps {
  onDone: () => void
}

const STEP_MS = 620
const COUNT_FROM = 3
const EASE = [0.76, 0, 0.24, 1] as const

/** Broadcast cold open: a three-bounce countdown, then the tunnel doors open onto the court. */
export function Walkout({ onDone }: WalkoutProps) {
  const [count, setCount] = useState(COUNT_FROM)
  const lenis = useLenis()
  const { play } = useSound()

  useEffect(() => {
    lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
    return () => {
      lenis?.start()
      document.documentElement.style.overflow = ''
    }
  }, [lenis])

  useEffect(() => {
    if (count > 0) {
      const timer = window.setTimeout(() => setCount((value) => value - 1), STEP_MS)
      return () => window.clearTimeout(timer)
    }
    let cancelled = false
    const timer = window.setTimeout(() => {
      // Hold the doors until the display font is ready, so the hero never reflows on reveal.
      void document.fonts.ready.then(() => !cancelled && onDone())
    }, STEP_MS * 0.8)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [count, onDone])

  useEffect(() => {
    play('pock', 0.8)
  }, [count, play])

  return (
    <motion.div
      className={styles.walkout}
      role="status"
      aria-label="Loading the match"
      exit={{ pointerEvents: 'none' }}
    >
      <motion.div
        className={`${styles.door} ${styles.top}`}
        exit={{ y: '-100%' }}
        transition={{ duration: 1, ease: EASE }}
      />
      <motion.div
        className={`${styles.door} ${styles.bottom}`}
        exit={{ y: '100%' }}
        transition={{ duration: 1, ease: EASE }}
      />

      <motion.div
        className={styles.content}
        exit={{ opacity: 0, scale: 1.08 }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        <p className={styles.chyron}>
          <span className={styles.live}>
            <span className={styles.dot} aria-hidden="true" />
            Live
          </span>
          <span>Center court · Jakarta</span>
        </p>

        <div className={styles.counter} aria-hidden="true">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={count}
              className={styles.number}
              initial={{ y: '60%', opacity: 0, filter: 'blur(12px)' }}
              animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
              exit={{ y: '-60%', opacity: 0, filter: 'blur(12px)' }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {count > 0 ? count : 'Play'}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className={styles.bounce} aria-hidden="true">
          <motion.div
            key={count}
            className={styles.ball}
            initial={{ y: -90 }}
            animate={{ y: [-90, 0, -40, 0] }}
            transition={{ duration: 0.6, times: [0, 0.45, 0.72, 1], ease: 'easeIn' }}
          >
            <TennisBall size="100%" />
          </motion.div>
          <motion.div
            key={`shadow-${count}`}
            className={styles.shadow}
            initial={{ scale: 0.4, opacity: 0.2 }}
            animate={{ scale: [0.4, 1, 0.7, 1], opacity: [0.2, 0.6, 0.35, 0.6] }}
            transition={{ duration: 0.6, times: [0, 0.45, 0.72, 1] }}
          />
        </div>

        <p className={styles.matchup}>
          <strong>{profile.nickname}</strong>
          <span>vs</span>
          <strong>the next big problem</strong>
        </p>
      </motion.div>

      <motion.button
        type="button"
        className={styles.skip}
        onClick={onDone}
        data-cursor="Skip"
        exit={{ opacity: 0 }}
      >
        Skip intro
      </motion.button>
    </motion.div>
  )
}
