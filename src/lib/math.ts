export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

export const lerp = (from: number, to: number, t: number): number => from + (to - from) * t

/** Maps `value` from one range to another, clamped to the output range. */
export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number => {
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1)
  return lerp(outMin, outMax, t)
}

/** Small deterministic PRNG so generated scenery (crowds, noise) is stable across renders. */
export const createRandom = (seed: number): (() => number) => {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const quadraticPoint = (
  from: readonly [number, number],
  control: readonly [number, number],
  to: readonly [number, number],
  t: number,
): [number, number] => {
  const inv = 1 - t
  return [
    inv * inv * from[0] + 2 * inv * t * control[0] + t * t * to[0],
    inv * inv * from[1] + 2 * inv * t * control[1] + t * t * to[1],
  ]
}
