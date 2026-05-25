import { describe, it, expect } from 'vitest'
import {
  DEFAULT_PERSONA_ID,
  getPersona,
  personas,
  researchAnalyst,
} from './registry'
import { pickFixture } from '@/lib/fixtures/types'

describe('persona registry', () => {
  it('exposes exactly three personas with research-analyst as the default', () => {
    expect(personas).toHaveLength(3)
    expect(DEFAULT_PERSONA_ID).toBe('research-analyst')
    expect(getPersona(DEFAULT_PERSONA_ID).id).toBe('research-analyst')
  })

  it('falls back to research-analyst when an unknown id is requested', () => {
    expect(getPersona('does-not-exist').id).toBe('research-analyst')
  })

  it('marks the phase-3 stubs as unavailable with a note', () => {
    const unavailable = personas.filter((p) => !p.available)
    expect(unavailable.map((p) => p.id)).toEqual(['code-assistant', 'travel-planner'])
    for (const p of unavailable) {
      expect(p.availabilityNote).toBeTruthy()
    }
  })

  it('research-analyst fixtures include the expected ids', () => {
    const ids = researchAnalyst.fixtures.map((f) => f.id)
    expect(ids).toEqual([
      'ra-greeting',
      'ra-about',
      'ra-research',
      'ra-search',
      'ra-summarize',
      'ra-fallback',
    ])
  })

  it('pickFixture routes deterministic keywords to the matching fixture', () => {
    expect(pickFixture(researchAnalyst.fixtures, 'hello').id).toBe('ra-greeting')
    expect(pickFixture(researchAnalyst.fixtures, 'research react').id).toBe('ra-research')
    expect(pickFixture(researchAnalyst.fixtures, 'search the web').id).toBe('ra-search')
    expect(pickFixture(researchAnalyst.fixtures, 'summarize https://x').id).toBe('ra-summarize')
    expect(pickFixture(researchAnalyst.fixtures, 'something else').id).toBe('ra-fallback')
  })
})
