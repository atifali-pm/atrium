import { ThemeToggle } from '@/components/ThemeToggle'
import { PanelIcon, SparkleIcon } from '@/components/icons'

interface TopBarProps {
  rightPanelOpen: boolean
  onToggleRightPanel: () => void
}

export function TopBar({ rightPanelOpen, onToggleRightPanel }: TopBarProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-line bg-surface-0 px-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-ink">
          <SparkleIcon size={14} />
        </div>
        <span className="text-sm font-semibold tracking-tight text-ink-strong">Atrium</span>
        <span className="ml-1 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-muted">
          Phase 1
        </span>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button
          type="button"
          onClick={onToggleRightPanel}
          aria-label={rightPanelOpen ? 'Hide side panel' : 'Show side panel'}
          aria-pressed={rightPanelOpen}
          className={
            'inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-fast ' +
            (rightPanelOpen
              ? 'border-accent bg-accent-soft text-accent'
              : 'border-line bg-surface-1 text-ink-muted hover:text-ink')
          }
        >
          <PanelIcon size={14} />
        </button>
      </div>
    </header>
  )
}
