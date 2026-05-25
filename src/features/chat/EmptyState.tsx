import { SparkleIcon } from '@/components/icons'
import { useChatStore } from '@/stores/chat'

const SUGGESTIONS = [
  'Research the Vite ecosystem',
  'Search the web for React 19',
  'Summarize https://example.com/post',
  'What can you do?',
]

export function EmptyState() {
  const send = useChatStore((s) => s.send)

  return (
    <div className="flex h-full items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/30 bg-accent-soft text-accent">
          <SparkleIcon size={22} />
        </div>
        <h2 className="text-2xl font-semibold text-ink-strong">Welcome to Atrium</h2>
        <p className="mt-2 text-sm text-ink-muted">
          A privacy-first AI assistant workspace. Streaming chat, memory inspection, tool traces,
          personas, voice. Phase 2 wires the Research Analyst persona end to end against the mock
          layer, with the tool trace timeline at the bottom and the memory inspector on the right.
        </p>
        <div className="mx-auto mt-6 grid max-w-xl gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => void send(prompt)}
              className="rounded-lg border border-line bg-surface-0 px-3 py-2 text-left text-sm text-ink hover:border-accent hover:bg-surface-1"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
