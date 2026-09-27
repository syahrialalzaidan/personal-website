import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, PointerEvent, ReactNode } from 'react'
import styles from './MagneticButton.module.css'

type Variant = 'primary' | 'ghost'

interface CommonProps {
  children: ReactNode
  variant?: Variant
  className?: string
}

type AnchorProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & { href: string }
type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined }

const SPRING = { stiffness: 220, damping: 16, mass: 0.4 }
const PULL = 0.32

/** A button (or link) that leans toward the pointer, like a racket face tracking the ball. */
export function MagneticButton(props: AnchorProps | ButtonProps) {
  const { children, variant = 'primary', className, ...rest } = props
  const reduceMotion = useReducedMotion()
  const x = useSpring(useMotionValue(0), SPRING)
  const y = useSpring(useMotionValue(0), SPRING)

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion || event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect()
    x.set((event.clientX - rect.left - rect.width / 2) * PULL)
    y.set((event.clientY - rect.top - rect.height / 2) * PULL)
  }
  const onPointerLeave = () => {
    x.set(0)
    y.set(0)
  }

  const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ')
  const inner = (
    <motion.span className={styles.inner} style={{ x, y }}>
      {children}
    </motion.span>
  )

  if (rest.href !== undefined) {
    const anchorProps = rest as Omit<AnchorProps, keyof CommonProps>
    return (
      <a
        {...anchorProps}
        className={classes}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        {inner}
      </a>
    )
  }

  const buttonProps = rest as Omit<ButtonProps, keyof CommonProps>
  return (
    <button
      type="button"
      {...buttonProps}
      className={classes}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {inner}
    </button>
  )
}
