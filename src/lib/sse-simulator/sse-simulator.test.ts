import { describe, it, expect } from 'vitest'
import { streamResponse } from './index'
import { pickResponse } from '@/lib/fixtures/responses'

async function collect(prompt: string, signal?: AbortSignal) {
  const tokens: string[] = []
  let doneFixtureId: string | undefined
  let error: string | undefined
  for await (const event of streamResponse(prompt, { delayMs: 0, jitterMs: 0, ...(signal ? { signal } : {}) })) {
    if (event.type === 'token') tokens.push(event.token)
    if (event.type === 'done') doneFixtureId = event.fixtureId
    if (event.type === 'error') error = event.message
  }
  return { tokens, doneFixtureId, error }
}

describe('streamResponse', () => {
  it('emits tokens that reconstruct the fixture body, then a done event', async () => {
    const prompt = 'hello there'
    const expected = pickResponse(prompt)
    const { tokens, doneFixtureId } = await collect(prompt)
    expect(tokens.join('')).toBe(expected.body)
    expect(doneFixtureId).toBe(expected.id)
  })

  it('routes prompts deterministically: code keyword returns the code fixture', async () => {
    const { doneFixtureId } = await collect('write me a debounce function in typescript')
    expect(doneFixtureId).toBe('code-answer')
  })

  it('routes "what can you do" to the about fixture', async () => {
    const { doneFixtureId } = await collect('what can you do')
    expect(doneFixtureId).toBe('about')
  })

  it('routes empty prompts to the fallback', async () => {
    const { doneFixtureId } = await collect('   ')
    expect(doneFixtureId).toBe('fallback')
  })

  it('stops yielding when the signal is aborted', async () => {
    const controller = new AbortController()
    const iter = streamResponse('hello', { delayMs: 5, jitterMs: 0, signal: controller.signal })
    const collected: string[] = []
    const reading = (async () => {
      for await (const event of iter) {
        if (event.type === 'token') collected.push(event.token)
      }
    })()
    await new Promise((r) => setTimeout(r, 10))
    controller.abort()
    await reading
    const expectedFull = pickResponse('hello').body
    expect(collected.join('').length).toBeLessThan(expectedFull.length)
  })

  it('is deterministic across runs for the same prompt', async () => {
    const a = await collect('show me the markdown tour')
    const b = await collect('show me the markdown tour')
    expect(a.tokens).toEqual(b.tokens)
    expect(a.doneFixtureId).toEqual(b.doneFixtureId)
  })
})
