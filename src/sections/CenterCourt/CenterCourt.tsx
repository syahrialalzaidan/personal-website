import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from 'motion/react'
import { useRef, useState, type CSSProperties } from 'react'
import { useSound } from '../../audio/useSound'
import { profile } from '../../content/profile'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { clamp } from '../../lib/math'
import { Beams } from './layers/Beams'
import { CrowdCanvas } from './layers/CrowdCanvas'
import { Floor } from './layers/Floor'
import { HeroBall } from './layers/HeroBall'
import { Sky } from './layers/Sky'
import { Wall } from './layers/Wall'
import { ParallaxLayer } from './ParallaxLayer'
import { LANDSCAPE, PORTRAIT } from './stadium'
import styles from './CenterCourt.module.css'

interface CenterCourtProps {
  /** False while the walkout intro is still covering the page. */
  ready: boolean
}

const EASE = [0.22, 1, 0.36, 1] as const

const caption: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.14, delayChildren: 0.4 } },
}

const wipe: Variants = {
  hidden: { clipPath: 'inset(0 100% 0 0)' },
  shown: { clipPath: 'inset(0 0% 0 0)', transition: { duration: 0.8, ease: EASE } },
}

export function CenterCourt({ ready }: CenterCourtProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const portrait = useMediaQuery('(max-aspect-ratio: 1/1)')
  // Mobile Safari re-draws a layer every time its scale changes, so on touch the camera doesn't
  // zoom at all: planes only slide at different speeds, which the GPU can do for free.
  const touch = useMediaQuery('(hover: none), (pointer: coarse)')
  const plane = (zoom: number, drift: number, touchDrift: number) =>
    touch ? { zoom: 1, drift: touchDrift } : { zoom, drift }
  // Once the hero is well off-screen its layers are dropped, freeing their GPU memory.
  const nearby = useInView(sectionRef, { margin: '50% 0px 50% 0px' })
  const layout = portrait ? PORTRAIT : LANDSCAPE
  const reduceMotion = useReducedMotion()
  const { play } = useSound()
  const [waveKey, setWaveKey] = useState(0)

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const still = useMotionValue(0)
  const progress = reduceMotion ? still : scrollYProgress

  // The caption sinks out below the frame and is fully gone within the first stretch of scroll.
  // Touch pins for a much shorter distance, so it gets a larger share to leave at the same pace.
  const captionEnd = touch ? 0.45 : 0.15
  // Explicitly clamped functions rather than range maps: the range-mapped opacity faded the
  // caption back in once scrolling passed the end of its range.
  const captionOut = useTransform(progress, (value) => clamp(value / captionEnd, 0, 1))
  const overlayOpacity = useTransform(captionOut, (value) => 1 - value)
  const overlayY = useTransform(captionOut, (value) => value * 140)
  // On touch the tour slides up over the hero's exit, so the court only dims rather than going
  // blank: there's something on screen right up until the tour's heading arrives.
  const fadeOut = useTransform(progress, touch ? [0.55, 1] : [0.72, 1], [0, touch ? 0.85 : 1])

  const startWave = () => {
    setWaveKey((key) => key + 1)
    play('swell')
  }

  const stageStyle = {
    '--dolly-y': `${layout.dollyOrigin.y * 100}%`,
    '--stands-top': `${(layout.standsTop / layout.height) * 100}%`,
    '--stands-height': `${((layout.standsBottom - layout.standsTop) / layout.height) * 100}%`,
  } as CSSProperties

  return (
    <section
      id="center-court"
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="hero-title"
    >
      <div ref={stageRef} className={styles.stage} style={stageStyle} data-dormant={!nearby}>
        <ParallaxLayer progress={progress} depth={-6} {...plane(1.06, 0, 0)}>
          <Sky layout={layout} />
        </ParallaxLayer>
        <ParallaxLayer progress={progress} depth={-12} {...plane(1.22, -40, -18)}>
          <CrowdCanvas layout={layout} waveKey={waveKey} twinkle={!touch} />
        </ParallaxLayer>
        {/* Wall and floor always move together, so their seam never opens. */}
        <ParallaxLayer progress={progress} depth={-18} {...plane(1.5, 0, -30)}>
          <Wall layout={layout} />
        </ParallaxLayer>
        <ParallaxLayer progress={progress} depth={-18} {...plane(2.1, 0, -30)}>
          <Floor layout={layout} />
        </ParallaxLayer>
        <ParallaxLayer
          progress={progress}
          depth={-10}
          {...plane(1.3, 0, -24)}
          className={styles.lightLayer}
        >
          <Beams layout={layout} />
        </ParallaxLayer>

        <button
          type="button"
          className={styles.waveZone}
          onClick={startWave}
          aria-label="Start a Mexican wave in the crowd"
          data-cursor-plain
        />

        {/* A sticker-style hint pinned over the stands; clicks pass through to the crowd. */}
        <motion.div
          className={styles.crowdSticker}
          style={{ opacity: overlayOpacity }}
          initial={{ scale: 0, rotate: -24 }}
          animate={ready ? { scale: 1, rotate: -8 } : { scale: 0, rotate: -24 }}
          transition={{ type: 'spring', stiffness: 380, damping: 18, delay: ready ? 1.2 : 0 }}
          aria-hidden="true"
        >
          <span className={styles.crowdStickerBody}>Tap me</span>
        </motion.div>

        <HeroBall constraintsRef={stageRef} active={nearby} />

        <motion.div className={styles.overlay} style={{ opacity: overlayOpacity, y: overlayY }}>
          <motion.div
            className={styles.caption}
            initial="hidden"
            animate={ready ? 'shown' : 'hidden'}
            variants={caption}
          >
            <motion.h1 id="hero-title" className={styles.nameBar} variants={wipe}>
              <span className={styles.firstName}>Mochamad</span>
              <span>Syahrial Alzaidan</span>
            </motion.h1>
            <motion.p className={styles.roleBar} variants={wipe}>
              {profile.headline}
            </motion.p>
          </motion.div>
        </motion.div>

        <motion.div className={styles.fade} style={{ opacity: fadeOut }} aria-hidden="true" />
      </div>
    </section>
  )
}
