import { useState } from 'react'
import { CheckIcon, CopyIcon, EditIcon, RefreshIcon, SparkleIcon, UserIcon } from '@/components/icons'
import type { Message } from '@/stores/chat'
import { useChatStore } from '@/stores/chat'
import { MessageMarkdown } from './MessageMarkdown'

interface MessageItemProps {
  message: Message
  isLast: boolean
}

export function MessageItem({ message, isLast }: MessageItemProps) {
  const isUser = message.role === 'user'
  const retry = useChatStore((s) => s.retry)
  const editAndResend = useChatStore((s) => s.editAndResend)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(message.content)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      data-testid={`message-${message.role}`}
      data-status={message.status}
      className={'flex gap-3 px-4 py-5 ' + (isUser ? 'bg-surface-0' : 'bg-surface-1/60')}
    >
      <div
        aria-hidden
        className={
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ' +
          (isUser
            ? 'border-line bg-surface-2 text-ink'
            : 'border-accent/30 bg-accent-soft text-accent')
        }
      >
        {isUser ? <UserIcon size={16} /> : <SparkleIcon size={16} />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2 text-xs text-ink-muted">
          <span className="font-medium text-ink-strong">{isUser ? 'You' : 'Atrium'}</span>
          {message.status === 'streaming' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              streaming
            </span>
          )}
          {message.status === 'cancelled' && (
            <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink-muted">
              cancelled
            </span>
          )}
          {message.status === 'error' && (
            <span className="rounded-full bg-danger-soft px-2 py-0.5 text-[10px] uppercase tracking-wider text-danger">
              error
            </span>
          )}
        </div>

        <div className="text-[0.95rem] text-ink">
          {editing ? (
            <div className="space-y-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={Math.min(8, Math.max(2, draft.split('\n').length))}
                className="w-full rounded-md border border-line bg-surface-0 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    void editAndResend(message.id, draft)
                  }}
                  className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-accent-ink hover:bg-accent-strong"
                >
                  Save and resend
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setDraft(message.content)
                  }}
                  className="rounded-md border border-line px-3 py-1 text-xs text-ink-muted hover:text-ink"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <>
              <MessageMarkdown content={message.content} />
              {message.status === 'streaming' && (
                <span
                  aria-hidden
                  className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-accent align-text-bottom"
                />
              )}
              {message.status === 'error' && message.errorMessage && (
                <p className="mt-1 text-xs text-danger">{message.errorMessage}</p>
              )}
            </>
          )}
        </div>

        {!editing && (
          <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity duration-fast group-hover:opacity-100 [@media(hover:none)]:opacity-100">
            {!isUser && message.status !== 'streaming' && (
              <button
                type="button"
                onClick={handleCopy}
                aria-label={copied ? 'Copied' : 'Copy message'}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-ink-muted hover:bg-surface-2 hover:text-ink"
              >
                {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
            {!isUser && isLast && !isStreaming && (
              <button
                type="button"
                onClick={() => void retry()}
                aria-label="Retry"
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-ink-muted hover:bg-surface-2 hover:text-ink"
              >
                <RefreshIcon size={12} />
                Retry
              </button>
            )}
            {isUser && !isStreaming && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                aria-label="Edit and resend"
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-ink-muted hover:bg-surface-2 hover:text-ink"
              >
                <EditIcon size={12} />
                Edit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
