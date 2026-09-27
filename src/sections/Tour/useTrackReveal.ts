import { useMotionValue, useTransform, type MotionValue } from 'motion/react'
import { useLayoutEffect, type RefObject } from 'react'
import { clamp } from '../../lib/math'

/**
 * 0 → 1 as an element inside a horizontally translated track slides into view.
 * The element's offset parent must be the track. `span` is the fraction of the
 * viewport width the reveal takes.
 */
export function useTrackReveal(
  ref: RefObject<HTMLElement | null>,
  trackX: MotionValue<number>,
  span = 0.45,
): MotionValue<number> {
  const left = useMotionValue(0)
  const viewport = useMotionValue(1)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    // offsetLeft ignores transforms, so the element's own entrance animation can't skew it.
    const measure = () => {
      left.set(element.offsetLeft)
      viewport.set(window.innerWidth)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [ref, left, viewport])

  return useTransform(() => {
    const screenLeft = left.get() + trackX.get()
    return clamp((viewport.get() - screenLeft) / (viewport.get() * span), 0, 1)
  })
}
