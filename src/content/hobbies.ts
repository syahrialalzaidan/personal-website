import type { Sport } from './types'

export const sports: Sport[] = [
  {
    id: 'tennis',
    name: 'Tennis',
    level: 'Advanced',
    rating: 0.9,
    line: 'it’s the reason this whole page is a tennis match lol',
    howToPlay: 'Hold to charge, release inside the green zone to serve an ace.',
  },
  {
    id: 'padel',
    name: 'Padel',
    level: 'High bronze',
    rating: 0.62,
    line: 'still trying to get better, and getting used to the glass hehe',
    howToPlay: 'Click anywhere to smash the ball. Chain bounces off the glass.',
  },
  {
    id: 'ping-pong',
    name: 'Ping pong',
    level: 'Intermediate',
    rating: 0.5,
    line: 'pops always plays this, and eventually, I was influenced to love it too',
    howToPlay:
      'Move your pointer (or ← →) to control the paddle. Angle it with the paddle edge: off the side before it bounces is out, after the bounce it’s a winner. First to 5.',
  },
  {
    id: 'golf',
    name: 'Golf',
    level: 'Casual',
    rating: 0.28,
    line: 'not that good tbh but yea trying to improve',
    howToPlay: 'Drag back from the ball to aim and set power. Release to putt.',
  },
]
