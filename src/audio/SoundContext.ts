import { createContext } from 'react'
import type { SoundName } from './soundEngine'

export interface SoundContextValue {
  enabled: boolean
  toggle: () => void
  /** Plays a sound if the visitor has switched sound on; otherwise a no-op. */
  play: (name: SoundName, intensity?: number) => void
}

export const SoundContext = createContext<SoundContextValue | null>(null)
