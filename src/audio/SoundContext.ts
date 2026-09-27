import { createContext } from 'react'
import type { SoundName } from './soundEngine'

export interface SoundContextValue {
  enabled: boolean
  toggle: () => void
  /** Plays a sound unless the visitor has muted; otherwise a no-op. */
  play: (name: SoundName, intensity?: number) => void
}

/** Remembers a visitor's mute choice between visits. */
export const SOUND_STORAGE_KEY = 'court-sound'

export const SoundContext = createContext<SoundContextValue | null>(null)
