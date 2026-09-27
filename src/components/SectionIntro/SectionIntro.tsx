import { motion, type Variants } from 'motion/react'
import styles from './SectionIntro.module.css'

interface SectionIntroProps {
  headingId: string
  segment: string
  eyebrow: string
  title: string
  lede?: string
  align?: 'start' | 'center'
  className?: string
}

const container: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07 } },
}

const word: Variants = {
  hidden: { y: '105%', rotate: 4 },
  shown: { y: '0%', rotate: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
}

const fade: Variants = {
  hidden: { opacity: 0, y: 16 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
}

/** Broadcast-style segment opener: a chyron chip, a masked headline and a lede. */
export function SectionIntro({
  headingId,
  segment,
  eyebrow,
  title,
  lede,
  align = 'start',
  className,
}: SectionIntroProps) {
  return (
    <motion.header
      className={[styles.intro, styles[align], className].filter(Boolean).join(' ')}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.4 }}
      variants={container}
    >
      <motion.p className={styles.chyron} variants={fade}>
        <span className={styles.segment}>{segment}</span>
        <span>{eyebrow}</span>
      </motion.p>
      <h2 id={headingId} className={styles.title} aria-label={title}>
        {title.split(' ').map((part, index) => (
          <span key={`${part}-${index}`} className={styles.mask} aria-hidden="true">
            <motion.span className={styles.word} variants={word}>
              {part}
            </motion.span>
          </span>
        ))}
      </h2>
      {lede && (
        <motion.p className={styles.lede} variants={fade}>
          {lede}
        </motion.p>
      )}
    </motion.header>
  )
}
