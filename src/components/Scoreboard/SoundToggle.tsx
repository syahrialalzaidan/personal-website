import { useSound } from '../../audio/useSound'
import styles from './Scoreboard.module.css'

export function SoundToggle() {
  const { enabled, toggle } = useSound()

  return (
    <button
      type="button"
      className={styles.iconButton}
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? 'Mute court sounds' : 'Turn on court sounds'}
      data-cursor={enabled ? 'Mute' : 'Sound'}
    >
      <span className={styles.bars} data-on={enabled} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
    </button>
  )
}
