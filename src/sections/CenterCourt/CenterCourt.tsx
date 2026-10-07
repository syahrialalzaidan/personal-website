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
import { Sticker } from '../../components/Sticker/Sticker'
import { profile } from '../../content/profile'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { clamp } from '../../lib/math'
import { Beams } from './layers/Beams'
import { CrowdCanvas } from './layers/CrowdCanvas'
import { Floor } from './layers/Floor'
import { HeroBall } from './layers/HeroBall'
import { Sky } from './layers/Sky'
import { Wall } from './layers/Wall'
import { ParallaxLayer, StillLayer } from './ParallaxLayer'
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
  const ballBoundsRef = useRef<HTMLDivElement>(null)
  const portrait = useMediaQuery('(max-aspect-ratio: 1/1)')
  // Phones get a still frame: no pinned scroll, no camera dolly and no scroll-linked fades. The
  // stadium paints once and simply scrolls away, so nothing has to run while the page moves.
  const touch = useMediaQuery('(hover: none), (pointer: coarse)')
  // Once the hero is well off-screen its layers are dropped, freeing their GPU memory.
  const nearby = useInView(sectionRef, { margin: '50% 0px 50% 0px' })
  const layout = portrait ? PORTRAIT : LANDSCAPE
  const reduceMotion = useReducedMotion()
  const { play } = useSound()
  const [waveKey, setWaveKey] = useState(0)

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const still = useMotionValue(0)
  const progress = reduceMotion || touch ? still : scrollYProgress

  // The caption sinks out below the frame and is fully gone within the first stretch of scroll.
  // Explicitly clamped functions rather than range maps: the range-mapped opacity faded the
  // caption back in once scrolling passed the end of its range.
  const captionOut = useTransform(progress, (value) => clamp(value / 0.15, 0, 1))
  const overlayOpacity = useTransform(captionOut, (value) => 1 - value)
  const overlayY = useTransform(captionOut, (value) => value * 140)
  const fadeOut = useTransform(progress, [0.72, 1], [0, 1])
  // On phones the caption and hints just scroll away with the page.
  const scrollFade = touch ? undefined : { opacity: overlayOpacity }

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
        {touch ? (
          <StillLayer>
            <Sky layout={layout} />
            <CrowdCanvas layout={layout} waveKey={waveKey} twinkle={false} />
            <Wall layout={layout} />
            <Floor layout={layout} />
            <Beams layout={layout} />
          </StillLayer>
        ) : (
          <>
            <ParallaxLayer progress={progress} depth={-6} zoom={1.06}>
              <Sky layout={layout} />
            </ParallaxLayer>
            <ParallaxLayer progress={progress} depth={-12} zoom={1.22} drift={-40}>
              <CrowdCanvas layout={layout} waveKey={waveKey} twinkle />
            </ParallaxLayer>
            {/* Wall and floor always move together, so their seam never opens. */}
            <ParallaxLayer progress={progress} depth={-18} zoom={1.5}>
              <Wall layout={layout} />
            </ParallaxLayer>
            <ParallaxLayer progress={progress} depth={-18} zoom={2.1}>
              <Floor layout={layout} />
            </ParallaxLayer>
            <ParallaxLayer progress={progress} depth={-10} zoom={1.3} className={styles.lightLayer}>
              <Beams layout={layout} />
            </ParallaxLayer>
          </>
        )}

        <button
          type="button"
          className={styles.waveZone}
          onClick={startWave}
          aria-label="Start a Mexican wave in the crowd"
          data-cursor-plain
        />

        {/* Points at the tappable crowd until the first wave; clicks pass through it. */}
        <Sticker
          show={ready && waveKey === 0}
          rotate={-8}
          delay={1.2}
          className={styles.crowdSticker}
          style={scrollFade}
        >
          Tap me
        </Sticker>

        {/* Where the ball may be thrown: clear of the scoreboard, and on phones of the caption too. */}
        <div ref={ballBoundsRef} className={styles.ballBounds} aria-hidden="true" />
        <HeroBall
          constraintsRef={ballBoundsRef}
          active={nearby}
          ready={ready}
          hintOpacity={touch ? undefined : overlayOpacity}
        />

        <motion.div
          className={styles.overlay}
          style={touch ? undefined : { opacity: overlayOpacity, y: overlayY }}
        >
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

        {!touch && (
          <motion.div className={styles.fade} style={{ opacity: fadeOut }} aria-hidden="true" />
        )}
      </div>
    </section>
  )
}
