import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { SoundContext } from './SoundContext'
import { soundEngine, type SoundName } from './soundEngine'

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false)
  // A ref keeps `play` stable, so components can call it from animation loops without re-subscribing.
  const enabledRef = useRef(enabled)

  const toggle = useCallback(() => {
    const next = !enabledRef.current
    enabledRef.current = next
    setEnabled(next)
    if (next) soundEngine.play('tick')
  }, [])

  const play = useCallback((name: SoundName, intensity?: number) => {
    if (enabledRef.current) soundEngine.play(name, intensity)
  }, [])

  const value = useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play])

  return <SoundContext value={value}>{children}</SoundContext>
}
