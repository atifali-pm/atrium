import { create } from 'zustand'

export interface MemoryProvenance {
  messageId: string
  fixtureId: string
  personaId: string
  capturedAt: number
}

export interface MemoryFact {
  id: string
  key: string
  value: string
  confidence: number
  updatedAt: number
  provenance: MemoryProvenance
}

interface MemoryState {
  facts: MemoryFact[]
  set: (input: Omit<MemoryFact, 'updatedAt'>) => void
  forget: (id: string) => void
  reset: () => void
}

export const useMemoryStore = create<MemoryState>((set) => ({
  facts: [],
  set: (input) =>
    set((state) => {
      const next: MemoryFact = { ...input, updatedAt: Date.now() }
      const existingIdx = state.facts.findIndex(
        (f) => f.id === input.id || f.key === input.key,
      )
      if (existingIdx >= 0) {
        const facts = state.facts.slice()
        facts[existingIdx] = next
        return { facts }
      }
      return { facts: [...state.facts, next] }
    }),
  forget: (id) => set((state) => ({ facts: state.facts.filter((f) => f.id !== id) })),
  reset: () => set(() => ({ facts: [] })),
}))
