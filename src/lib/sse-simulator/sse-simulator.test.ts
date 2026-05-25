import { describe, it, expect } from 'vitest'
import { streamResponse, type SSEEvent } from './index'
import { researchAnalyst } from '@/features/personas/registry'

async function collect(prompt: string, signal?: AbortSignal): Promise<SSEEvent[]> {
  const events: SSEEvent[] = []
  for await (const event of streamResponse(prompt, researchAnalyst, {
    delayMs: 0,
    jitterMs: 0,
    toolLatencyScale: 0,
    ...(signal ? { signal } : {}),
  })) {
    events.push(event)
  }
  return events
}

function tokensFrom(events: SSEEvent[]): string {
  return events
    .filter((e): e is Extract<SSEEvent, { type: 'token' }> => e.type === 'token')
    .map((e) => e.token)
    .join('')
}

function startFrom(events: SSEEvent[]) {
  return events.find((e): e is Extract<SSEEvent, { type: 'start' }> => e.type === 'start')
}

function doneFrom(events: SSEEvent[]) {
  return events.find((e): e is Extract<SSEEvent, { type: 'done' }> => e.type === 'done')
}

describe('streamResponse (persona-aware)', () => {
  it('routes greeting prompts to ra-greeting and emits a memory-set event', async () => {
    const events = await collect('hello there')
    expect(startFrom(events)?.fixtureId).toBe('ra-greeting')
    expect(doneFrom(events)?.fixtureId).toBe('ra-greeting')
    const memorySets = events.filter((e) => e.type === 'memory-set')
    expect(memorySets).toHaveLength(1)
    expect(tokensFrom(events).length).toBeGreaterThan(0)
  })

  it('routes research prompts to ra-research and emits a tool-start + tool-end pair', async () => {
    const events = await collect('research the vite ecosystem')
    expect(doneFrom(events)?.fixtureId).toBe('ra-research')
    const starts = events.filter((e) => e.type === 'tool-start')
    const ends = events.filter((e) => e.type === 'tool-end')
    expect(starts).toHaveLength(1)
    expect(ends).toHaveLength(1)
    const start = starts[0] as Extract<SSEEvent, { type: 'tool-start' }>
    const end = ends[0] as Extract<SSEEvent, { type: 'tool-end' }>
    expect(start.name).toBe('search_web')
    expect(start.input.query).toBe('the vite ecosystem')
    expect(end.status).toBe('ok')
    expect(end.toolId).toBe(start.toolId)
    expect(end.latencyMs).toBeGreaterThan(0)
  })

  it('routes summarize prompts through fetch_url + summarize tools', async () => {
    const events = await collect('summarize https://example.com/some-post')
    expect(doneFrom(events)?.fixtureId).toBe('ra-summarize')
    const toolStarts = events.filter((e) => e.type === 'tool-start') as Extract<
      SSEEvent,
      { type: 'tool-start' }
    >[]
    expect(toolStarts.map((t) => t.name)).toEqual(['fetch_url', 'summarize'])
    expect(toolStarts[0]?.input.url).toBe('https://example.com/some-post')
    const memorySets = events.filter((e) => e.type === 'memory-set')
    expect(memorySets).toHaveLength(1)
  })

  it('routes empty prompts to the fallback fixture', async () => {
    const events = await collect('   ')
    expect(doneFrom(events)?.fixtureId).toBe('ra-fallback')
  })

  it('is deterministic across runs for the same prompt', async () => {
    const a = await collect('research react 19')
    const b = await collect('research react 19')
    expect(tokensFrom(a)).toBe(tokensFrom(b))
    expect(doneFrom(a)?.fixtureId).toBe(doneFrom(b)?.fixtureId)
  })

  it('stops yielding when the signal is aborted mid-stream', async () => {
    const controller = new AbortController()
    const iter = streamResponse('hello', researchAnalyst, {
      delayMs: 5,
      jitterMs: 0,
      toolLatencyScale: 0,
      signal: controller.signal,
    })
    let count = 0
    const reading = (async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const _event of iter) {
        count += 1
      }
    })()
    await new Promise((r) => setTimeout(r, 10))
    controller.abort()
    await reading
    expect(count).toBeGreaterThan(0)
  })
})
