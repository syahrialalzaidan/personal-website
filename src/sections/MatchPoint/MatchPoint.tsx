import { AnimatePresence, motion, useInView, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useSound } from '../../audio/useSound'
import { MagneticButton } from '../../components/MagneticButton/MagneticButton'
import { TennisBall } from '../../components/TennisBall/TennisBall'
import { profile, socialLinks } from '../../content/profile'
import { useScrollTo } from '../../hooks/useScrollTo'
import { fadeUp, revealOnView, stagger } from '../../lib/motion'
import { FlipValue } from './FlipValue'
import styles from './MatchPoint.module.css'

const VISITOR_POINTS = ['0', '15', '30', '40', 'AD']
const FLIP_MS = 480
const TOAST_MS = 2400

/** The close: the scoreboard hands the visitor advantage, and the contact links. */
export function MatchPoint() {
  const sectionRef = useRef<HTMLElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const boardInView = useInView(boardRef, { once: true, amount: 0.6 })
  const [visitorPoint, setVisitorPoint] = useState(0)
  const [copied, setCopied] = useState(false)
  const { play } = useSound()
  const scrollTo = useScrollTo()

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end end'] })
  const tossY = useTransform(scrollYProgress, [0, 1], ['55%', '-8%'])
  const tossRotate = useTransform(scrollYProgress, [0, 1], [0, 320])
  const backdropY = useTransform(scrollYProgress, [0, 1], ['30%', '-10%'])

  useEffect(() => {
    if (!boardInView || visitorPoint >= VISITOR_POINTS.length - 1) return
    const timer = window.setTimeout(() => {
      setVisitorPoint((point) => point + 1)
      play('tick')
    }, FLIP_MS)
    return () => window.clearTimeout(timer)
  }, [boardInView, visitorPoint, play])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), TOAST_MS)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      play('pock')
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  return (
    <section
      id="match-point"
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="match-title"
    >
      <motion.p className={styles.backdrop} style={{ y: backdropY }} aria-hidden="true">
        AD
      </motion.p>
      <div className={styles.beams} aria-hidden="true">
        <span />
        <span />
      </div>
      <motion.div
        className={styles.toss}
        style={{ y: tossY, rotate: tossRotate }}
        aria-hidden="true"
      >
        <TennisBall size="100%" />
      </motion.div>

      <motion.div className={styles.inner} {...revealOnView} variants={stagger(0.12)}>
        <motion.div
          ref={boardRef}
          className={styles.board}
          variants={fadeUp}
          role="img"
          aria-label="Scoreboard: advantage to you."
        >
          <div className={styles.boardHead}>
            <span>Championship · Match point</span>
            <span>Sets</span>
            <span>Pts</span>
          </div>
          <div className={styles.boardRow}>
            <span className={styles.boardName}>{profile.nickname}</span>
            <span className={styles.sets}>
              <span>6</span>
              <span>4</span>
              <span>5</span>
            </span>
            <FlipValue value="40" />
          </div>
          <div className={`${styles.boardRow} ${styles.visitor}`}>
            <span className={styles.boardName}>
              <span className={styles.serving} aria-hidden="true" />
              you
            </span>
            <span className={styles.sets}>
              <span>4</span>
              <span>6</span>
              <span>5</span>
            </span>
            <FlipValue value={VISITOR_POINTS[visitorPoint]} />
          </div>
        </motion.div>

        <motion.h2 id="match-title" className={styles.title} variants={fadeUp}>
          Your serve.
        </motion.h2>
        <motion.p className={styles.lede} variants={fadeUp}>
          Open to interesting problems, good teams and the occasional doubles partner. The ball's in
          your court.
        </motion.p>

        <motion.div className={styles.actions} variants={fadeUp}>
          <MagneticButton href={`mailto:${profile.email}`} data-cursor="Email">
            Send an email
          </MagneticButton>
          <MagneticButton variant="ghost" onClick={copyEmail} data-cursor="Copy">
            Copy email
          </MagneticButton>
          {socialLinks.map((link) => (
            <MagneticButton
              key={link.href}
              variant="ghost"
              href={link.href}
              target="_blank"
              rel="noreferrer noopener"
              data-cursor={link.label}
            >
              {link.label} ↗
            </MagneticButton>
          ))}
        </motion.div>
      </motion.div>

      <footer className={styles.footer}>
        <p>
          © {new Date().getFullYear()} {profile.fullName}
        </p>
        <button type="button" className={styles.top} onClick={() => scrollTo(0)} data-cursor="Top">
          Back to center court ↑
        </button>
      </footer>

      <AnimatePresence>
        {copied && (
          <motion.p
            className={styles.toast}
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            Copied {profile.email}. Ball's in your court.
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  )
}
