import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { SOUND_STORAGE_KEY, SoundContext } from './SoundContext'
import { soundEngine, type SoundName } from './soundEngine'

// Sound is on unless this visitor muted it on an earlier visit.
const readInitialEnabled = (): boolean => {
  try {
    return localStorage.getItem(SOUND_STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

const persist = (enabled: boolean) => {
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'on' : 'off')
  } catch {
    // Storage can be unavailable (private mode); the choice still applies for this visit.
  }
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(readInitialEnabled)
  // A ref keeps `play` stable, so components can call it from animation loops without re-subscribing.
  const enabledRef = useRef(enabled)

  // Browsers keep audio locked until the visitor interacts, so the first tap or key press wakes
  // the engine; sounds that fire later from animation loops then play too.
  useEffect(() => {
    const unlock = () => {
      if (enabledRef.current) soundEngine.unlock()
    }
    const options = { capture: true, once: true } as const
    window.addEventListener('pointerdown', unlock, options)
    window.addEventListener('keydown', unlock, options)
    return () => {
      window.removeEventListener('pointerdown', unlock, options)
      window.removeEventListener('keydown', unlock, options)
    }
  }, [])

  const toggle = useCallback(() => {
    const next = !enabledRef.current
    enabledRef.current = next
    setEnabled(next)
    persist(next)
    if (next) soundEngine.play('tick')
  }, [])

  const play = useCallback((name: SoundName, intensity?: number) => {
    if (enabledRef.current) soundEngine.play(name, intensity)
  }, [])

  const value = useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play])

  return <SoundContext value={value}>{children}</SoundContext>
}
