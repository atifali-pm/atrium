import { useEffect, useRef, useState } from 'react'
import { SparkleIcon } from '@/components/icons'
import { personas } from '@/features/personas/registry'
import { usePersonaStore } from '@/stores/persona'

export function PersonaSwitcher() {
  const activeId = usePersonaStore((s) => s.activeId)
  const setActive = usePersonaStore((s) => s.setActive)
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const active = personas.find((p) => p.id === activeId) ?? personas[0]

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!active) return null

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        data-testid="persona-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-md border border-line bg-surface-0 px-2 py-1.5 text-left hover:border-accent/40"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-soft text-accent">
          <SparkleIcon size={12} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-ink-strong">{active.name}</p>
          <p className="truncate text-[10px] text-ink-subtle">{active.blurb}</p>
        </div>
        <span aria-hidden className="text-[10px] text-ink-muted">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div
          role="menu"
          data-testid="persona-menu"
          className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-line bg-surface-0 shadow-md"
        >
          {personas.map((persona) => {
            const isActive = persona.id === activeId
            return (
              <button
                key={persona.id}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                disabled={!persona.available}
                onClick={() => {
                  setActive(persona.id)
                  setOpen(false)
                }}
                className={
                  'flex w-full items-start gap-2 px-2 py-2 text-left transition-colors duration-fast ' +
                  (isActive ? 'bg-accent-soft' : 'hover:bg-surface-1') +
                  ' disabled:cursor-not-allowed disabled:opacity-60'
                }
              >
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-md bg-accent-soft text-accent">
                  <SparkleIcon size={10} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-medium text-ink-strong">{persona.name}</p>
                    {!persona.available && persona.availabilityNote && (
                      <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-ink-muted">
                        {persona.availabilityNote}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[10px] text-ink-subtle">{persona.blurb}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
