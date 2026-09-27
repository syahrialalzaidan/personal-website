import { useScroll } from 'motion/react'
import { useRef } from 'react'
import { SectionIntro } from '../../components/SectionIntro/SectionIntro'
import { sports } from '../../content/hobbies'
import { SportCard } from './SportCard'
import styles from './OffCourt.module.css'

/** Hobbies as a stack of playable court cards. */
export function OffCourt() {
  const stackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: stackRef, offset: ['start start', 'end end'] })

  return (
    <section id="off-court" className={styles.section} aria-labelledby="off-court-title">
      <div className={styles.inner}>
        <SectionIntro
          headingId="off-court-title"
          segment="06"
          eyebrow="Off court"
          title="Other courts I play on"
          lede="Four sports, four honest ratings. Every card is playable, so go ahead and try to beat me."
        />

        <div ref={stackRef} className={styles.stack}>
          {sports.map((sport, index) => (
            <SportCard
              key={sport.id}
              sport={sport}
              index={index}
              total={sports.length}
              progress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
