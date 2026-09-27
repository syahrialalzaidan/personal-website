import { motion } from 'motion/react'
import type { Replay } from '../../content/types'
import styles from './HawkEye.module.css'

interface ReviewStepProps {
  replay: Replay
  index: number
  active: boolean
  onChallenge: () => void
}

/** One project, told as a line-call review. The replay screen follows the active step. */
export function ReviewStep({ replay, index, active, onChallenge }: ReviewStepProps) {
  const number = String(index + 1).padStart(2, '0')

  return (
    <article className={styles.step} data-active={active} aria-labelledby={`review-${replay.id}`}>
      <span className={styles.stepNumber} aria-hidden="true">
        {number}
      </span>
      <motion.div
        className={styles.stepBody}
        animate={{ opacity: active ? 1 : 0.32, x: active ? 0 : 12 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className={styles.stepContext}>
          <span>Review {number}</span>
          {replay.context}
        </p>
        <h3 id={`review-${replay.id}`} className={styles.stepTitle}>
          {replay.title}
        </h3>
        <p className={styles.stepSummary}>{replay.summary}</p>
        <ul className={styles.stepHighlights}>
          {replay.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
        <ul className={styles.stepTags} aria-label="Tags">
          {replay.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <div className={styles.stepActions}>
          <button
            type="button"
            className={styles.challenge}
            onClick={onChallenge}
            data-cursor="Review"
          >
            <span className={styles.challengeEye} aria-hidden="true" />
            Challenge the call
          </button>
          {replay.link && (
            <a
              className={styles.visit}
              href={replay.link.href}
              target="_blank"
              rel="noreferrer noopener"
            >
              {replay.link.label}
              <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </motion.div>
    </article>
  )
}
