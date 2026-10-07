import { motion, useMotionTemplate, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'
import type { Match } from '../../content/types'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useTilt } from '../../hooks/useTilt'
import { useTrackReveal } from './useTrackReveal'
import styles from './Tour.module.css'

interface MatchCardProps {
  match: Match
  index: number
  trackX: MotionValue<number>
}

/** One round of the draw: a broadcast "match card" that swings in as the track slides past. */
export function MatchCard({ match, index, trackX }: MatchCardProps) {
  const ref = useRef<HTMLElement>(null)
  const reveal = useTrackReveal(ref, trackX)
  const tilt = useTilt(6)
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')

  const enterRotate = useTransform(reveal, [0, 1], [-28, 0])
  const rotateY = useTransform(() => enterRotate.get() + tilt.rotateY.get())
  const opacity = useTransform(reveal, [0, 0.5], [0, 1])
  const scale = useTransform(reveal, [0, 1], [0.86, 1])
  const glare = useMotionTemplate`radial-gradient(420px circle at ${tilt.glareX}% ${tilt.glareY}%, var(--sheen), transparent 60%)`

  return (
    <motion.article
      ref={ref}
      className={`${styles.card} ${index % 2 === 0 ? styles.high : styles.low}`}
      data-live={match.status === 'live'}
      style={{ rotateX: tilt.rotateX, rotateY, opacity, scale }}
      aria-labelledby={`match-${match.id}`}
      {...tilt.handlers}
    >
      {finePointer && (
        <motion.div className={styles.glare} style={{ background: glare }} aria-hidden="true" />
      )}

      <MatchDetails match={match} index={index} />
    </motion.article>
  )
}

/** The same card standing still, for the phone layout's plain vertical list. */
export function MatchCardFlat({ match, index }: Omit<MatchCardProps, 'trackX'>) {
  return (
    <article
      className={`${styles.card} ${styles.flat}`}
      data-live={match.status === 'live'}
      aria-labelledby={`match-${match.id}`}
    >
      <MatchDetails match={match} index={index} />
    </article>
  )
}

function MatchDetails({ match, index }: Omit<MatchCardProps, 'trackX'>) {
  const live = match.status === 'live'
  return (
    <>
      <header className={styles.cardHeader}>
        <span className={styles.round}>{match.round}</span>
        <span>{match.period}</span>
      </header>

      <div className={styles.cardBody}>
        <h3 id={`match-${match.id}`} className={styles.company}>
          {match.company}
        </h3>
        <p className={styles.location}>{match.location}</p>
        <p className={styles.role}>{match.role}</p>
        <blockquote className={styles.commentary}>{match.commentary}</blockquote>
        <ul className={styles.highlights}>
          {match.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
        <ul className={styles.stack} aria-label="Stack">
          {match.stack.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <footer className={styles.cardFooter}>
        {live ? (
          <span className={styles.statusLive}>
            <span className={styles.liveDot} aria-hidden="true" />
            In play
          </span>
        ) : (
          <span className={styles.statusAdvanced}>
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path
                d="M3 8.5l3 3 7-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Advanced
          </span>
        )}
        <span className={styles.matchNumber}>Match {String(index + 1).padStart(2, '0')}</span>
      </footer>
    </>
  )
}
