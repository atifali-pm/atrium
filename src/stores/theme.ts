import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeState {
  preference: ThemePreference
  setPreference: (next: ThemePreference) => void
  cycle: () => void
}

const STORAGE_KEY = 'atrium:theme'

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      preference: 'system',
      setPreference: (next) => set({ preference: next }),
      cycle: () => {
        const order: ThemePreference[] = ['light', 'dark', 'system']
        const idx = order.indexOf(get().preference)
        const nextIdx = (idx + 1) % order.length
        set({ preference: order[nextIdx] ?? 'system' })
      },
    }),
    { name: STORAGE_KEY },
  ),
)

export function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref !== 'system') return pref
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme: ResolvedTheme): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.dataset.theme = theme
}
