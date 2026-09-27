import { useScroll, useTransform, type MotionValue } from 'motion/react'
import { useLayoutEffect, useState, type RefObject } from 'react'

interface HorizontalScroll {
  /** Extra vertical scroll the section needs so the track can travel its full width. */
  distance: number
  x: MotionValue<number>
  progress: MotionValue<number>
}

/**
 * Converts vertical scroll through a pinned section into horizontal travel of `track`.
 * The section should be `distance + 100svh` tall with a sticky, full-height stage.
 */
export function useHorizontalScroll(
  sectionRef: RefObject<HTMLElement | null>,
  trackRef: RefObject<HTMLElement | null>,
): HorizontalScroll {
  const [distance, setDistance] = useState(0)

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    const measure = () => setDistance(Math.max(0, track.scrollWidth - window.innerWidth))
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    window.addEventListener('resize', measure)
    measure()
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [trackRef])

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, (value) => -value * distance)

  return { distance, x, progress: scrollYProgress }
}
