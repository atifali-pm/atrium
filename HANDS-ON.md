# HANDS-ON

The build guide for Atrium. Read this top to bottom before opening a Phase 1 session.

## Screenshots

When you hit a UI milestone (layout shell done, streaming chat working, memory inspector landed, etc.), capture a screenshot and save it to `/screenshots/` at the repo root. Use descriptive filenames like `01-hero.png`, `02-chat-streaming.png`, `03-memory-inspector.png`, `04-tool-traces.png`, `05-persona-switcher.png`.

**Embed every screenshot in README.md** via relative markdown image refs: `![Streaming chat](screenshots/02-chat-streaming.png)`. A public repo with screenshots embedded in the README is a complete portfolio artifact. A live deploy URL is nice but optional; most viewers who land on the GitHub page see the app in action through the README.

`/screenshots/` is the one canonical location for source image files. Do not duplicate them into `/docs/` or `/public/`. The README and the portfolio site both reference them from `/screenshots/` (the portfolio-maintainer copies them to the site's public dir at promotion time).

The portfolio-maintainer at `~/.claude/agents/portfolio-maintainer.md` looks in `/screenshots/` when deciding whether to promote the project to atifali.pages.dev. No screenshots = the project does not qualify.

## Preflight

Before running `npm run dev` or `npm test`:

1. **Node 22.** `node --version` must report v22.x. If mise is installed, `mise use node@22` in this directory.
2. **Ports free.** Vite dev server uses `5180`, Storybook uses `6080`. Confirm with `ss -ltn | grep -E ':5180|:6080'`.
3. **Clean install.** `rm -rf node_modules package-lock.json && npm install` if the lockfile looks stale.
4. **First-time only.** `npx playwright install chromium` before running e2e.

## Paste-ready kickoff prompt for the next Claude Code session (Phase 3)

Open a new Claude Code session in `/home/atif/projects/atrium/` and paste this:

```
Resume Atrium at Phase 3.

Read in this order:
1. /home/atif/.claude/projects/-home-atif-projects-atrium/memory/MEMORY.md
2. /home/atif/.claude/projects/-home-atif-projects-atrium/memory/project_atrium.md
3. /home/atif/.claude/projects/-home-atif-projects-portfolio/memory/project_atrium_idea.md (full spec, source of truth)
4. /home/atif/projects/atrium/HANDS-ON.md

Then build Phase 3 to completion. Phase 3 scope:
- Promote the Code Assistant and Travel Planner persona stubs into real personas. Each gets its own fixture pool with persona-appropriate tools: Code Assistant (read_file, run_tests, apply_patch) and Travel Planner (search_flights, search_hotels, build_itinerary). Each fixture set includes one greeting, one about, two tool-driven response paths, and one fallback. Memory writes reflect the persona's domain.
- Persona switcher transitions via Framer Motion. Switching personas mid-conversation triggers a soft swap animation in the chat column and the trace drawer, with a visible "switched to persona X" system line in the chat.
- Cmd+K command palette overlay. At minimum: switch persona, switch theme, jump to setting (settings panel can be a small popover), run saved prompt (a fixture-suggested prompt per active persona), and fuzzy-search the current conversation messages.
- Theming polish pass: motion tokens applied to common transitions, focus rings consistent, hover/active states audited across components. Document the design tokens in a small Storybook story bundle (this is the moment Storybook gets wired in for the first time).
- Vitest coverage for the palette and any new stores. One Playwright e2e covering Cmd+K: open palette, switch persona, palette closes, persona is active, a new prompt routes through the new persona's fixtures.

Rules (non-negotiable, from /home/atif/.claude/CLAUDE.md and per-project memory):
- No em dashes anywhere (READMEs, code comments, commit messages, chat).
- No space-hyphen-space pause separators in prose.
- No Co-Authored-By or AI attribution in git commits ever.
- Atrium is its own product in the privacy-first assistant category; do not frame as a Swisper or Le Chat clone.
- Screenshots when each milestone lands, embed in README from /screenshots/.
- No real backend, no real LLM. Mock layer only.

When Phase 3 is done: commit, push, confirm CI is green, capture screenshots, update README, then stop and report.
```

## Deploys

Cloudflare Pages auto-deploys on every push to `main` via the dashboard Git integration; no GitHub Actions workflow is required. Confirm the project exists in the Cloudflare Pages dashboard, point it at `github.com/atifali-pm/atrium`, build command `npm run build`, output directory `dist`. After the first deploy lands, the demo URL goes live at the CF Pages alias.

## Phase plan with checkboxes

### Phase 0: scaffold (DONE)
- [x] Vite + React 18 + TypeScript strict skeleton
- [x] Tailwind 3 + design token placeholders
- [x] Zustand, TanStack Query v5, Framer Motion, Dexie installed
- [x] Vitest + React Testing Library wired
- [x] Playwright config wired
- [x] ESLint 9 + Prettier configured
- [x] GitHub Actions CI: install, typecheck, lint, vitest, build
- [x] Public repo at github.com/atifali-pm/atrium
- [x] First push, CI green

### Phase 1: shell + streaming chat (DONE 2026-05-25, commit 8bf5c27)
- [x] App shell layout (top bar, left rail, main column, right panel)
- [x] Design tokens in `src/lib/tokens` exported to CSS vars + Tailwind
- [x] Light/dark/system theme toggle
- [x] SSE simulator in `src/lib/sse-simulator`
- [x] Chat store (Zustand): messages, send, cancel, retry, edit
- [x] Composer + message list + token-by-token reveal
- [x] Markdown rendering, code blocks with copy button
- [x] Vitest coverage for simulator and chat store (14 tests)
- [x] Playwright e2e for the happy path (runs in CI)
- [x] Cloudflare Pages deploy workflow (workflow_dispatch only until secrets land, commit a2acfef)
- [x] Screenshots captured, embedded in README

### Phase 2: memory + traces + first persona (DONE 2026-05-25, commit 94c67df)
- [x] Memory inspector side panel (lg+ default open, toggle in top bar)
- [x] Per-fact provenance, forget control, purge-all
- [x] Tool trace timeline drawer (collapsible peek + filters + expandable rows)
- [x] Per-call name, input, output, latency, status, slow-only filter
- [x] Persona registry with Research Analyst wired end to end; Phase 3 stubs reserved
- [ ] Portfolio site case-study entry goes live (pending Atif's go-ahead)

### Phase 3: personas + palette + theming polish
- [ ] All three personas with distinct fixtures and tools
- [ ] Persona switcher with Framer Motion transition
- [ ] Cmd+K command palette: switch persona, switch theme, jump to setting, saved prompts, recent conversations
- [ ] Theming polish, design tokens documented in Storybook

### Phase 4: voice + multimodal + canvas
- [ ] Voice input with Web Speech API + waveform
- [ ] Push-to-talk and toggle modes
- [ ] Drag-drop, paste, file attachment
- [ ] Deterministic mock image analysis
- [ ] Workspace canvas split view (markdown editor, file viewer, sandbox iframe)
- [ ] Pin-to-canvas from assistant output

### Phase 5: privacy UX + hardening
- [ ] Per-message data-scope badges (local, session, persistent)
- [ ] Visible "data stays local" indicators
- [ ] One-click session purge with confirmation
- [ ] Storybook stories for every primitive
- [ ] Playwright e2e for all 10 features
- [ ] Lighthouse CI gates in workflow
- [ ] axe-core gates in workflow

### Phase 6 (optional, on demand)
- [ ] Swap mock layer for real backend (FastAPI + LangGraph + Ollama + pgvector)
- [ ] Backend lives in its own `backend/` subdir
- [ ] No feature code in `src/` changes

## Known gotchas

- **Mock layer is the contract.** Build the SSE simulator and fixture shapes as if they were a real API. TanStack Query talks to them through a fetch wrapper, not directly. Phase 6 should be a one-file swap.
- **Vite port is locked to 5180** in `vite.config.ts` with `strictPort: true`. If it fails to start, another process holds the port; do not silently fall back to a random one.
- **Tailwind classes only in `src/**/*.{ts,tsx}` and `index.html`** per `tailwind.config.ts` content globs. Storybook stories also under `src/` qualify.
- **React 18, not 19.** The Vite template defaults to React 19. The `package.json` pins React 18 deliberately because the market hiring bar (Swisper AI and friends) is on 18 and we want zero surprises in interviews.
- **No backend.** If you find yourself reaching for Node server code, you have left the scope. The mock layer goes in `src/lib/`.
- **Phase 6 is on demand only.** Do not start it speculatively.

## Commands

```bash
npm run dev           # vite on port 5180
npm run build         # tsc -b + vite build
npm run typecheck     # tsc -b --noEmit
npm run lint          # eslint .
npm test              # vitest run
npm run test:watch    # vitest watch
npm run e2e           # playwright test
npm run storybook     # storybook on port 6080 (after Phase 1 wires storybook init)
```
