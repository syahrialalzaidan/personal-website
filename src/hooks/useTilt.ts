import {
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import type { PointerEvent } from 'react'

interface Tilt {
  rotateX: MotionValue<number>
  rotateY: MotionValue<number>
  /** Pointer position inside the element (0–100), handy for glare / sheen gradients. */
  glareX: MotionValue<number>
  glareY: MotionValue<number>
  handlers: {
    onPointerMove: (event: PointerEvent<HTMLElement>) => void
    onPointerLeave: () => void
  }
}

const SPRING = { stiffness: 200, damping: 20, mass: 0.5 }

/** Pointer-driven 3D tilt for cards. `max` is the tilt in degrees at the element's edge. */
export function useTilt(max = 8): Tilt {
  const reduceMotion = useReducedMotion()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const springX = useSpring(px, SPRING)
  const springY = useSpring(py, SPRING)
  const limit = reduceMotion ? 0 : max

  return {
    rotateX: useTransform(springY, [0, 1], [limit, -limit]),
    rotateY: useTransform(springX, [0, 1], [-limit, limit]),
    glareX: useTransform(springX, [0, 1], [0, 100]),
    glareY: useTransform(springY, [0, 1], [0, 100]),
    handlers: {
      onPointerMove: (event) => {
        if (event.pointerType === 'touch') return
        const rect = event.currentTarget.getBoundingClientRect()
        px.set((event.clientX - rect.left) / rect.width)
        py.set((event.clientY - rect.top) / rect.height)
      },
      onPointerLeave: () => {
        px.set(0.5)
        py.set(0.5)
      },
    },
  }
}
