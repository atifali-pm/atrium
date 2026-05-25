import type { Persona } from '@/features/personas/registry'
import { pickFixture } from '@/lib/fixtures/types'
import { tokens } from '@/lib/tokens'

export type SSEEvent =
  | { type: 'start'; fixtureId: string; personaId: string }
  | { type: 'token'; token: string }
  | {
      type: 'tool-start'
      toolId: string
      name: string
      input: Record<string, unknown>
    }
  | {
      type: 'tool-end'
      toolId: string
      output: unknown
      latencyMs: number
      status: 'ok' | 'error'
      errorMessage?: string
    }
  | {
      type: 'memory-set'
      factId: string
      key: string
      value: string
      confidence: number
    }
  | { type: 'done'; fixtureId: string }
  | { type: 'error'; message: string }

export interface StreamOptions {
  signal?: AbortSignal
  delayMs?: number
  jitterMs?: number
  toolLatencyScale?: number
}

function tokenize(text: string): string[] {
  return text.match(/\s+|\S+/g) ?? []
}

function jitterFor(index: number, base: number, jitter: number): number {
  if (jitter <= 0) return base
  const offset = ((index * 7) % (jitter * 2)) - jitter
  return Math.max(0, base + offset)
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

export async function* streamResponse(
  prompt: string,
  persona: Persona,
  options: StreamOptions = {},
): AsyncGenerator<SSEEvent, void, void> {
  const baseDelay = options.delayMs ?? tokens.motion.streamTokenDelayMs
  const jitter = options.jitterMs ?? tokens.motion.streamTokenJitterMs
  const toolScale = options.toolLatencyScale ?? 1
  const picked = pickFixture(persona.fixtures, prompt)
  const fixture = persona.hydrate ? persona.hydrate(picked, prompt) : picked
  let tokenIndex = 0

  try {
    yield { type: 'start', fixtureId: fixture.id, personaId: persona.id }

    for (const step of fixture.steps) {
      if (step.kind === 'tokens') {
        const chunks = tokenize(step.body)
        for (const token of chunks) {
          const delay = jitterFor(tokenIndex, baseDelay, jitter)
          tokenIndex += 1
          if (delay > 0) {
            await sleep(delay, options.signal)
          } else if (options.signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError')
          }
          yield { type: 'token', token }
        }
      } else if (step.kind === 'tool') {
        yield {
          type: 'tool-start',
          toolId: step.toolId,
          name: step.name,
          input: step.input,
        }
        const scaled = Math.max(0, Math.round(step.latencyMs * toolScale))
        if (scaled > 0) await sleep(scaled, options.signal)
        yield {
          type: 'tool-end',
          toolId: step.toolId,
          output: step.output,
          latencyMs: step.latencyMs,
          status: step.status,
          ...(step.errorMessage ? { errorMessage: step.errorMessage } : {}),
        }
      } else if (step.kind === 'memory') {
        yield {
          type: 'memory-set',
          factId: step.factId,
          key: step.key,
          value: step.value,
          confidence: step.confidence,
        }
      } else if (step.kind === 'wait') {
        if (step.ms > 0) await sleep(step.ms, options.signal)
      }
    }

    yield { type: 'done', fixtureId: fixture.id }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return
    }
    const message = err instanceof Error ? err.message : 'Unknown streaming error'
    yield { type: 'error', message }
  }
}
