import type { ExternalLink, SectionMeta } from './types'

export const profile = {
  fullName: 'Mochamad Syahrial Alzaidan',
  /** Painted on the stadium wall in the hero. */
  greeting: 'hi, i’m iyal',
  /** What people call me; used on the scoreboards and broadcast graphics. */
  nickname: 'iyal',
  city: 'Jakarta',
  headline: 'Software Engineer at GoTo',
  email: 'syahrialalzaidan@gmail.com',
} as const

export const socialLinks: ExternalLink[] = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/mochamadsyahrialalzaidan' },
  { label: 'GitHub', href: 'https://github.com/syahrialalzaidan' },
]

export const sections: SectionMeta[] = [
  { id: 'center-court', label: 'Center court', point: 'LOVE' },
  { id: 'tour', label: 'The tour', point: '15' },
  { id: 'player', label: 'Player profile', point: '30' },
  { id: 'hawk-eye', label: 'Hawk-Eye', point: '40' },
  { id: 'trophy-room', label: 'Trophy room', point: 'DEUCE' },
  { id: 'off-court', label: 'Off court', point: 'AD' },
  { id: 'match-point', label: 'Match point', point: 'MATCH PT' },
]
