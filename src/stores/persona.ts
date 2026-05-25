import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_PERSONA_ID, getPersona, type Persona } from '@/features/personas/registry'

interface PersonaState {
  activeId: string
  setActive: (id: string) => void
}

export const usePersonaStore = create<PersonaState>()(
  persist(
    (set) => ({
      activeId: DEFAULT_PERSONA_ID,
      setActive: (id) => {
        const p = getPersona(id)
        if (!p.available) return
        set({ activeId: p.id })
      },
    }),
    { name: 'atrium:persona' },
  ),
)

export function getActivePersona(): Persona {
  return getPersona(usePersonaStore.getState().activeId)
}
