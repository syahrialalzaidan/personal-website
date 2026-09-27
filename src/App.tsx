import { AnimatePresence, MotionConfig, useReducedMotion } from 'motion/react'
import { ReactLenis } from 'lenis/react'
import { useCallback, useState, type ReactNode } from 'react'
import { SoundProvider } from './audio/SoundProvider'
import { Cursor } from './components/Cursor/Cursor'
import { Grain } from './components/Grain/Grain'
import { Scoreboard } from './components/Scoreboard/Scoreboard'
import { CenterCourt } from './sections/CenterCourt/CenterCourt'
import { HawkEye } from './sections/HawkEye/HawkEye'
import { MatchPoint } from './sections/MatchPoint/MatchPoint'
import { OffCourt } from './sections/OffCourt/OffCourt'
import { PlayerProfile } from './sections/PlayerProfile/PlayerProfile'
import { Tour } from './sections/Tour/Tour'
import { TrophyRoom } from './sections/TrophyRoom/TrophyRoom'
import { Walkout } from './sections/Walkout/Walkout'
import { ThemeProvider } from './theme/ThemeProvider'

export function App() {
  return (
    <ThemeProvider>
      <SoundProvider>
        <MotionConfig reducedMotion="user">
          <SmoothScroll>
            <Match />
          </SmoothScroll>
        </MotionConfig>
      </SoundProvider>
    </ThemeProvider>
  )
}

/** Lenis smooth scrolling, skipped entirely for visitors who prefer reduced motion. */
function SmoothScroll({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) return children
  return (
    <ReactLenis root options={{ lerp: 0.09, wheelMultiplier: 0.95 }}>
      {children}
    </ReactLenis>
  )
}

function Match() {
  const reduceMotion = useReducedMotion()
  const [introDone, setIntroDone] = useState(Boolean(reduceMotion))
  const finishIntro = useCallback(() => setIntroDone(true), [])

  return (
    <>
      <a className="sr-only" href="#tour">
        Skip to experience
      </a>
      <AnimatePresence>
        {!introDone && <Walkout key="walkout" onDone={finishIntro} />}
      </AnimatePresence>
      <Scoreboard />
      <main>
        <CenterCourt ready={introDone} />
        <Tour />
        <PlayerProfile />
        <HawkEye />
        <TrophyRoom />
        <OffCourt />
        <MatchPoint />
      </main>
      <Cursor />
      <Grain />
    </>
  )
}
