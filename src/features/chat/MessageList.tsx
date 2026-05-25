import { useEffect, useRef } from 'react'
import { useChatStore } from '@/stores/chat'
import { EmptyState } from './EmptyState'
import { MessageItem } from './MessageItem'

export function MessageList() {
  const messages = useChatStore((s) => s.messages)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastLengthRef = useRef(0)

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    const isNew = messages.length > lastLengthRef.current
    lastLengthRef.current = messages.length
    const lastMessage = messages[messages.length - 1]
    if (isNew || lastMessage?.status === 'streaming') {
      node.scrollTop = node.scrollHeight
    }
  }, [messages])

  if (messages.length === 0) {
    return <EmptyState />
  }

  return (
    <div ref={scrollRef} className="scrollbar-thin h-full overflow-y-auto">
      <ul className="mx-auto max-w-3xl divide-y divide-line-subtle">
        {messages.map((message, idx) => (
          <li key={message.id} className="group">
            <MessageItem message={message} isLast={idx === messages.length - 1} />
          </li>
        ))}
      </ul>
    </div>
  )
}
