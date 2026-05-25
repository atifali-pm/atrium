import { useMemo, useState } from 'react'
import { useTracesStore, type ToolTrace, type TraceStatus } from '@/stores/traces'

type StatusFilter = 'all' | TraceStatus

function StatusBadge({ status }: { status: TraceStatus }) {
  const styles: Record<TraceStatus, string> = {
    running: 'bg-accent-soft text-accent',
    ok: 'bg-surface-2 text-ink',
    error: 'bg-danger-soft text-danger',
  }
  return (
    <span
      className={
        'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ' +
        styles[status]
      }
    >
      {status}
    </span>
  )
}

function LatencyPill({ trace, slowMs }: { trace: ToolTrace; slowMs: number }) {
  if (trace.status === 'running' || trace.latencyMs === undefined) {
    return <span className="text-[10px] text-ink-subtle">in flight</span>
  }
  const isSlow = trace.latencyMs >= slowMs
  return (
    <span
      className={
        'rounded-md px-1.5 py-0.5 text-[10px] tabular-nums ' +
        (isSlow ? 'bg-danger-soft text-danger' : 'bg-surface-2 text-ink-muted')
      }
    >
      {trace.latencyMs}ms{isSlow ? ' slow' : ''}
    </span>
  )
}

function TraceRow({ trace, isExpanded, onToggle, slowMs }: {
  trace: ToolTrace
  isExpanded: boolean
  onToggle: () => void
  slowMs: number
}) {
  return (
    <li
      data-testid={`trace-${trace.id}`}
      data-trace-name={trace.name}
      data-trace-status={trace.status}
      className="rounded-md border border-line bg-surface-0"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-mono text-xs text-ink-strong">{trace.name}</span>
          <StatusBadge status={trace.status} />
        </div>
        <LatencyPill trace={trace} slowMs={slowMs} />
      </button>
      {isExpanded && (
        <div className="border-t border-line bg-surface-1 px-3 py-2 text-[11px]">
          <div className="mb-2">
            <p className="mb-1 text-[10px] uppercase tracking-wider text-ink-subtle">Input</p>
            <pre className="scrollbar-thin max-h-32 overflow-auto rounded bg-surface-2 p-2 font-mono text-ink-strong">
              {JSON.stringify(trace.input, null, 2)}
            </pre>
          </div>
          {trace.output !== undefined && (
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-wider text-ink-subtle">Output</p>
              <pre className="scrollbar-thin max-h-40 overflow-auto rounded bg-surface-2 p-2 font-mono text-ink-strong">
                {typeof trace.output === 'string'
                  ? trace.output
                  : JSON.stringify(trace.output, null, 2)}
              </pre>
            </div>
          )}
          {trace.errorMessage && (
            <p className="mt-2 text-danger">Error: {trace.errorMessage}</p>
          )}
        </div>
      )}
    </li>
  )
}

const SLOW_MS = 1000

export function TraceDrawer() {
  const traces = useTracesStore((s) => s.traces)
  const clear = useTracesStore((s) => s.clear)
  const [expanded, setExpanded] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [showSlowOnly, setShowSlowOnly] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    return traces.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      if (showSlowOnly && (t.latencyMs ?? 0) < SLOW_MS) return false
      return true
    })
  }, [traces, statusFilter, showSlowOnly])

  if (traces.length === 0 && !expanded) {
    return (
      <div className="flex h-8 shrink-0 items-center justify-center border-t border-line bg-surface-1 text-[11px] text-ink-subtle">
        Tool trace timeline ready. Calls land here as a response runs.
      </div>
    )
  }

  const runningCount = traces.filter((t) => t.status === 'running').length
  const errorCount = traces.filter((t) => t.status === 'error').length

  return (
    <div
      data-testid="trace-drawer"
      data-expanded={expanded}
      className="flex shrink-0 flex-col border-t border-line bg-surface-1"
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={expanded ? 'Collapse trace timeline' : 'Expand trace timeline'}
        className="flex h-9 items-center justify-between border-b border-line px-4 text-xs text-ink hover:bg-surface-2"
      >
        <div className="flex items-center gap-3">
          <span className="font-medium text-ink-strong">Tool trace timeline</span>
          <span className="text-ink-muted">
            {traces.length} call{traces.length === 1 ? '' : 's'}
            {runningCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-accent">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                {runningCount} running
              </span>
            )}
            {errorCount > 0 && <span className="ml-2 text-danger">{errorCount} error</span>}
          </span>
        </div>
        <span className="text-[10px] text-ink-subtle">{expanded ? 'collapse' : 'expand'}</span>
      </button>

      {expanded && (
        <div className="max-h-[40vh] overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line px-4 py-2 text-[11px]">
            <span className="text-ink-subtle">Filter:</span>
            {(['all', 'running', 'ok', 'error'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={
                  'rounded-md px-2 py-0.5 transition-colors duration-fast ' +
                  (statusFilter === s
                    ? 'bg-accent text-accent-ink'
                    : 'bg-surface-0 text-ink-muted hover:text-ink')
                }
              >
                {s}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowSlowOnly((v) => !v)}
              className={
                'ml-2 rounded-md px-2 py-0.5 transition-colors duration-fast ' +
                (showSlowOnly
                  ? 'bg-accent text-accent-ink'
                  : 'bg-surface-0 text-ink-muted hover:text-ink')
              }
            >
              {`Slow only (>=${SLOW_MS}ms)`}
            </button>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-ink-subtle">{filtered.length} shown</span>
              <button
                type="button"
                onClick={clear}
                className="rounded-md px-2 py-0.5 text-ink-muted hover:bg-danger-soft hover:text-danger"
              >
                Clear
              </button>
            </div>
          </div>
          <ul className="scrollbar-thin space-y-1.5 overflow-y-auto px-4 py-2">
            {filtered.length === 0 ? (
              <li className="rounded-md border border-dashed border-line p-3 text-center text-[11px] text-ink-subtle">
                No traces match the current filter.
              </li>
            ) : (
              filtered.map((trace) => (
                <TraceRow
                  key={trace.id}
                  trace={trace}
                  slowMs={SLOW_MS}
                  isExpanded={expandedIds.has(trace.id)}
                  onToggle={() =>
                    setExpandedIds((prev) => {
                      const next = new Set(prev)
                      if (next.has(trace.id)) next.delete(trace.id)
                      else next.add(trace.id)
                      return next
                    })
                  }
                />
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
