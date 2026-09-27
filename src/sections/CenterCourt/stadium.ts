/**
 * Geometry for the hero stadium.
 *
 * The floor is rendered through a real pinhole projection (camera looking level toward
 * the far wall), so court lines, the net and the umpire chair all share one perspective.
 * Two framings exist: a wide one for landscape screens and a taller one for phones.
 */

import { COURT_M } from '../../components/Court/geometry'

export interface FloorCamera {
  /** Focal length in view-box units. */
  focal: number
  /** Camera height above the court, metres. */
  height: number
  /** Distance from the camera to the near baseline, metres. */
  distance: number
  /** Screen y of the horizon (eye level). */
  horizon: number
  centerX: number
}

export interface StadiumLayout {
  width: number
  height: number
  skyBottom: number
  standsTop: number
  standsBottom: number
  wallTop: number
  /** Where the far wall meets the floor. */
  floorTop: number
  camera: FloorCamera
  /**
   * Scroll-dolly origin as a fraction of the view box. It sits on the wall/floor seam so the
   * two planes stay joined while they scale at different rates.
   */
  dollyOrigin: { x: number; y: number }
}

interface LayoutSpec {
  width: number
  height: number
  skyBottom: number
  wallTop: number
  floorTop: number
  nearBaselineY: number
  nearBaselineWidth: number
  cameraDistance: number
}

function createLayout(spec: LayoutSpec): StadiumLayout {
  const focal = (spec.nearBaselineWidth * spec.cameraDistance) / (COURT_M.halfWidth * 2)
  const farDepth = COURT_M.length + COURT_M.runBack + spec.cameraDistance
  const height =
    (spec.nearBaselineY - spec.floorTop) / (focal * (1 / spec.cameraDistance - 1 / farDepth))
  const horizon = spec.floorTop - (focal * height) / farDepth

  return {
    width: spec.width,
    height: spec.height,
    skyBottom: spec.skyBottom,
    standsTop: spec.skyBottom,
    // The stands run straight down to the wall.
    standsBottom: spec.wallTop,
    wallTop: spec.wallTop,
    floorTop: spec.floorTop,
    camera: { focal, height, distance: spec.cameraDistance, horizon, centerX: spec.width / 2 },
    dollyOrigin: { x: 0.5, y: spec.floorTop / spec.height },
  }
}

export const LANDSCAPE = createLayout({
  width: 1600,
  height: 1000,
  skyBottom: 196,
  wallTop: 452,
  floorTop: 664,
  nearBaselineY: 986,
  nearBaselineWidth: 860,
  cameraDistance: 6,
})

export const PORTRAIT = createLayout({
  width: 780,
  height: 1600,
  skyBottom: 300,
  wallTop: 708,
  floorTop: 900,
  nearBaselineY: 1540,
  nearBaselineWidth: 640,
  cameraDistance: 6,
})

/**
 * Projects a court-space point into the view box.
 * x: metres across (0 = centre line), y: metres from the near baseline, z: metres up.
 */
export function projectFloor(camera: FloorCamera, x: number, y: number, z = 0): [number, number] {
  const depth = Math.max(y + camera.distance, 0.05)
  return [
    camera.centerX + (camera.focal * x) / depth,
    camera.horizon + (camera.focal * (camera.height - z)) / depth,
  ]
}

/** A flat rectangle on the court surface, projected to an SVG `points` string. */
export function floorQuad(
  camera: FloorCamera,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  return [
    projectFloor(camera, x1, y1),
    projectFloor(camera, x2, y1),
    projectFloor(camera, x2, y2),
    projectFloor(camera, x1, y2),
  ]
    .map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`)
    .join(' ')
}

export interface FloodlightRig {
  towers: [number, number]
  headY: number
  headWidth: number
  headHeight: number
}

/** Where the two floodlight towers stand; shared by the sky and the light beams. */
export function floodlightRig({ width, height, skyBottom }: StadiumLayout): FloodlightRig {
  const landscape = width > height
  const headWidth = landscape ? 150 : 120
  return {
    towers: landscape ? [width * 0.085, width * 0.915] : [width * 0.12, width * 0.88],
    headY: skyBottom * (landscape ? 0.36 : 0.34),
    headWidth,
    headHeight: headWidth * 0.46,
  }
}
