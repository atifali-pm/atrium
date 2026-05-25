import type { Fixture } from './types'

function extractTopic(prompt: string): string {
  const cleaned = prompt
    .toLowerCase()
    .replace(/\b(research|tell me about|find out about|look up)\b/g, '')
    .trim()
  if (cleaned.length === 0) return 'the requested topic'
  return cleaned.length > 60 ? `${cleaned.slice(0, 60)}...` : cleaned
}

function extractUrl(prompt: string): string {
  const match = /(https?:\/\/[\w./?=&%-]+)/i.exec(prompt)
  return match?.[1] ?? 'https://example.com/article'
}

const greeting: Fixture = {
  id: 'ra-greeting',
  match: (p) => /\b(hi|hello|hey|hola|yo|sup)\b/.test(p),
  steps: [
    {
      kind: 'tokens',
      body: `Hi. I'm the **Research Analyst** persona, running on Atrium.

Ask me to **research a topic**, **search the web**, or **summarize a URL** and you'll see the tool trace timeline at the bottom and memory facts on the right populate as I work.`,
    },
    {
      kind: 'memory',
      factId: 'session-persona',
      key: 'session.persona',
      value: 'research-analyst',
      confidence: 1,
    },
  ],
}

const about: Fixture = {
  id: 'ra-about',
  match: (p) => /\b(what|who).*(you|do)|capabilit|about you/.test(p),
  steps: [
    {
      kind: 'tokens',
      body: `I'm a research-focused persona built on Atrium's Phase 2 mock layer. Every tool call you see in the bottom drawer is simulated against a deterministic fixture set, and every memory fact on the right comes from those same fixtures. The contract matches a real backend, so a Phase 6 swap is one file.

Try **research the Vite ecosystem** to watch a tool call and a memory fact land together.`,
    },
    {
      kind: 'memory',
      factId: 'user-understood',
      key: 'user.understood',
      value: 'research-analyst capabilities',
      confidence: 0.7,
    },
  ],
}

const researchTopic: Fixture = {
  id: 'ra-research',
  match: (p) => /\b(research|tell me about|look up|find out about)\b/.test(p),
  steps: [
    { kind: 'tokens', body: 'Looking into that. Searching the web.' },
    {
      kind: 'tool',
      toolId: 'tool-search-1',
      name: 'search_web',
      input: { query: '__topic__', max_results: 4 },
      latencyMs: 1100,
      status: 'ok',
      output: [
        {
          title: 'Vite 5 release notes',
          url: 'https://vitejs.dev/blog/announcing-vite5',
          snippet: 'Vite 5 ships Rolldown integration, faster HMR, and ESM-only output by default.',
        },
        {
          title: 'State of JS 2025 build tools',
          url: 'https://stateofjs.com/build-tools',
          snippet: 'Vite leads adoption in greenfield projects, tied with Turbopack for satisfaction.',
        },
        {
          title: 'React Vite template benchmarks',
          url: 'https://example.com/react-vite-bench',
          snippet: 'Median cold-start dev server time on M2 is 280ms across 50 projects.',
        },
      ],
    },
    {
      kind: 'tokens',
      body: `

Here's a brief from a few sources:

- **Vite 5 release notes**: ships Rolldown integration, faster HMR, ESM-only output.
- **State of JS 2025**: Vite leads adoption in greenfield work; tied with Turbopack for satisfaction.
- **React Vite benchmarks**: ~280ms median cold-start on M2.

Want me to drill into any of these?`,
    },
    {
      kind: 'memory',
      factId: 'research-topic',
      key: 'research.last_topic',
      value: '__topic__',
      confidence: 0.88,
    },
  ],
}

