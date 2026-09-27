import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { useRef, type PointerEvent } from 'react'
import { SectionIntro } from '../../components/SectionIntro/SectionIntro'
import { trophies } from '../../content/achievements'
import { revealOnView, stagger } from '../../lib/motion'
import { TrophyItem } from './TrophyItem'
import styles from './TrophyRoom.module.css'

/** Hackathon honors in a lit cabinet. A spotlight follows the pointer across the back wall. */
export function TrophyRoom() {
  const sectionRef = useRef<HTMLElement>(null)
  const spotX = useSpring(useMotionValue(50), { stiffness: 120, damping: 20 })
  const spotY = useSpring(useMotionValue(40), { stiffness: 120, damping: 20 })
  const spotlight = useMotionTemplate`radial-gradient(460px circle at ${spotX}% ${spotY}%, var(--spot) 0%, transparent 70%)`

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const wallY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  const glassX = useTransform(scrollYProgress, [0, 1], ['-60%', '160%'])
  const wordX = useTransform(scrollYProgress, [0, 1], ['20%', '-30%'])
  const shelfY = useTransform(scrollYProgress, [0, 1], [28, -28])

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect()
    spotX.set(((event.clientX - rect.left) / rect.width) * 100)
    spotY.set(((event.clientY - rect.top) / rect.height) * 100)
  }

  return (
    <section
      id="trophy-room"
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="trophy-title"
      onPointerMove={onPointerMove}
    >
      <motion.p className={styles.word} style={{ x: wordX }} aria-hidden="true">
        Silverware
      </motion.p>

      <div className={styles.inner}>
        <SectionIntro
          headingId="trophy-title"
          segment="05"
          eyebrow="Trophy room"
          title="The cabinet so far"
          lede="Four hackathons, four pieces of hardware. Click one to lift it."
          align="center"
        />

        <div className={styles.cabinet}>
          <motion.div className={styles.backWall} style={{ y: wallY }} aria-hidden="true" />
          <motion.div
            className={styles.spotlight}
            style={{ background: spotlight }}
            aria-hidden="true"
          />
          <motion.div
            className={styles.glass}
            style={{ x: glassX, skewX: -18 }}
            aria-hidden="true"
          />

          <motion.ul
            className={styles.shelf}
            style={{ y: shelfY }}
            {...revealOnView}
            variants={stagger(0.12)}
          >
            {trophies.map((trophy) => (
              <TrophyItem key={trophy.id} trophy={trophy} />
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  )
}
