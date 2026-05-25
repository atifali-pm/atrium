import { create } from 'zustand'

export type TraceStatus = 'running' | 'ok' | 'error'

export interface ToolTrace {
  id: string
  name: string
  input: Record<string, unknown>
  output?: unknown
  latencyMs?: number
  status: TraceStatus
  errorMessage?: string
  startedAt: number
  endedAt?: number
  messageId: string
  fixtureId: string
  personaId: string
}

interface TracesState {
  traces: ToolTrace[]
  start: (input: Omit<ToolTrace, 'status' | 'startedAt' | 'output' | 'latencyMs' | 'endedAt'>) => void
  complete: (input: {
    id: string
    output: unknown
    latencyMs: number
    status: TraceStatus
    errorMessage?: string
  }) => void
  clear: () => void
  reset: () => void
}

export const useTracesStore = create<TracesState>((set) => ({
  traces: [],
  start: (input) =>
    set((state) => ({
      traces: [
        ...state.traces,
        {
          ...input,
          status: 'running',
          startedAt: Date.now(),
        },
      ],
    })),
  complete: ({ id, output, latencyMs, status, errorMessage }) =>
    set((state) => ({
      traces: state.traces.map((t) =>
        t.id === id
          ? {
              ...t,
              output,
              latencyMs,
              status,
              ...(errorMessage ? { errorMessage } : {}),
              endedAt: Date.now(),
            }
          : t,
      ),
    })),
  clear: () => set(() => ({ traces: [] })),
  reset: () => set(() => ({ traces: [] })),
}))
