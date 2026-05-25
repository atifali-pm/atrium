import { describe, it, expect, beforeEach } from 'vitest'
import { useTracesStore } from './traces'

function startBase(id = 't1') {
  return {
    id,
    name: 'search_web',
    input: { query: 'vite' },
    messageId: 'm1',
    fixtureId: 'ra-research',
    personaId: 'research-analyst',
  }
}

describe('useTracesStore', () => {
  beforeEach(() => {
    useTracesStore.getState().reset()
  })

  it('starts empty', () => {
    expect(useTracesStore.getState().traces).toHaveLength(0)
  })

  it('start appends a trace in running status', () => {
    useTracesStore.getState().start(startBase())
    const traces = useTracesStore.getState().traces
    expect(traces).toHaveLength(1)
    expect(traces[0]?.status).toBe('running')
    expect(traces[0]?.startedAt).toBeGreaterThan(0)
    expect(traces[0]?.output).toBeUndefined()
  })

  it('complete flips status and fills output, latency, endedAt', () => {
    useTracesStore.getState().start(startBase('t1'))
    useTracesStore.getState().complete({
      id: 't1',
      output: { hits: 3 },
      latencyMs: 420,
      status: 'ok',
    })
    const trace = useTracesStore.getState().traces[0]
    expect(trace?.status).toBe('ok')
    expect(trace?.latencyMs).toBe(420)
    expect(trace?.output).toEqual({ hits: 3 })
    expect(trace?.endedAt).toBeGreaterThan(0)
  })

  it('complete on an unknown id is a no-op', () => {
    useTracesStore.getState().start(startBase('t1'))
    useTracesStore.getState().complete({
      id: 'tX',
      output: null,
      latencyMs: 1,
      status: 'ok',
    })
    expect(useTracesStore.getState().traces[0]?.status).toBe('running')
  })

  it('clear and reset both empty the traces', () => {
    useTracesStore.getState().start(startBase('t1'))
    useTracesStore.getState().start(startBase('t2'))
    expect(useTracesStore.getState().traces).toHaveLength(2)
    useTracesStore.getState().clear()
    expect(useTracesStore.getState().traces).toHaveLength(0)
    useTracesStore.getState().start(startBase('t3'))
    useTracesStore.getState().reset()
    expect(useTracesStore.getState().traces).toHaveLength(0)
  })
})
