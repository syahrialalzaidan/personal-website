import { motion, useAnimationControls } from 'motion/react'
import { useSound } from '../../audio/useSound'
import type { Trophy } from '../../content/types'
import { useTilt } from '../../hooks/useTilt'
import { fadeUp } from '../../lib/motion'
import { TrophyArt } from './TrophyArt'
import styles from './TrophyRoom.module.css'

interface TrophyItemProps {
  trophy: Trophy
}

/** A trophy on the shelf with its engraved plaque. Click to lift it overhead. */
export function TrophyItem({ trophy }: TrophyItemProps) {
  const tilt = useTilt(16)
  const lift = useAnimationControls()
  const { play } = useSound()

  const celebrate = () => {
    play('cup')
    void lift.start({
      y: [0, -46, -40, 0],
      rotate: [0, -6, 6, 0],
      scale: [1, 1.12, 1.12, 1],
      transition: { duration: 1.1, times: [0, 0.35, 0.65, 1], ease: 'easeInOut' },
    })
  }

  return (
    <motion.li className={styles.item} variants={fadeUp}>
      <motion.button
        type="button"
        className={styles.trophyButton}
        onClick={celebrate}
        aria-label={`Lift the ${trophy.title} trophy`}
        data-cursor="Lift"
        style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
        {...tilt.handlers}
      >
        <motion.span className={styles.trophyLift} animate={lift}>
          <TrophyArt shape={trophy.shape} metal={trophy.metal} className={styles.trophyArt} />
        </motion.span>
        <span className={styles.trophyShadow} aria-hidden="true" />
      </motion.button>
      <span className={styles.plank} aria-hidden="true" />

      <div className={styles.plaque}>
        <p className={styles.result}>{trophy.result}</p>
        <h3 className={styles.trophyTitle}>{trophy.title}</h3>
        <p className={styles.meta}>
          <span>{trophy.scope}</span>
          <span>{trophy.date}</span>
        </p>
        <p className={styles.detail}>{trophy.detail}</p>
      </div>
    </motion.li>
  )
}
