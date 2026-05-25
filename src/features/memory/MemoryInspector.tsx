import { useMemoryStore, type MemoryFact } from '@/stores/memory'

function formatRelative(timestamp: number): string {
  const delta = Date.now() - timestamp
  if (delta < 30_000) return 'just now'
  if (delta < 60_000) return `${Math.floor(delta / 1000)}s ago`
  if (delta < 3_600_000) return `${Math.floor(delta / 60_000)}m ago`
  if (delta < 86_400_000) return `${Math.floor(delta / 3_600_000)}h ago`
  return `${Math.floor(delta / 86_400_000)}d ago`
}

function ConfidenceDot({ value }: { value: number }) {
  const filled = Math.round(value * 4)
  return (
    <span
      aria-label={`confidence ${Math.round(value * 100)} percent`}
      className="inline-flex items-center gap-[2px]"
    >
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={
            'inline-block h-1.5 w-1.5 rounded-full ' +
            (i < filled ? 'bg-accent' : 'bg-line')
          }
        />
      ))}
    </span>
  )
}

function FactRow({ fact }: { fact: MemoryFact }) {
  const forget = useMemoryStore((s) => s.forget)
  return (
    <li
      data-testid={`memory-fact-${fact.id}`}
      data-fact-key={fact.key}
      className="rounded-md border border-line bg-surface-0 p-3 transition-colors duration-fast hover:border-accent/40"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-subtle">
            {fact.key}
          </p>
          <p className="mt-0.5 break-words text-sm text-ink-strong">{fact.value}</p>
        </div>
        <ConfidenceDot value={fact.confidence} />
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-ink-subtle">
        <span>
          via {fact.provenance.fixtureId} | {formatRelative(fact.updatedAt)}
        </span>
        <button
          type="button"
          onClick={() => forget(fact.id)}
          aria-label={`Forget ${fact.key}`}
          className="rounded px-1.5 py-0.5 text-[10px] text-ink-muted hover:bg-danger-soft hover:text-danger"
        >
          Forget
        </button>
      </div>
    </li>
  )
}

export function MemoryInspector() {
  const facts = useMemoryStore((s) => s.facts)
  const reset = useMemoryStore((s) => s.reset)

  return (
    <aside
      data-testid="memory-inspector"
      className="hidden w-80 shrink-0 flex-col border-l border-line bg-surface-1 lg:flex"
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-ink-subtle">
            Memory inspector
          </p>
          <p className="mt-0.5 text-sm font-medium text-ink-strong">
            {facts.length === 0 ? 'No facts yet' : `${facts.length} fact${facts.length === 1 ? '' : 's'}`}
          </p>
        </div>
        {facts.length > 0 && (
          <button
            type="button"
            onClick={reset}
            className="rounded-md px-2 py-1 text-[11px] text-ink-muted hover:bg-danger-soft hover:text-danger"
          >
            Purge all
          </button>
        )}
      </div>

      <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto p-4 text-xs">
        {facts.length === 0 ? (
          <div className="rounded-md border border-dashed border-line p-4 text-center text-[11px] text-ink-subtle">
            Memory facts captured during a response will appear here. Each one is local to this
            device, with provenance and a forget control.
          </div>
        ) : (
          <ul className="space-y-2">
            {facts.map((fact) => (
              <FactRow key={fact.id} fact={fact} />
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-line px-4 py-3 text-[11px] text-ink-subtle">
        Facts are deterministic mock writes. Every entry shows the fixture that produced it.
      </div>
    </aside>
  )
}
