import type { Variants } from 'motion/react'

export const EASE_OUT = [0.22, 1, 0.36, 1] as const

/** Fade-and-rise used for content blocks entering the viewport. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
}

export const stagger = (gap = 0.08, delay = 0): Variants => ({
  hidden: {},
  shown: { transition: { staggerChildren: gap, delayChildren: delay } },
})

/** Spread onto a motion element to play its variants once when it scrolls into view. */
export const revealOnView = {
  initial: 'hidden',
  whileInView: 'shown',
  // A low threshold so tall blocks on small screens still reveal as soon as they arrive.
  viewport: { once: true, amount: 0.1 },
} as const
