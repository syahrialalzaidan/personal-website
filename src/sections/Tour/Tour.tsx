import { motion, useTransform } from 'motion/react'
import { Fragment, useRef } from 'react'
import { SectionIntro } from '../../components/SectionIntro/SectionIntro'
import { TennisBall } from '../../components/TennisBall/TennisBall'
import { matches } from '../../content/experience'
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll'
import { BracketLink } from './BracketLink'
import { MatchCard } from './MatchCard'
import styles from './Tour.module.css'

const YEARS = [...new Set(matches.map((match) => match.year))]
const ROUND_SHORT: Record<string, string> = {
  'Round 1': 'R1',
  'Round 2': 'R2',
  'Round 3': 'R3',
  Quarterfinal: 'QF',
  Semifinal: 'SF',
  Final: 'F',
}

/** Experience as a tournament draw, pinned and scrubbed sideways by vertical scroll. */
export function Tour() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const { distance, x, progress } = useHorizontalScroll(sectionRef, trackRef)

  const courtX = useTransform(x, (value) => value * 0.18)
  const yearsX = useTransform(x, (value) => value * 0.5)
  const foregroundX = useTransform(x, (value) => value * 1.45)
  const railLeft = useTransform(progress, (value) => `${value * 100}%`)

  return (
    <section
      id="tour"
      ref={sectionRef}
      className={styles.section}
      style={{ height: `calc(100svh + ${distance}px)` }}
      aria-labelledby="tour-title"
    >
      <div className={styles.stage}>
        <motion.div className={styles.courtLayer} style={{ x: courtX }} aria-hidden="true">
          <CourtOutline />
          <CourtOutline />
        </motion.div>

        <motion.div className={styles.years} style={{ x: yearsX }} aria-hidden="true">
          {YEARS.map((year) => (
            <span key={year}>{year}</span>
          ))}
        </motion.div>

        <motion.div ref={trackRef} className={styles.track} style={{ x }}>
          <SectionIntro
            className={styles.intro}
            headingId="tour-title"
            segment="02"
            eyebrow="The tour"
            title="Six rounds, one draw"
            lede="Every team I've played for, starting with the final that's still in play and working back to the opening round. Keep scrolling and the draw moves sideways."
          />

          {matches.map((match, index) => (
            <Fragment key={match.id}>
              {index > 0 && <BracketLink trackX={x} direction={index % 2 === 1 ? 'down' : 'up'} />}
              <MatchCard match={match} index={index} trackX={x} />
            </Fragment>
          ))}
        </motion.div>

        <motion.div className={styles.foreground} style={{ x: foregroundX }} aria-hidden="true">
          <TennisBall className={styles.floatBall} size="100%" />
          <TennisBall className={styles.floatBall} size="100%" />
          <TennisBall className={styles.floatBall} size="100%" />
        </motion.div>

        <div className={styles.rail} aria-hidden="true">
          <div className={styles.railTrack}>
            <motion.div className={styles.railFill} style={{ scaleX: progress }} />
            <motion.div className={styles.railBall} style={{ left: railLeft }}>
              <TennisBall size="100%" />
            </motion.div>
          </div>
          <ol className={styles.railRounds}>
            {matches.map((match) => (
              <li key={match.id}>{ROUND_SHORT[match.round] ?? match.round}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function CourtOutline() {
  return (
    <svg viewBox="-120 -120 2617 1337" className={styles.courtOutline}>
      <g fill="none" strokeWidth="6">
        <rect width="2377" height="1097" />
        <line x1="0" y1="137" x2="2377" y2="137" />
        <line x1="0" y1="960" x2="2377" y2="960" />
        <line x1="548" y1="137" x2="548" y2="960" />
        <line x1="1829" y1="137" x2="1829" y2="960" />
        <line x1="548" y1="548.5" x2="1829" y2="548.5" />
        <line x1="1188.5" y1="-60" x2="1188.5" y2="1157" strokeDasharray="10 10" />
      </g>
    </svg>
  )
}
