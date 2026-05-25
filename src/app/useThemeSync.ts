import { useEffect } from 'react'
import { applyTheme, resolveTheme, useThemeStore } from '@/stores/theme'

export function useThemeSync(): void {
  const preference = useThemeStore((s) => s.preference)

  useEffect(() => {
    applyTheme(resolveTheme(preference))
  }, [preference])

  useEffect(() => {
    if (preference !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme(resolveTheme('system'))
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [preference])
}
