import { useEffect, useRef, type RefObject } from 'react'

export interface CanvasFrame {
  context: CanvasRenderingContext2D
  /** CSS pixel size of the canvas. */
  width: number
  height: number
  /** Seconds since the previous frame, capped so a background tab can't cause a physics jump. */
  delta: number
  time: number
  /** Bumps whenever the canvas is resized (which also clears it), so idle scenes know to repaint. */
  sizeVersion: number
}

interface CanvasLoopOptions {
  /** Upper bound on device pixel ratio; lower it for large, soft scenes to save fill rate. */
  maxPixelRatio?: number
  /** Set false to pause the loop (e.g. while covered); the canvas keeps its last frame. */
  active?: boolean
}

/**
 * Runs `onFrame` on a HiDPI-aware canvas, but only while the canvas is on screen, the tab is
 * visible and `active` is true. `onFrame` can change every render; the latest one is always used.
 */
export function useCanvasLoop(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  onFrame: (frame: CanvasFrame) => void,
  { maxPixelRatio = 2, active = true }: CanvasLoopOptions = {},
): void {
  const frameRef = useRef(onFrame)
  const activeRef = useRef(active)
  const controls = useRef<{ start: () => void; stop: () => void } | null>(null)
  useEffect(() => {
    frameRef.current = onFrame
  })

  useEffect(() => {
    activeRef.current = active
    if (active) controls.current?.start()
    else controls.current?.stop()
  }, [active])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    let width = 0
    let height = 0
    let raf = 0
    let visible = false
    let last = performance.now()
    let sizeVersion = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, maxPixelRatio)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      sizeVersion += 1
    }

    const tick = (now: number) => {
      const delta = Math.min((now - last) / 1000, 1 / 30)
      last = now
      if (width > 0 && height > 0)
        frameRef.current({ context, width, height, delta, time: now / 1000, sizeVersion })
      raf = requestAnimationFrame(tick)
    }

    const start = () => {
      if (raf || !visible || !activeRef.current || document.hidden) return
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    controls.current = { start, stop }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    resize()

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
      if (visible) start()
      else stop()
    })
    intersectionObserver.observe(canvas)

    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      controls.current = null
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [canvasRef, maxPixelRatio])
}