const searchWeb: Fixture = {
  id: 'ra-search',
  match: (p) => /\bsearch\b/.test(p),
  steps: [
    { kind: 'tokens', body: 'Searching.' },
    {
      kind: 'tool',
      toolId: 'tool-search-2',
      name: 'search_web',
      input: { query: '__topic__', max_results: 3 },
      latencyMs: 900,
      status: 'ok',
      output: [
        {
          title: 'React 19 release candidates',
          url: 'https://react.dev/blog/2025/04/react-19',
          snippet: 'Server Components, useFormStatus, the use() hook, and async transitions.',
        },
        {
          title: 'React 19 migration guide',
          url: 'https://react.dev/blog/2025/04/react-19-upgrade-guide',
          snippet: 'Codemod plus a deprecation runtime for legacy refs and the old context API.',
        },
        {
          title: 'Practical React 19 patterns',
          url: 'https://example.com/r19-patterns',
          snippet: 'Streaming markup, deferred values, and the action prop in forms.',
        },
      ],
    },
    {
      kind: 'tokens',
      body: `

Top hits:

1. **React 19 release candidates**: Server Components, useFormStatus, the use() hook, and async transitions.
2. **React 19 migration guide**: codemod plus a deprecation runtime for legacy refs and the old context API.
3. **Practical React 19 patterns**: streaming markup, deferred values, and form action prop.`,
    },
  ],
}

const summarizeUrl: Fixture = {
  id: 'ra-summarize',
  match: (p) => /\bsummari[sz]e\b|\btldr\b/.test(p),
  steps: [
    { kind: 'tokens', body: 'Fetching the URL.' },
    {
      kind: 'tool',
      toolId: 'tool-fetch-1',
      name: 'fetch_url',
      input: { url: '__url__' },
      latencyMs: 820,
      status: 'ok',
      output: {
        url: '__url__',
        title: 'The Vite ecosystem in 2026',
        word_count: 2840,
        excerpt:
          'Vite is no longer just a dev server. Rolldown, Vitest, and the plugin ecosystem make it a full build pipeline...',
      },
    },
    {
      kind: 'tool',
      toolId: 'tool-summarize-1',
      name: 'summarize',
      input: { content_id: 'fetched-1', style: 'tldr' },
      latencyMs: 540,
      status: 'ok',
      output: {
        tldr: 'Vite has become a full build pipeline through Rolldown, Vitest, and a deep plugin ecosystem.',
        bullets: [
          'Rolldown brings native bundling to Vite, closing the dev/prod parity gap.',
          'Vitest is the default test runner for new Vite projects; coverage parity with Jest.',
          'Plugin ecosystem covers SSR, MDX, image optimization, and edge deploys.',
        ],
      },
    },
    {
      kind: 'tokens',
      body: `

**Summary**

Vite has become a full build pipeline through Rolldown, Vitest, and a deep plugin ecosystem.

- Rolldown brings native bundling to Vite, closing the dev/prod parity gap.
- Vitest is the default test runner for new Vite projects; coverage parity with Jest.
- Plugin ecosystem covers SSR, MDX, image optimization, and edge deploys.`,
    },
    {
      kind: 'memory',
      factId: 'research-url',
      key: 'research.last_url',
      value: '__url__',
      confidence: 0.9,
    },
  ],
}

const fallback: Fixture = {
  id: 'ra-fallback',
  steps: [
    {
      kind: 'tokens',
      body: `I'm in Research Analyst mode and best at search and summarization. Try **research [topic]**, **search [topic]**, or **summarize [url]** to see tool calls and memory updates land in the side panels.`,
    },
  ],
}

function rewriteFixture(fixture: Fixture, prompt: string): Fixture {
  const topic = extractTopic(prompt)
  const url = extractUrl(prompt)
  const steps = fixture.steps.map((step) => {
    if (step.kind === 'tool') {
      const input = JSON.parse(JSON.stringify(step.input)) as Record<string, unknown>
      for (const key of Object.keys(input)) {
        if (input[key] === '__topic__') input[key] = topic
        if (input[key] === '__url__') input[key] = url
      }
      const output =
        typeof step.output === 'object' && step.output !== null
          ? (JSON.parse(JSON.stringify(step.output).replace(/__url__/g, url)) as unknown)
          : step.output
      return { ...step, input, output }
    }
    if (step.kind === 'memory') {
      return {
        ...step,
        value: step.value.replace('__topic__', topic).replace('__url__', url),
      }
    }
    return step
  })
  return { ...fixture, steps }
}

const FIXTURES: readonly Fixture[] = [greeting, about, researchTopic, searchWeb, summarizeUrl, fallback]

export const researchAnalystFixtures = FIXTURES
export { rewriteFixture as rewriteResearchFixture }
