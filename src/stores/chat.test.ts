import { describe, it, expect, beforeEach } from 'vitest'
import { useChatStore } from './chat'
import { useMemoryStore } from './memory'
import { useTracesStore } from './traces'

const fastStream = { delayMs: 0, jitterMs: 0, toolLatencyScale: 0 }

describe('useChatStore', () => {
  beforeEach(() => {
    useChatStore.getState().reset()
  })

  it('starts empty and not streaming, no facts, no traces', () => {
    const state = useChatStore.getState()
    expect(state.messages).toHaveLength(0)
    expect(state.isStreaming).toBe(false)
    expect(useMemoryStore.getState().facts).toHaveLength(0)
    expect(useTracesStore.getState().traces).toHaveLength(0)
  })

  it('send creates user + assistant messages and writes a memory fact for the greeting fixture', async () => {
    await useChatStore.getState().send('hello', fastStream)

    const messages = useChatStore.getState().messages
    expect(messages).toHaveLength(2)
    const asst = messages[1]
    expect(asst?.role).toBe('assistant')
    expect(asst?.status).toBe('done')
    expect(asst?.fixtureId).toBe('ra-greeting')
    expect(asst?.personaId).toBe('research-analyst')

    const facts = useMemoryStore.getState().facts
    expect(facts).toHaveLength(1)
    expect(facts[0]?.key).toBe('session.persona')
    expect(facts[0]?.value).toBe('research-analyst')
    expect(facts[0]?.provenance.messageId).toBe(asst?.id)
    expect(facts[0]?.provenance.fixtureId).toBe('ra-greeting')

    expect(useTracesStore.getState().traces).toHaveLength(0)
  })

  it('send routing a research prompt records a completed trace and a memory fact', async () => {
    await useChatStore.getState().send('research the vite ecosystem', fastStream)

    const traces = useTracesStore.getState().traces
    expect(traces).toHaveLength(1)
    expect(traces[0]?.name).toBe('search_web')
    expect(traces[0]?.status).toBe('ok')
    expect(traces[0]?.latencyMs).toBeGreaterThan(0)
    expect(traces[0]?.input.query).toBe('the vite ecosystem')

    const facts = useMemoryStore.getState().facts
    expect(facts).toHaveLength(1)
    expect(facts[0]?.key).toBe('research.last_topic')
    expect(facts[0]?.value).toBe('the vite ecosystem')
  })

  it('send routing a summarize prompt records two tool traces in order', async () => {
    await useChatStore.getState().send('summarize https://example.com/x', fastStream)
    const traces = useTracesStore.getState().traces
    expect(traces).toHaveLength(2)
    expect(traces.map((t) => t.name)).toEqual(['fetch_url', 'summarize'])
    expect(traces.every((t) => t.status === 'ok')).toBe(true)
  })

  it('cancel during streaming marks the assistant message as cancelled', async () => {
    const inFlight = useChatStore.getState().send('hello', { delayMs: 5, jitterMs: 0, toolLatencyScale: 0 })
    await new Promise((r) => setTimeout(r, 12))
    useChatStore.getState().cancel()
    await inFlight

    const last = useChatStore.getState().messages.at(-1)
    expect(last?.role).toBe('assistant')
    expect(last?.status).toBe('cancelled')
    expect(useChatStore.getState().isStreaming).toBe(false)
  })

  it('retry replaces the last assistant message with a fresh run', async () => {
    await useChatStore.getState().send('hello', fastStream)
    const firstAsstId = useChatStore.getState().messages[1]?.id
    await useChatStore.getState().retry(fastStream)
    const messages = useChatStore.getState().messages
    expect(messages).toHaveLength(2)
    expect(messages[1]?.id).not.toBe(firstAsstId)
    expect(messages[1]?.status).toBe('done')
  })

  it('editAndResend rewrites the user message and re-streams', async () => {
    await useChatStore.getState().send('hello', fastStream)
    const userId = useChatStore.getState().messages[0]?.id as string
    await useChatStore.getState().editAndResend(userId, 'research react 19', fastStream)

    const messages = useChatStore.getState().messages
    expect(messages).toHaveLength(2)
    expect(messages[0]?.content).toBe('research react 19')
    expect(messages[1]?.fixtureId).toBe('ra-research')
  })

  it('reset clears messages, memory, and traces and aborts any in-flight stream', async () => {
    await useChatStore.getState().send('research vite', fastStream)
    expect(useMemoryStore.getState().facts.length).toBeGreaterThan(0)
    expect(useTracesStore.getState().traces.length).toBeGreaterThan(0)

    useChatStore.getState().reset()
    expect(useChatStore.getState().messages).toHaveLength(0)
    expect(useMemoryStore.getState().facts).toHaveLength(0)
    expect(useTracesStore.getState().traces).toHaveLength(0)
  })

  it('does not start a new send while already streaming', async () => {
    const first = useChatStore.getState().send('hello', { delayMs: 4, jitterMs: 0, toolLatencyScale: 0 })
    await new Promise((r) => setTimeout(r, 4))
    expect(useChatStore.getState().isStreaming).toBe(true)
    await useChatStore.getState().send('another prompt', fastStream)
    await first
    const userMessages = useChatStore.getState().messages.filter((m) => m.role === 'user')
    expect(userMessages).toHaveLength(1)
    expect(userMessages[0]?.content).toBe('hello')
  })
})
