interface RightPanelProps {
  open: boolean
}

export function RightPanel({ open }: RightPanelProps) {
  if (!open) return null

  return (
    <aside className="hidden w-80 shrink-0 flex-col border-l border-line bg-surface-1 lg:flex">
      <div className="border-b border-line px-4 py-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-ink-subtle">
          Memory inspector
        </p>
        <p className="mt-1 text-sm font-medium text-ink-strong">Phase 2 surface</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4 text-xs text-ink-muted">
        <p>
          This panel will show what the assistant remembers per session and across sessions, with
          per-fact provenance and a one-click forget control.
        </p>
        <div className="rounded-md border border-dashed border-line bg-surface-0 p-3 text-[11px] text-ink-subtle">
          Placeholder content. Coming in Phase 2.
        </div>
      </div>
    </aside>
  )
}
