import { PersonaSwitcher } from '@/features/personas/PersonaSwitcher'
import { useChatStore } from '@/stores/chat'

export function LeftRail() {
  const reset = useChatStore((s) => s.reset)
  const messageCount = useChatStore((s) => s.messages.length)

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface-1 md:flex">
      <div className="border-b border-line px-4 py-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-ink-subtle">Persona</p>
        <div className="mt-2">
          <PersonaSwitcher />
        </div>
      </div>

      <div className="flex items-center justify-between px-4 pt-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-ink-subtle">
          Conversations
        </p>
        <button
          type="button"
          onClick={reset}
          disabled={messageCount === 0}
          className="rounded-md px-2 py-0.5 text-[11px] font-medium text-accent hover:bg-accent-soft disabled:opacity-40"
        >
          New
        </button>
      </div>

      <div className="px-4 pb-4 pt-2 text-xs text-ink-muted">
        {messageCount === 0 ? (
          <p className="rounded-md border border-dashed border-line px-3 py-3 text-center text-[11px] text-ink-subtle">
            Your conversations stay on this device.
          </p>
        ) : (
          <div className="rounded-md bg-surface-2 px-3 py-2">
            <p className="text-[11px] font-medium text-ink">Current session</p>
            <p className="text-[10px] text-ink-subtle">{messageCount} messages</p>
          </div>
        )}
      </div>

      <div className="mt-auto border-t border-line px-4 py-3 text-[11px] text-ink-subtle">
        Multi-session memory arrives in Phase 3.
      </div>
    </aside>
  )
}
