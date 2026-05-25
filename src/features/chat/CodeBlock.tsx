import { useRef, useState, type ReactNode } from 'react'
import { CheckIcon, CopyIcon } from '@/components/icons'

interface CodeBlockProps {
  children: ReactNode
}

function extractLanguage(children: ReactNode): string | undefined {
  if (children && typeof children === 'object' && 'props' in children) {
    const props = (children as { props?: { className?: string } }).props
    const match = /language-(\w+)/.exec(props?.className ?? '')
    return match?.[1]
  }
  return undefined
}

export function CodeBlock({ children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const preRef = useRef<HTMLPreElement>(null)
  const language = extractLanguage(children)

  const handleCopy = async () => {
    const node = preRef.current
    if (!node) return
    const text = node.innerText
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard rejected; swallow */
    }
  }

  return (
    <div className="my-3 overflow-hidden rounded-md border border-line bg-surface-2">
      <div className="flex items-center justify-between border-b border-line bg-surface-1 px-3 py-1.5 text-xs text-ink-muted">
        <span className="font-mono uppercase tracking-wider">{language ?? 'text'}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy code'}
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-ink-muted transition-colors duration-fast hover:text-ink"
        >
          {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre
        ref={preRef}
        className="scrollbar-thin overflow-x-auto p-3 text-sm leading-relaxed text-ink-strong"
      >
        {children}
      </pre>
    </div>
  )
}
