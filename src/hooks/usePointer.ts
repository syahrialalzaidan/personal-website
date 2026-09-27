import {
  motionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useEffect } from 'react'

/**
 * One shared, normalized pointer position for the whole page (-1 … 1 on each axis).
 * A single window listener feeds every parallax layer, instead of one listener per layer.
 */
const pointerX = motionValue(0)
const pointerY = motionValue(0)
let subscribers = 0

const handlePointerMove = (event: PointerEvent) => {
  if (event.pointerType === 'touch') return
  pointerX.set((event.clientX / window.innerWidth) * 2 - 1)
  pointerY.set((event.clientY / window.innerHeight) * 2 - 1)
}

export function usePointer(): { x: MotionValue<number>; y: MotionValue<number> } {
  useEffect(() => {
    if (subscribers === 0)
      window.addEventListener('pointermove', handlePointerMove, { passive: true })
    subscribers += 1
    return () => {
      subscribers -= 1
      if (subscribers === 0) window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [])
  return { x: pointerX, y: pointerY }
}

const SPRING = { stiffness: 60, damping: 18, mass: 0.6 }

/**
 * Pointer-driven parallax offset for a layer. `depth` is the travel in px at the viewport edge;
 * negative depths move against the pointer, which reads as "further away".
 */
export function usePointerParallax(depthX: number, depthY = depthX * 0.6) {
  const { x, y } = usePointer()
  const reduceMotion = useReducedMotion()
  const scale = reduceMotion ? 0 : 1
  const offsetX = useTransform(x, (value) => value * depthX * scale)
  const offsetY = useTransform(y, (value) => value * depthY * scale)
  return { x: useSpring(offsetX, SPRING), y: useSpring(offsetY, SPRING) }
}
