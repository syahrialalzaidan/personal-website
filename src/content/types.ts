export type SectionId =
  'center-court' | 'tour' | 'player' | 'hawk-eye' | 'trophy-room' | 'off-court' | 'match-point'

export interface SectionMeta {
  id: SectionId
  /** Label shown in the scoreboard HUD. */
  label: string
  /** Tennis score the HUD shows while this section is on screen. */
  point: string
}

export interface ExternalLink {
  label: string
  href: string
}

export interface Match {
  id: string
  round: string
  company: string
  location: string
  role: string
  period: string
  /** One-line, commentator-style summary. */
  commentary: string
  highlights: string[]
  stack: string[]
  status: 'advanced' | 'live'
  /** Big background year used by the parallax layer. */
  year: number
}

export interface Replay {
  id: string
  title: string
  context: string
  summary: string
  highlights: string[]
  tags: string[]
  link?: ExternalLink
  /** Playful broadcast readouts for the Hawk-Eye screen. */
  readout: { speed: number; spin: number; margin: string }
  /** Trajectory on the replay court, in court-space percentages. */
  shot: { from: [number, number]; bounce: [number, number]; apex: number }
}

export type TrophyShape = 'plate' | 'cup' | 'bowl' | 'star'

export interface Trophy {
  id: string
  title: string
  result: string
  scope: 'International' | 'National'
  date: string
  detail: string
  shape: TrophyShape
  metal: 'gold' | 'silver' | 'bronze'
}

export type SportId = 'tennis' | 'padel' | 'ping-pong' | 'golf'

export interface Sport {
  id: SportId
  name: string
  level: string
  /** 0–1, drives the rating meter. */
  rating: number
  line: string
  howToPlay: string
}
