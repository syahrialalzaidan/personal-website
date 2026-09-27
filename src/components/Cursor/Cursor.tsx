import { motion, useMotionValue, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import styles from './Cursor.module.css'

const INTERACTIVE = 'a, button, [role="button"], [data-cursor]'
/** Areas that keep the system pointer, like the mini-games, where any lag would hurt play. */
const NATIVE = '[data-native-cursor]'
/** Clickable areas that still keep the plain, un-grown cursor (e.g. the whole crowd). */
const PLAIN = '[data-cursor-plain]'

/**
 * A ball-shaped cursor with a ring around it. Both are pinned exactly to the pointer; the ring
 * only animates its size and hint, never its position, so it can't lag or drift.
 *
 * - `data-cursor="Label"` grows the ring and shows a short hint inside it (e.g. "Drag").
 * - `data-cursor-plain` keeps the plain cursor over something clickable.
 * - Inside `data-native-cursor` areas it steps aside and the system pointer takes over.
 */
export function Cursor() {
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const reduceMotion = useReducedMotion()
  const enabled = finePointer && !reduceMotion

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)

  const [hovering, setHovering] = useState(false)
  const [label, setLabel] = useState<string | null>(null)
  const [pressed, setPressed] = useState(false)
  const [hidden, setHidden] = useState(true)
  const [native, setNative] = useState(false)

  useEffect(() => {
    if (!enabled) return

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX)
      y.set(event.clientY)
      setHidden(false)
      const element = event.target as Element | null
      setNative(Boolean(element?.closest?.(NATIVE)))
      const target = element?.closest?.(PLAIN) ? null : element?.closest?.(INTERACTIVE)
      setHovering(Boolean(target))
      setLabel(target?.getAttribute('data-cursor') || null)
    }
    // Presses also carry a position, so views that only forward clicks still keep the ring in sync.
    const onDown = (event: PointerEvent) => {
      onMove(event)
      setPressed(true)
    }
    const onUp = (event: PointerEvent) => {
      onMove(event)
      setPressed(false)
    }
    const onLeave = () => setHidden(true)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  const ring = [
    styles.ring,
    hovering && styles.hover,
    label && styles.labelled,
    pressed && styles.pressed,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={styles.layer}
      aria-hidden="true"
      data-hidden={hidden || native}
      data-custom-cursor
    >
      {/* One moving element carries both ring and dot, so they always share the exact same centre. */}
      <motion.div className={styles.pointer} style={{ x, y }}>
        <div className={ring}>{label && <span className={styles.label}>{label}</span>}</div>
        {/* The dot is the true click point; over a hint it shrinks and sits below the label. */}
        <div className={styles.dot} data-hint={Boolean(label)} />
      </motion.div>
    </div>
  )
}
