import { createContext } from 'react'

export type Theme = 'day' | 'night'

export interface ThemeContextValue {
  theme: Theme
  /** Switches session. `origin` is where the new theme spreads from, in viewport px. */
  toggleTheme: (origin?: { x: number; y: number }) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export const THEME_STORAGE_KEY = 'court-theme'
