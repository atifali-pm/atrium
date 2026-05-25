import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { SendIcon, StopIcon } from '@/components/icons'
import { useChatStore } from '@/stores/chat'

export function Composer() {
  const [draft, setDraft] = useState('')
  const send = useChatStore((s) => s.send)
  const cancel = useChatStore((s) => s.cancel)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const node = textareaRef.current
    if (!node) return
    node.style.height = 'auto'
    node.style.height = `${Math.min(node.scrollHeight, 200)}px`
  }, [draft])

  const submit = () => {
    const value = draft.trim()
    if (value.length === 0 || isStreaming) return
    setDraft('')
    void send(value)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="mx-auto w-full max-w-3xl px-4 pb-4 pt-2"
    >
      <div className="flex items-end gap-2 rounded-2xl border border-line bg-surface-1 px-3 py-2 shadow-sm focus-within:border-accent">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={isStreaming ? 'Streaming response...' : 'Send a message. Shift+Enter for newline.'}
          aria-label="Message"
          disabled={isStreaming}
          className="scrollbar-thin max-h-[200px] flex-1 resize-none bg-transparent text-sm text-ink placeholder:text-ink-subtle focus:outline-none disabled:opacity-60"
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={cancel}
            aria-label="Stop streaming"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-danger text-white hover:opacity-90"
          >
            <StopIcon size={14} />
          </button>
        ) : (
          <button
            type="submit"
            aria-label="Send message"
            disabled={draft.trim().length === 0}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-ink transition-opacity duration-fast hover:bg-accent-strong disabled:opacity-40"
          >
            <SendIcon size={16} />
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-[11px] text-ink-subtle">
        Atrium is a Phase 2 mock. Tool calls and memory writes come from a deterministic local fixture set.
      </p>
    </form>
  )
}
