import { animate, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'

interface CountUpProps {
  value: number
  decimals?: number
  suffix?: string
  duration?: number
}

const format = (current: number, decimals: number, suffix: string) =>
  `${current.toFixed(decimals)}${suffix}`

/** Counts from zero to `value` the first time it scrolls into view. */
export function CountUp({ value, decimals = 0, suffix = '', duration = 1.6 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const element = ref.current
    if (!element || !inView) return
    if (reduceMotion) {
      element.textContent = format(value, decimals, suffix)
      return
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (current) => {
        element.textContent = format(current, decimals, suffix)
      },
    })
    return () => controls.stop()
  }, [inView, value, decimals, suffix, duration, reduceMotion])

  return (
    <span ref={ref} aria-label={format(value, decimals, suffix)}>
      {format(0, decimals, suffix)}
    </span>
  )
}
