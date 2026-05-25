export interface FixtureResponse {
  id: string
  body: string
}

const greeting: FixtureResponse = {
  id: 'greeting',
  body: `Hi. I'm Atrium, a privacy-first AI assistant workspace.

Everything you see here runs in your browser. There is no real model behind the curtain in this build; a deterministic mock layer streams responses so the UX is the focus. Try asking me to **write a snippet**, or ask **what can you do?** to see how a longer answer renders.`,
}

const about: FixtureResponse = {
  id: 'about',
  body: `Atrium is a reference UI for the privacy-first assistant pattern. The build you're looking at covers:

- **Streaming chat** with a cancel button you can hit mid-response.
- **Memory inspector** (Phase 2) that will surface what the assistant knows about you.
- **Tool trace timeline** (Phase 2) showing every simulated tool call.
- **Persona switching** (Phase 3) across research, code, and travel-planning personas.
- **Voice and multimodal** input (Phase 4), and a workspace canvas.

The mock layer is the contract. When a real backend is wired up later, the FE doesn't change.`,
}

const codeAnswer: FixtureResponse = {
  id: 'code-answer',
  body: `Here's a small TypeScript helper that debounces a function:

\`\`\`ts
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  waitMs: number,
): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), waitMs)
  }
}
\`\`\`

Each call resets the pending timer. The wrapped function only fires once the caller has been quiet for \`waitMs\`. Good for search inputs and resize handlers.`,
}

const markdownTour: FixtureResponse = {
  id: 'markdown-tour',
  body: `A quick tour of the markdown renderer.

### Lists

- ordered and unordered both work
- nested items render with proper indent
- **bold**, *italic*, and \`inline code\`

### Tables

| token | role |
|---|---|
| surface | background layers |
| ink | text |
| accent | brand emphasis |

### Blockquote

> The privacy story is the product, not a footnote.

### Code

\`\`\`tsx
function Hello({ name }: { name: string }) {
  return <p>Hello, {name}.</p>
}
\`\`\``,
}

const fallback: FixtureResponse = {
  id: 'fallback',
  body: `Got it. In Phase 1 I'm wired to a deterministic mock layer, so I can show how streaming, cancel, retry, and edit feel against a real chat UI, but I can't reason about arbitrary prompts yet.

Phase 2 brings the memory inspector and tool traces, Phase 3 adds personas and a command palette. The Cloudflare Pages deploy goes up as soon as this phase lands.`,
}

const POOL = [greeting, about, codeAnswer, markdownTour, fallback] as const

function hashString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function pickResponse(prompt: string): FixtureResponse {
  const text = prompt.trim().toLowerCase()
  if (text.length === 0) return fallback

  if (/\b(hi|hello|hey|hola|sup|yo)\b/.test(text)) return greeting
  if (/\b(what|who).*(you|atrium)|capabilit|can you do|about/.test(text)) return about
  if (/\b(code|function|debounce|snippet|typescript|react|component|script)\b/.test(text)) return codeAnswer
  if (/\b(markdown|format|table|list|render)\b/.test(text)) return markdownTour

  const idx = hashString(text) % POOL.length
  return POOL[idx] ?? fallback
}

export const fixtureResponses = POOL
