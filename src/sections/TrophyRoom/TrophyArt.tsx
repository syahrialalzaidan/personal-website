import { useId } from 'react'
import type { Trophy } from '../../content/types'

const METALS: Record<Trophy['metal'], [string, string, string, string]> = {
  gold: ['#fff6c4', '#f4c55b', '#c28b22', '#6d4a0c'],
  silver: ['#ffffff', '#d7deea', '#8c98ad', '#3f4959'],
  bronze: ['#ffe0c2', '#d9925e', '#9a5829', '#4d2810'],
}

interface TrophyArtProps {
  shape: Trophy['shape']
  metal: Trophy['metal']
  className?: string
}

/** Hand-built trophy silhouettes with a brushed-metal gradient. */
export function TrophyArt({ shape, metal, className }: TrophyArtProps) {
  const id = useId()
  const [light, mid, deep, dark] = METALS[metal]
  const body = `url(#${id}-body)`
  const edge = `url(#${id}-edge)`

  return (
    <svg viewBox="0 0 200 260" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={deep} />
          <stop offset="0.28" stopColor={light} />
          <stop offset="0.5" stopColor={mid} />
          <stop offset="0.78" stopColor={deep} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
        <radialGradient id={`${id}-plate`} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor={light} />
          <stop offset="0.55" stopColor={mid} />
          <stop offset="1" stopColor={dark} />
        </radialGradient>
      </defs>

      {/* Plinth, shared by every trophy */}
      <rect x="52" y="226" width="96" height="30" rx="4" fill="#1b1d24" />
      <rect x="52" y="226" width="96" height="5" rx="2" fill="#ffffff" opacity="0.12" />
      <rect x="70" y="236" width="60" height="12" rx="2" fill={edge} opacity="0.85" />

      {shape === 'cup' && (
        <g>
          <path d="M84 226 L90 196 H110 L116 226 Z" fill={body} />
          <rect x="92" y="170" width="16" height="28" fill={body} />
          <path d="M56 58 H144 C144 118 128 158 100 170 C72 158 56 118 56 58 Z" fill={body} />
          <path
            d="M56 70 C28 70 28 118 66 128"
            fill="none"
            stroke={edge}
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M144 70 C172 70 172 118 134 128"
            fill="none"
            stroke={edge}
            strokeWidth="9"
            strokeLinecap="round"
          />
          <ellipse cx="100" cy="58" rx="44" ry="9" fill={deep} />
          <path d="M70 40 H130 L124 54 H76 Z" fill={body} />
          <circle cx="100" cy="30" r="10" fill={edge} />
          <path
            d="M70 80 C74 118 84 140 100 150"
            fill="none"
            stroke="#fff"
            strokeOpacity="0.45"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
      )}

      {shape === 'plate' && (
        <g>
          <path d="M88 226 L92 206 H108 L112 226 Z" fill={body} />
          <circle cx="100" cy="116" r="92" fill={`url(#${id}-plate)`} />
          <circle
            cx="100"
            cy="116"
            r="80"
            fill="none"
            stroke={light}
            strokeOpacity="0.6"
            strokeWidth="3"
          />
          <circle cx="100" cy="116" r="56" fill={body} opacity="0.7" />
          <circle
            cx="100"
            cy="116"
            r="56"
            fill="none"
            stroke={dark}
            strokeOpacity="0.35"
            strokeWidth="2"
          />
          <g fill="none" stroke={light} strokeOpacity="0.5" strokeWidth="2">
            {Array.from({ length: 12 }, (_, index) => {
              const angle = (index / 12) * Math.PI * 2
              return (
                <line
                  key={index}
                  x1={100 + Math.cos(angle) * 60}
                  y1={116 + Math.sin(angle) * 60}
                  x2={100 + Math.cos(angle) * 76}
                  y2={116 + Math.sin(angle) * 76}
                />
              )
            })}
          </g>
          <text
            x="100"
            y="128"
            textAnchor="middle"
            fontFamily="var(--font-display)"
            fontWeight="900"
            fontSize="38"
            fill={dark}
            opacity="0.6"
          >
            2ND
          </text>
        </g>
      )}

      {shape === 'bowl' && (
        <g>
          <path d="M78 226 L90 186 H110 L122 226 Z" fill={body} />
          <rect x="94" y="150" width="12" height="38" fill={body} />
          <path d="M34 92 H166 C160 134 134 156 100 158 C66 156 40 134 34 92 Z" fill={body} />
          <ellipse cx="100" cy="92" rx="66" ry="14" fill={deep} />
          <ellipse cx="100" cy="90" rx="58" ry="9" fill={dark} opacity="0.6" />
          <path
            d="M48 104 C58 132 76 146 96 150"
            fill="none"
            stroke="#fff"
            strokeOpacity="0.4"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
      )}

      {shape === 'star' && (
        <g>
          <path d="M80 226 L86 150 H114 L120 226 Z" fill={body} />
          <rect x="78" y="142" width="44" height="10" rx="3" fill={edge} />
          <path
            d="M100 18 L119 64 L168 68 L131 100 L142 148 L100 122 L58 148 L69 100 L32 68 L81 64 Z"
            fill={body}
            stroke={edge}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M100 38 L112 68 L100 110 Z" fill="#fff" opacity="0.35" />
        </g>
      )}
    </svg>
  )
}
