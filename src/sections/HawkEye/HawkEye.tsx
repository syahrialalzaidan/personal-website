import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useSound } from '../../audio/useSound'
import { SectionIntro } from '../../components/SectionIntro/SectionIntro'
import { replays } from '../../content/projects'
import { clamp } from '../../lib/math'
import { ReplayScreen } from './ReplayScreen'
import { ReviewStep } from './ReviewStep'
import styles from './HawkEye.module.css'

const COUNT = replays.length
/** The ball lands at this share of each step, leaving room to read before the next shot. */
const FLIGHT_SHARE = 0.75
const VERDICT_MS = 2200

const stepAt = (progress: number) => clamp(Math.floor(progress * COUNT), 0, COUNT - 1)

/** Projects as line-call reviews: a pinned replay monitor beside scrolling case notes. */
export function HawkEye() {
  const sectionRef = useRef<HTMLElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const { play } = useSound()
  const [active, setActive] = useState(0)
  const [showVerdict, setShowVerdict] = useState(false)
  const verdictTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(verdictTimer.current), [])

  const { scrollYProgress } = useScroll({ target: stepsRef, offset: ['start 60%', 'end 60%'] })
  const flight = useTransform(scrollYProgress, (value) =>
    clamp((value * COUNT - stepAt(value)) / FLIGHT_SHARE, 0, 1),
  )
  useMotionValueEvent(scrollYProgress, 'change', (value) => setActive(stepAt(value)))

  const { scrollYProgress: sectionProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const glowY = useTransform(sectionProgress, [0, 1], ['-20%', '40%'])

  const challenge = (index: number) => {
    setActive(index)
    setShowVerdict(true)
    window.clearTimeout(verdictTimer.current)
    verdictTimer.current = window.setTimeout(() => setShowVerdict(false), VERDICT_MS)
    play('swell')
  }

  return (
    <section
      id="hawk-eye"
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="hawk-eye-title"
    >
      <motion.div className={styles.glow} style={{ y: glowY }} aria-hidden="true" />

      <div className={styles.inner}>
        <SectionIntro
          headingId="hawk-eye-title"
          segment="04"
          eyebrow="Hawk-Eye"
          title="Every shot under review"
          lede="Four projects worth a second look. Scroll to replay each shot, then challenge the call."
        />

        <div className={styles.layout}>
          <div className={styles.screenColumn}>
            <div className={styles.screenSticky}>
              <ReplayScreen
                replay={replays[active]}
                index={active}
                total={COUNT}
                progress={flight}
                showVerdict={showVerdict}
              />
            </div>
          </div>

          <div ref={stepsRef} className={styles.steps}>
            {replays.map((replay, index) => (
              <ReviewStep
                key={replay.id}
                replay={replay}
                index={index}
                active={index === active}
                onChallenge={() => challenge(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
