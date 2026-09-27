/** Regulation court dimensions in centimetres. */
export const COURT = {
  width: 1097,
  length: 2377,
  singlesInset: 137,
  serviceFromNet: 640,
  netHeight: 91.4,
  apronSide: 365,
  apronEnd: 640,
} as const

/** The same court in metres, with x = 0 on the centre line and y = 0 on the near baseline. */
export const COURT_M = {
  halfWidth: 5.485,
  singlesHalfWidth: 4.115,
  length: 23.77,
  net: 11.885,
  serviceFromNet: 6.4,
  postHalfSpan: 6.4,
  netCenter: 0.914,
  netPost: 1.07,
  runBack: 6.4,
} as const

export type Rect = [x1: number, y1: number, x2: number, y2: number]

/** Every painted line as a thin rectangle on the court surface (metres). */
export function courtLineRects(line: number): Rect[] {
  const { halfWidth: hw, singlesHalfWidth: sw, length: L, net, serviceFromNet: s } = COURT_M
  const half = line / 2
  return [
    [-hw, 0, hw, line * 1.4],
    [-hw, L - line * 1.4, hw, L],
    [-hw, 0, -hw + line, L],
    [hw - line, 0, hw, L],
    [-sw, 0, -sw + line, L],
    [sw - line, 0, sw, L],
    [-sw, net - s - half, sw, net - s + half],
    [-sw, net + s - half, sw, net + s + half],
    [-half, net - s, half, net + s],
    [-half, 0, half, 0.3],
    [-half, L - 0.3, half, L],
  ]
}

export type Vec3 = [x: number, y: number, z: number]

export interface Camera {
  /** Camera position in metres; the court's near baseline is y = 0, centre line is x = 0. */
  position: Vec3
  /** Downward tilt in radians. */
  pitch: number
  focal: number
  /** Screen-space centre. */
  center: [number, number]
}

/** Pinhole projection of a point on (or above) the court into screen space. */
export function project([x, y, z]: Vec3, camera: Camera): [number, number] {
  const dx = x - camera.position[0]
  const dy = y - camera.position[1]
  const dz = z - camera.position[2]
  const cos = Math.cos(camera.pitch)
  const sin = Math.sin(camera.pitch)
  const depth = dy * cos - dz * sin
  const up = dy * sin + dz * cos
  const safeDepth = Math.max(depth, 0.01)
  return [
    camera.center[0] + (camera.focal * dx) / safeDepth,
    camera.center[1] - (camera.focal * up) / safeDepth,
  ]
}

/** Court-percentage coordinates (x across, y down from the far baseline) to metres. */
export function courtPercentToMetres([px, py]: readonly [number, number]): [number, number] {
  const widthM = COURT.width / 100
  const lengthM = COURT.length / 100
  return [(px / 100 - 0.5) * widthM, (1 - py / 100) * lengthM]
}
