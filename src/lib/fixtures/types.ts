export type ToolStatus = 'ok' | 'error'

export interface ToolCallStep {
  kind: 'tool'
  toolId: string
  name: string
  input: Record<string, unknown>
  output: unknown
  latencyMs: number
  status: ToolStatus
  errorMessage?: string
}

export interface MemoryStep {
  kind: 'memory'
  factId: string
  key: string
  value: string
  confidence: number
}

export interface TokensStep {
  kind: 'tokens'
  body: string
}

export interface WaitStep {
  kind: 'wait'
  ms: number
}

export type FixtureStep = TokensStep | ToolCallStep | MemoryStep | WaitStep

export interface Fixture {
  id: string
  match?: (lowercasePrompt: string) => boolean
  steps: FixtureStep[]
}

export function hashString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function pickFixture(fixtures: readonly Fixture[], prompt: string): Fixture {
  const text = prompt.trim().toLowerCase()
  for (const fixture of fixtures) {
    if (fixture.match?.(text)) return fixture
  }
  const fallbacks = fixtures.filter((f) => !f.match)
  if (fallbacks.length > 0) {
    const idx = hashString(text || 'empty') % fallbacks.length
    return fallbacks[idx] ?? (fallbacks[0] as Fixture)
  }
  return fixtures[0] as Fixture
}
