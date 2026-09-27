import { useContext } from 'react'
import { SoundContext, type SoundContextValue } from './SoundContext'

export function useSound(): SoundContextValue {
  const context = useContext(SoundContext)
  if (!context) throw new Error('useSound must be used inside <SoundProvider>')
  return context
}
