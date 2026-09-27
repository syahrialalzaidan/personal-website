import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { profile, sections } from '../../content/profile'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useScrollTo } from '../../hooks/useScrollTo'
import { useSound } from '../../audio/useSound'
import { SoundToggle } from './SoundToggle'
import { ThemeSwitch } from './ThemeSwitch'
import styles from './Scoreboard.module.css'

const SECTION_IDS = sections.map((section) => section.id)

/**
 * The broadcast score bug that follows you down the page.
 * The point score advances as you move through the segments; it doubles as navigation.
 */
export function Scoreboard() {
  const active = useActiveSection(SECTION_IDS)
  const current = sections.find((section) => section.id === active) ?? sections[0]
  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const scrollTo = useScrollTo()
  const { play } = useSound()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    const onPointer = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  const goTo = (id: string) => {
    setOpen(false)
    play('tick')
    scrollTo(id)
  }

  return (
    <header className={styles.hud}>
      <nav ref={navRef} className={styles.nav} aria-label="Sections">
        <button
          type="button"
          className={styles.board}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="segment-menu"
          data-cursor="Menu"
        >
          <span className={styles.live}>
            <span className={styles.liveDot} aria-hidden="true" />
            Live
          </span>
          <span className={styles.player}>{profile.nickname}</span>
          <span className={styles.segmentLabel}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={current.id}
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                exit={{ y: '-100%', opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {current.label}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className={styles.point} aria-label={`Score ${current.point}`}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={current.point}
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: 90, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {current.point}
              </motion.span>
            </AnimatePresence>
          </span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.ul
              id="segment-menu"
              className={styles.menu}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {sections.map((section, index) => (
                <li key={section.id}>
                  <button
                    type="button"
                    className={styles.menuItem}
                    data-active={section.id === active}
                    onClick={() => goTo(section.id)}
                  >
                    <span className={styles.menuIndex}>{String(index + 1).padStart(2, '0')}</span>
                    <span>{section.label}</span>
                    <span className={styles.menuPoint}>{section.point}</span>
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </nav>

      <div className={styles.controls}>
        <ThemeSwitch />
        <SoundToggle />
      </div>

      <motion.div className={styles.progress} style={{ scaleX: progress }} aria-hidden="true" />
    </header>
  )
}
