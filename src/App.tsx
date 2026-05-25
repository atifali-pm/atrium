export default function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="mx-auto max-w-2xl space-y-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-400">Phase 0 scaffold</p>
        <h1 className="text-4xl font-semibold sm:text-5xl">Atrium</h1>
        <p className="text-lg text-ink-500 dark:text-ink-300">
          A privacy-first AI assistant workspace. Streaming chat, memory inspection, tool traces,
          persona switching, voice, all in a polished React 18 + Vite + TypeScript shell.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm text-ink-500 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300">
          <span className="h-2 w-2 rounded-full bg-accent-500" aria-hidden />
          Hello, Atrium. Build starts at Phase 1.
        </div>
      </div>
    </main>
  )
}
