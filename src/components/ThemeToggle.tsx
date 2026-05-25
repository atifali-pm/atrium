import { useThemeStore, type ThemePreference } from '@/stores/theme'
import { MonitorIcon, MoonIcon, SunIcon } from './icons'

const options: Array<{ value: ThemePreference; label: string; Icon: typeof SunIcon }> = [
  { value: 'light', label: 'Light theme', Icon: SunIcon },
  { value: 'dark', label: 'Dark theme', Icon: MoonIcon },
  { value: 'system', label: 'System theme', Icon: MonitorIcon },
]

export function ThemeToggle() {
  const preference = useThemeStore((s) => s.preference)
  const setPreference = useThemeStore((s) => s.setPreference)

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-center rounded-full border border-line bg-surface-1 p-0.5"
    >
      {options.map(({ value, label, Icon }) => {
        const active = preference === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setPreference(value)}
            className={
              'inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-fast ease-atrium ' +
              (active
                ? 'bg-surface-0 text-ink-strong shadow-sm'
                : 'text-ink-muted hover:text-ink')
            }
          >
            <Icon size={14} />
          </button>
        )
      })}
    </div>
  )
}
