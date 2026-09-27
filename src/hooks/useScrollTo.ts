import { useLenis } from 'lenis/react'
import { useCallback } from 'react'

/** Scrolls to a section, through Lenis when smooth scrolling is on. */
export function useScrollTo() {
  const lenis = useLenis()
  return useCallback(
    (target: string | number) => {
      if (lenis) {
        lenis.scrollTo(typeof target === 'string' ? `#${target}` : target, {
          duration: 1.6,
          easing: (t) => 1 - Math.pow(1 - t, 4),
        })
        return
      }
      if (typeof target === 'number') window.scrollTo({ top: target })
      else document.getElementById(target)?.scrollIntoView()
    },
    [lenis],
  )
}
