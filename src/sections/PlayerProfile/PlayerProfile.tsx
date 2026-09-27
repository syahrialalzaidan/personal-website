import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { CountUp } from '../../components/CountUp/CountUp'
import { SectionIntro } from '../../components/SectionIntro/SectionIntro'
import { clubhouse, education, kitBag, languages, overview, stats } from '../../content/about'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { fadeUp, revealOnView, stagger } from '../../lib/motion'
import { PlayerCard } from './PlayerCard'
import styles from './PlayerProfile.module.css'

export function PlayerProfile() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  // The card only drifts beside the text in the two-column layout; stacked, it would overlap.
  const twoColumn = useMediaQuery('(min-width: 961px)')
  const cardY = useTransform(scrollYProgress, [0, 1], twoColumn ? [140, -140] : [0, 0])
  const backdropX = useTransform(scrollYProgress, [0, 1], ['8%', '-38%'])

  return (
    <section id="player" ref={sectionRef} className={styles.section} aria-labelledby="player-title">
      <motion.p className={styles.backdrop} style={{ x: backdropX }} aria-hidden="true">
        Player profile
      </motion.p>

      <div className={styles.inner}>
        <SectionIntro
          headingId="player-title"
          segment="03"
          eyebrow="Player profile"
          title="Keep the ball in play"
        />

        <div className={styles.grid}>
          <motion.div className={styles.cardColumn} style={{ y: cardY }}>
            <PlayerCard />
          </motion.div>

          <motion.div className={styles.details} {...revealOnView} variants={stagger(0.1)}>
            <motion.div className={styles.overview} variants={fadeUp}>
              {overview.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </motion.div>

            <motion.dl className={styles.stats} variants={fadeUp}>
              {stats.map((stat) => (
                <div key={stat.label} className={styles.stat}>
                  <dt>{stat.label}</dt>
                  <dd>
                    <CountUp value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
                  </dd>
                </div>
              ))}
            </motion.dl>

            <motion.section className={styles.block} variants={fadeUp} aria-labelledby="kit-title">
              <h3 id="kit-title" className={styles.blockTitle}>
                Kit bag
              </h3>
              <div className={styles.pockets}>
                {kitBag.map((pocket) => (
                  <div key={pocket.pocket} className={styles.pocket}>
                    <h4>{pocket.pocket}</h4>
                    <ul>
                      {pocket.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.div className={styles.split} variants={fadeUp}>
              <section className={styles.block} aria-labelledby="academy-title">
                <h3 id="academy-title" className={styles.blockTitle}>
                  Academy
                </h3>
                <p className={styles.school}>{education.school}</p>
                <p className={styles.muted}>{education.degree}</p>
                <ul className={styles.tags}>
                  <li>{education.period}</li>
                  <li>GPA {education.gpa}</li>
                  <li>{education.credits}</li>
                </ul>
              </section>

              <section className={styles.block} aria-labelledby="clubhouse-title">
                <h3 id="clubhouse-title" className={styles.blockTitle}>
                  Clubhouse
                </h3>
                <ul className={styles.clubs}>
                  {clubhouse.map((club) => (
                    <li key={club.org}>
                      <p className={styles.clubRole}>
                        {club.role} · <span>{club.org}</span>
                      </p>
                      <p className={styles.muted}>
                        {club.period} — {club.detail}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            </motion.div>

            <motion.p className={styles.languages} variants={fadeUp}>
              {languages.map((language) => (
                <span key={language.name}>
                  {language.name} <em>{language.level}</em>
                </span>
              ))}
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
