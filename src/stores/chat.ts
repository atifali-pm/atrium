import { create } from 'zustand'
import { streamResponse, type StreamOptions } from '@/lib/sse-simulator'

export type MessageRole = 'user' | 'assistant'
export type MessageStatus = 'idle' | 'streaming' | 'done' | 'cancelled' | 'error'

export interface Message {
  id: string
  role: MessageRole
  content: string
  status: MessageStatus
  createdAt: number
  errorMessage?: string
  fixtureId?: string
}

interface ChatState {
  messages: Message[]
  isStreaming: boolean
  send: (prompt: string, opts?: StreamOptions) => Promise<void>
  cancel: () => void
  retry: (opts?: StreamOptions) => Promise<void>
  editAndResend: (userMessageId: string, nextContent: string, opts?: StreamOptions) => Promise<void>
  reset: () => void
}

let activeController: AbortController | null = null

function nextId(prefix: string): string {
  const cryptoRef = typeof crypto !== 'undefined' ? crypto : undefined
  if (cryptoRef?.randomUUID) return `${prefix}-${cryptoRef.randomUUID()}`
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

interface StreamRunOptions {
  prompt: string
  assistantId: string
  stream?: StreamOptions
}

async function runStream(
  set: (updater: (state: ChatState) => Partial<ChatState>) => void,
  get: () => ChatState,
  { prompt, assistantId, stream }: StreamRunOptions,
): Promise<void> {
  const controller = new AbortController()
  activeController = controller
  set(() => ({ isStreaming: true }))

  const streamOptions: StreamOptions = { ...(stream ?? {}), signal: controller.signal }
  const events = streamResponse(prompt, streamOptions)

  try {
    for await (const event of events) {
      if (event.type === 'token') {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + event.token } : m,
          ),
        }))
      } else if (event.type === 'done') {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === assistantId ? { ...m, status: 'done', fixtureId: event.fixtureId } : m,
          ),
        }))
      } else if (event.type === 'error') {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === assistantId
              ? { ...m, status: 'error', errorMessage: event.message }
              : m,
          ),
        }))
      }
    }
    if (controller.signal.aborted) {
      const current = get().messages.find((m) => m.id === assistantId)
      if (current && current.status === 'streaming') {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === assistantId ? { ...m, status: 'cancelled' } : m,
          ),
        }))
      }
    }
  } finally {
    if (activeController === controller) {
      activeController = null
    }
    set(() => ({ isStreaming: false }))
  }
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,

  send: async (prompt, opts) => {
    const trimmed = prompt.trim()
    if (trimmed.length === 0 || get().isStreaming) return

    const userMessage: Message = {
      id: nextId('user'),
      role: 'user',
      content: trimmed,
      status: 'done',
      createdAt: Date.now(),
    }
    const assistantMessage: Message = {
      id: nextId('asst'),
      role: 'assistant',
      content: '',
      status: 'streaming',
      createdAt: Date.now() + 1,
    }
    set((state) => ({ messages: [...state.messages, userMessage, assistantMessage] }))
    await runStream(set, get, { prompt: trimmed, assistantId: assistantMessage.id, stream: opts })
  },

  cancel: () => {
    activeController?.abort()
  },

  retry: async (opts) => {
    if (get().isStreaming) return
    const msgs = get().messages
    let lastUserIdx = -1
    for (let i = msgs.length - 1; i >= 0; i -= 1) {
      if (msgs[i]?.role === 'user') {
        lastUserIdx = i
        break
      }
    }
    if (lastUserIdx === -1) return
    const lastUser = msgs[lastUserIdx]
    if (!lastUser) return

    const trimmedMsgs = msgs.slice(0, lastUserIdx + 1)
    const assistantMessage: Message = {
      id: nextId('asst'),
      role: 'assistant',
      content: '',
      status: 'streaming',
      createdAt: Date.now(),
    }
    set(() => ({ messages: [...trimmedMsgs, assistantMessage] }))
    await runStream(set, get, { prompt: lastUser.content, assistantId: assistantMessage.id, stream: opts })
  },

  editAndResend: async (userMessageId, nextContent, opts) => {
    if (get().isStreaming) return
    const trimmed = nextContent.trim()
    if (trimmed.length === 0) return
    const msgs = get().messages
    const idx = msgs.findIndex((m) => m.id === userMessageId && m.role === 'user')
    if (idx === -1) return

    const truncated = msgs.slice(0, idx)
    const editedUser: Message = {
      ...(msgs[idx] as Message),
      content: trimmed,
      createdAt: Date.now(),
    }
    const assistantMessage: Message = {
      id: nextId('asst'),
      role: 'assistant',
      content: '',
      status: 'streaming',
      createdAt: Date.now() + 1,
    }
    set(() => ({ messages: [...truncated, editedUser, assistantMessage] }))
    await runStream(set, get, { prompt: trimmed, assistantId: assistantMessage.id, stream: opts })
  },

  reset: () => {
    activeController?.abort()
    activeController = null
    set(() => ({ messages: [], isStreaming: false }))
  },
}))

export const chatTestUtils = {
  getActiveController: () => activeController,
}
