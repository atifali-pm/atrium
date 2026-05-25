import { pickResponse } from '@/lib/fixtures/responses'
import { tokens } from '@/lib/tokens'

export type SSEEvent =
  | { type: 'token'; token: string }
  | { type: 'done'; fixtureId: string }
  | { type: 'error'; message: string }

export interface StreamOptions {
  signal?: AbortSignal
  delayMs?: number
  jitterMs?: number
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
  options: StreamOptions = {},
): AsyncGenerator<SSEEvent, void, void> {
  const baseDelay = options.delayMs ?? tokens.motion.streamTokenDelayMs
  const jitter = options.jitterMs ?? tokens.motion.streamTokenJitterMs
  const fixture = pickResponse(prompt)
  const chunks = tokenize(fixture.body)

  try {
    for (let i = 0; i < chunks.length; i += 1) {
      const token = chunks[i] as string
      const delay = jitterFor(i, baseDelay, jitter)
      if (delay > 0) {
        await sleep(delay, options.signal)
      } else if (options.signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }
      yield { type: 'token', token }
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
