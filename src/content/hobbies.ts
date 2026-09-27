import type { Sport } from './types'

export const sports: Sport[] = [
  {
    id: 'tennis',
    name: 'Tennis',
    level: 'Advanced',
    rating: 0.9,
    line: 'The main event. It’s the reason this whole page is a tennis match.',
    howToPlay: 'Hold to charge, release inside the green zone to serve an ace.',
  },
  {
    id: 'padel',
    name: 'Padel',
    level: 'High bronze',
    rating: 0.62,
    line: 'Tennis’s social cousin. The walls are allowed, and so is trash talk.',
    howToPlay: 'Click anywhere to smash the ball. Chain bounces off the glass.',
  },
  {
    id: 'ping-pong',
    name: 'Ping pong',
    level: 'Intermediate',
    rating: 0.5,
    line: 'Fast hands, short rallies, zero mercy for loose serves.',
    howToPlay:
      'Move your pointer (or ← →) to control the paddle. Angle it with the paddle edge: off the side before it bounces is out, after the bounce it’s a winner. First to 5.',
  },
  {
    id: 'golf',
    name: 'Golf',
    level: 'Casual',
    rating: 0.28,
    line: 'Mostly here for the walk and the one good shot per round.',
    howToPlay: 'Drag back from the ball to aim and set power. Release to putt.',
  },
]
