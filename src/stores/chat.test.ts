import { describe, it, expect, beforeEach } from 'vitest'
import { useChatStore } from './chat'
import { pickResponse } from '@/lib/fixtures/responses'

const fastStream = { delayMs: 0, jitterMs: 0 }

function snapshot() {
  return useChatStore.getState().messages.map((m) => ({
    role: m.role,
    content: m.content,
    status: m.status,
  }))
}

describe('useChatStore', () => {
  beforeEach(() => {
    useChatStore.getState().reset()
  })

  it('starts empty and not streaming', () => {
    const state = useChatStore.getState()
    expect(state.messages).toHaveLength(0)
    expect(state.isStreaming).toBe(false)
  })

  it('send creates a user + assistant message and streams the fixture body to completion', async () => {
    const prompt = 'hello'
    const fixture = pickResponse(prompt)
    await useChatStore.getState().send(prompt, fastStream)

    const messages = useChatStore.getState().messages
    expect(messages).toHaveLength(2)
    const user = messages[0]
    const asst = messages[1]
    expect(user?.role).toBe('user')
    expect(user?.content).toBe(prompt)
    expect(asst?.role).toBe('assistant')
    expect(asst?.content).toBe(fixture.body)
    expect(asst?.status).toBe('done')
    expect(asst?.fixtureId).toBe(fixture.id)
    expect(useChatStore.getState().isStreaming).toBe(false)
  })

  it('rejects an empty prompt and does not create messages', async () => {
    await useChatStore.getState().send('   ', fastStream)
    expect(useChatStore.getState().messages).toHaveLength(0)
  })

  it('cancel during streaming marks the assistant message as cancelled', async () => {
    const inFlight = useChatStore.getState().send('hello', { delayMs: 5, jitterMs: 0 })
    await new Promise((r) => setTimeout(r, 12))
    useChatStore.getState().cancel()
    await inFlight

    const last = useChatStore.getState().messages.at(-1)
    expect(last?.role).toBe('assistant')
    expect(last?.status).toBe('cancelled')
    expect((last?.content.length ?? 0)).toBeGreaterThan(0)
    expect((last?.content.length ?? 0)).toBeLessThan(pickResponse('hello').body.length)
    expect(useChatStore.getState().isStreaming).toBe(false)
  })

  it('retry replaces the last assistant message with a fresh stream of the same prompt', async () => {
    await useChatStore.getState().send('hello', fastStream)
    const firstAsstId = useChatStore.getState().messages[1]?.id
    await useChatStore.getState().retry(fastStream)

    const messages = useChatStore.getState().messages
    expect(messages).toHaveLength(2)
    expect(messages[0]?.role).toBe('user')
    expect(messages[1]?.role).toBe('assistant')
    expect(messages[1]?.id).not.toBe(firstAsstId)
    expect(messages[1]?.status).toBe('done')
  })

  it('editAndResend rewrites the user message and re-streams', async () => {
    await useChatStore.getState().send('hello', fastStream)
    const userId = useChatStore.getState().messages[0]?.id as string
    await useChatStore.getState().editAndResend(userId, 'write me a code function', fastStream)

    const snap = snapshot()
    expect(snap).toHaveLength(2)
    expect(snap[0]?.role).toBe('user')
    expect(snap[0]?.content).toBe('write me a code function')
    expect(snap[1]?.role).toBe('assistant')
    expect(useChatStore.getState().messages[1]?.fixtureId).toBe('code-answer')
  })

  it('does not start a new send while already streaming', async () => {
    const first = useChatStore.getState().send('hello', { delayMs: 4, jitterMs: 0 })
    await new Promise((r) => setTimeout(r, 4))
    expect(useChatStore.getState().isStreaming).toBe(true)
    await useChatStore.getState().send('another prompt', fastStream)
    await first
    const userMessages = useChatStore.getState().messages.filter((m) => m.role === 'user')
    expect(userMessages).toHaveLength(1)
    expect(userMessages[0]?.content).toBe('hello')
  })
})
