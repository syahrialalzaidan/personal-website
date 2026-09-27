import { motion, useMotionTemplate } from 'motion/react'
import { useId } from 'react'
import { profile } from '../../content/profile'
import { useTilt } from '../../hooks/useTilt'
import styles from './PlayerProfile.module.css'

/** A holographic trading card. The foil and glare follow the pointer. */
export function PlayerCard() {
  const tilt = useTilt(14)
  const foil = useMotionTemplate`linear-gradient(115deg, transparent 20%, rgba(255, 0, 170, 0.28) ${tilt.glareX}%, rgba(0, 220, 255, 0.28) calc(${tilt.glareX}% + 12%), rgba(216, 255, 62, 0.3) calc(${tilt.glareX}% + 24%), transparent 80%)`
  const glare = useMotionTemplate`radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.5), transparent 45%)`

  return (
    <motion.figure
      className={styles.card}
      data-cursor="Tilt"
      style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
      {...tilt.handlers}
    >
      <div className={styles.cardInner}>
        <header className={styles.cardTop}>
          <span className={styles.seed}>Seed 01</span>
          <span className={styles.flag} aria-label="Indonesia">
            <span />
            <span />
          </span>
        </header>

        <div className={styles.portrait}>
          <PortraitArt />
        </div>

        <figcaption className={styles.cardName}>
          <span className={styles.cardFirst}>Mochamad Syahrial</span>
          <span>{profile.nickname}</span>
        </figcaption>

        <dl className={styles.cardStats}>
          <div>
            <dt>Plays</dt>
            <dd>Full-stack</dd>
          </div>
          <div>
            <dt>Forehand</dt>
            <dd>Go · Clojure</dd>
          </div>
          <div>
            <dt>Backhand</dt>
            <dd>TypeScript</dd>
          </div>
          <div>
            <dt>Trained at</dt>
            <dd>ITB</dd>
          </div>
        </dl>
      </div>
      <motion.div className={styles.foil} style={{ background: foil }} aria-hidden="true" />
      <motion.div className={styles.cardGlare} style={{ background: glare }} aria-hidden="true" />
    </motion.figure>
  )
}

/** Monogram, crossed racket and ball over court lines: the "portrait" without a photo. */
function PortraitArt() {
  const id = useId()
  return (
    <svg viewBox="0 0 300 260" className={styles.portraitSvg} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--court)' }} />
          <stop offset="1" style={{ stopColor: 'var(--court-apron)' }} />
        </linearGradient>
        <radialGradient id={`${id}-ball`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" style={{ stopColor: 'var(--ball-light)' }} />
          <stop offset="0.55" style={{ stopColor: 'var(--ball)' }} />
          <stop offset="1" style={{ stopColor: 'var(--ball-shade)' }} />
        </radialGradient>
        <pattern id={`${id}-strings`} width="9" height="9" patternUnits="userSpaceOnUse">
          <path d="M0 0H9M0 0V9" stroke="#fff" strokeOpacity="0.55" strokeWidth="1" />
        </pattern>
        <clipPath id={`${id}-head`}>
          <ellipse cx="0" cy="0" rx="52" ry="66" />
        </clipPath>
      </defs>

      <rect width="300" height="260" fill={`url(#${id}-bg)`} />
      <g fill="none" style={{ stroke: 'var(--court-line)' }} strokeWidth="3" opacity="0.55">
        <path d="M30 0V260M270 0V260M30 150H270M150 150V260" />
      </g>
      <text x="150" y="150" textAnchor="middle" className={styles.monogram}>
        SA
      </text>

      <g transform="translate(168 122) rotate(32)">
        <rect x="-7" y="66" width="14" height="44" rx="4" fill="#2a2f3a" />
        <rect x="-8" y="104" width="16" height="36" rx="5" fill="#111" />
        <path
          d="M-7 66 L-22 48 M7 66 L22 48"
          stroke="#2a2f3a"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <ellipse
          cx="0"
          cy="0"
          rx="52"
          ry="66"
          fill={`url(#${id}-strings)`}
          clipPath={`url(#${id}-head)`}
        />
        <ellipse cx="0" cy="0" rx="52" ry="66" fill="none" stroke="#f4f7ff" strokeWidth="8" />
        <ellipse
          cx="0"
          cy="0"
          rx="52"
          ry="66"
          fill="none"
          style={{ stroke: 'var(--clay)' }}
          strokeWidth="3"
        />
      </g>

      <circle cx="86" cy="78" r="30" fill={`url(#${id}-ball)`} />
      <path
        d="M62 62 C 76 70, 80 88, 66 100 M110 62 C 96 70, 92 88, 106 100"
        fill="none"
        style={{ stroke: 'var(--ball-seam)' }}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
