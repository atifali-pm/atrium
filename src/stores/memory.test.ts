import { describe, it, expect, beforeEach } from 'vitest'
import { useMemoryStore, type MemoryFact } from './memory'

function fact(overrides: Partial<MemoryFact> = {}): Omit<MemoryFact, 'updatedAt'> {
  return {
    id: 'f1',
    key: 'user.topic',
    value: 'vite',
    confidence: 0.8,
    provenance: {
      messageId: 'm1',
      fixtureId: 'ra-research',
      personaId: 'research-analyst',
      capturedAt: Date.now(),
    },
    ...overrides,
  }
}

describe('useMemoryStore', () => {
  beforeEach(() => {
    useMemoryStore.getState().reset()
  })

  it('starts empty', () => {
    expect(useMemoryStore.getState().facts).toHaveLength(0)
  })

  it('set appends a new fact', () => {
    useMemoryStore.getState().set(fact())
    const facts = useMemoryStore.getState().facts
    expect(facts).toHaveLength(1)
    expect(facts[0]?.value).toBe('vite')
    expect(facts[0]?.updatedAt).toBeGreaterThan(0)
  })

  it('set with the same key updates in place rather than duplicating', () => {
    useMemoryStore.getState().set(fact({ id: 'f1', value: 'react' }))
    useMemoryStore.getState().set(fact({ id: 'f2', value: 'svelte' }))
    const facts = useMemoryStore.getState().facts
    expect(facts).toHaveLength(1)
    expect(facts[0]?.value).toBe('svelte')
  })

  it('set with a different key appends a separate fact', () => {
    useMemoryStore.getState().set(fact({ id: 'f1', key: 'a', value: 'one' }))
    useMemoryStore.getState().set(fact({ id: 'f2', key: 'b', value: 'two' }))
    expect(useMemoryStore.getState().facts).toHaveLength(2)
  })

  it('forget removes the fact by id', () => {
    useMemoryStore.getState().set(fact({ id: 'f1' }))
    useMemoryStore.getState().set(fact({ id: 'f2', key: 'other' }))
    useMemoryStore.getState().forget('f1')
    const facts = useMemoryStore.getState().facts
    expect(facts).toHaveLength(1)
    expect(facts[0]?.id).toBe('f2')
  })

  it('reset clears all facts', () => {
    useMemoryStore.getState().set(fact())
    useMemoryStore.getState().reset()
    expect(useMemoryStore.getState().facts).toHaveLength(0)
  })
})
