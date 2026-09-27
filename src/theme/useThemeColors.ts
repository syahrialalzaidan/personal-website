import { useMemo } from 'react'
import { useTheme } from './useTheme'

/**
 * Resolves CSS custom properties to concrete colors for canvas drawing.
 * Re-resolves whenever the session (day / night) changes. Pass a module-level constant.
 */
export function useThemeColors<const K extends string>(tokens: readonly K[]): Record<K, string> {
  const { theme } = useTheme()
  return useMemo(() => resolve(tokens, theme), [tokens, theme])
}

function resolve<K extends string>(tokens: readonly K[], _theme: string): Record<K, string> {
  const style = getComputedStyle(document.documentElement)
  const entries = tokens.map((token) => [token, style.getPropertyValue(`--${token}`).trim()])
  return Object.fromEntries(entries) as Record<K, string>
}
