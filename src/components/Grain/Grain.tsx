import styles from './Grain.module.css'

/** Static film grain over the page; gives flat vector scenes a broadcast-camera texture. */
export function Grain() {
  return <div className={styles.grain} aria-hidden="true" />
}
