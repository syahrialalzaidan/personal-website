import { motion, useTransform, type MotionValue } from 'motion/react'
import type { ReactNode } from 'react'
import { usePointerParallax } from '../../hooks/usePointer'
import styles from './CenterCourt.module.css'

interface ParallaxLayerProps {
  progress: MotionValue<number>
  /** Pointer travel in px; bigger = closer to the camera. */
  depth: number
  /** Scale reached at the end of the scroll dolly. */
  zoom: number
  /** Vertical drift in px across the dolly. */
  drift?: number
  className?: string
  children: ReactNode
}

/**
 * One plane of the stadium. Every plane dollies around the same origin,
 * but nearer planes grow faster, which is what sells the camera moving forward.
 */
export function ParallaxLayer({
  progress,
  depth,
  zoom,
  drift = 0,
  className,
  children,
}: ParallaxLayerProps) {
  const pointer = usePointerParallax(depth)
  const scale = useTransform(progress, [0, 1], [1, zoom])
  const dollyY = useTransform(progress, [0, 1], [0, drift])
  const y = useTransform(() => pointer.y.get() + dollyY.get())

  return (
    <motion.div
      className={[styles.layer, className].filter(Boolean).join(' ')}
      style={{ x: pointer.x, y, scale }}
    >
      {children}
    </motion.div>
  )
}

/**
 * A plane with no JS motion, for phones. Its parallax is a CSS scroll-driven animation (see the
 * touch rules in CenterCourt.module.css), which the browser runs off the main thread.
 */
export function PlainLayer({
  className,
  children,
}: Pick<ParallaxLayerProps, 'className' | 'children'>) {
  return <div className={[styles.layer, className].filter(Boolean).join(' ')}>{children}</div>
}
