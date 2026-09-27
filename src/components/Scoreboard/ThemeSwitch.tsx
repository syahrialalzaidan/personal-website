import { motion } from 'motion/react'
import type { MouseEvent } from 'react'
import { useSound } from '../../audio/useSound'
import { useTheme } from '../../theme/useTheme'
import styles from './Scoreboard.module.css'

/** Day / night session switch. The new session spreads out from the switch itself. */
export function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme()
  const { play } = useSound()
  const isNight = theme === 'night'

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    play('tick')
    toggleTheme({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
  }

  return (
    <button
      type="button"
      className={styles.themeSwitch}
      onClick={handleClick}
      aria-label={
        isNight
          ? 'Switch to the day session (light theme)'
          : 'Switch to the night session (dark theme)'
      }
    >
      <span className={styles.switchTrack} data-night={isNight}>
        <motion.span
          className={styles.switchThumb}
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        >
          {isNight ? <FloodlightIcon /> : <SunIcon />}
        </motion.span>
      </span>
      <span className={styles.switchLabel}>{isNight ? 'Night session' : 'Day session'}</span>
    </button>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
      </g>
    </svg>
  )
}

function FloodlightIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <rect x="4" y="3" width="16" height="9" rx="1.5" fill="currentColor" />
      <g fill="var(--bg)">
        <circle cx="8" cy="7.5" r="1.6" />
        <circle cx="12" cy="7.5" r="1.6" />
        <circle cx="16" cy="7.5" r="1.6" />
      </g>
      <path d="M12 12v9M8 21h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
