import {
  researchAnalystFixtures,
  rewriteResearchFixture,
} from '@/lib/fixtures/research-analyst'
import type { Fixture } from '@/lib/fixtures/types'

export interface Persona {
  id: string
  name: string
  blurb: string
  systemPromptSummary: string
  tools: string[]
  fixtures: readonly Fixture[]
  hydrate?: (fixture: Fixture, prompt: string) => Fixture
  available: boolean
  availabilityNote?: string
}

export const researchAnalyst: Persona = {
  id: 'research-analyst',
  name: 'Research Analyst',
  blurb: 'Web search, URL fetching, summarization.',
  systemPromptSummary:
    'You research topics, search the web, fetch URLs, and summarize findings. Prefer concise briefs with cited sources.',
  tools: ['search_web', 'fetch_url', 'summarize'],
  fixtures: researchAnalystFixtures,
  hydrate: rewriteResearchFixture,
  available: true,
}

export const codeAssistantStub: Persona = {
  id: 'code-assistant',
  name: 'Code Assistant',
  blurb: 'Reads files, runs tests, drafts diffs.',
  systemPromptSummary: 'Stub for Phase 3.',
  tools: ['read_file', 'run_tests', 'apply_patch'],
  fixtures: [
    {
      id: 'code-stub-fallback',
      steps: [{ kind: 'tokens', body: 'Code Assistant arrives in Phase 3.' }],
    },
  ],
  available: false,
  availabilityNote: 'Arrives in Phase 3',
}

export const travelPlannerStub: Persona = {
  id: 'travel-planner',
  name: 'Travel Planner',
  blurb: 'Itineraries, bookings, local context.',
  systemPromptSummary: 'Stub for Phase 3.',
  tools: ['search_flights', 'search_hotels', 'build_itinerary'],
  fixtures: [
    {
      id: 'travel-stub-fallback',
      steps: [{ kind: 'tokens', body: 'Travel Planner arrives in Phase 3.' }],
    },
  ],
  available: false,
  availabilityNote: 'Arrives in Phase 3',
}

export const personas: readonly Persona[] = [researchAnalyst, codeAssistantStub, travelPlannerStub]

export const DEFAULT_PERSONA_ID = researchAnalyst.id

export function getPersona(id: string): Persona {
  return personas.find((p) => p.id === id) ?? researchAnalyst
}
