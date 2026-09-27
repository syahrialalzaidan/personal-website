import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { THEME_STORAGE_KEY, ThemeContext, type Theme, type ThemeContextValue } from './ThemeContext'

const readInitialTheme = (): Theme =>
  document.documentElement.dataset.theme === 'day' ? 'day' : 'night'

const persist = (theme: Theme) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage can be unavailable (private mode); the theme still applies for this visit.
  }
}

const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'day' ? '#f4ecdf' : '#060d1a')
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme)

  const toggleTheme = useCallback<ThemeContextValue['toggleTheme']>(
    (origin) => {
      const next: Theme = theme === 'day' ? 'night' : 'day'
      const commit = () => {
        // The attribute goes first so anything reading computed tokens during render sees the new session.
        applyTheme(next)
        flushSync(() => setTheme(next))
        persist(next)
      }

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!document.startViewTransition || reduceMotion) {
        commit()
        return
      }

      const x = origin?.x ?? window.innerWidth - 40
      const y = origin?.y ?? 40
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      )

      const transition = document.startViewTransition(commit)
      transition.ready
        .then(() => {
          document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            {
              duration: 900,
              easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
              pseudoElement: '::view-transition-new(root)',
            },
          )
        })
        .catch(() => {
          // The transition was skipped (e.g. tab hidden); the theme is already committed.
        })
    },
    [theme],
  )

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext value={value}>{children}</ThemeContext>
}
