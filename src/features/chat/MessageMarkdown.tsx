import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CodeBlock } from './CodeBlock'

const components: Components = {
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
  code: ({ className, children, ...rest }) => {
    const isBlock = /language-/.test(className ?? '')
    if (isBlock) {
      return (
        <code className={className} {...rest}>
          {children}
        </code>
      )
    }
    return (
      <code className="rounded bg-surface-2 px-1.5 py-0.5 text-[0.875em] text-ink-strong">
        {children}
      </code>
    )
  },
  a: ({ children, href, ...rest }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent underline underline-offset-2 hover:text-accent-strong"
      {...rest}
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-line px-3 py-2 text-left font-medium text-ink-strong">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-line-subtle px-3 py-2 text-ink">{children}</td>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-accent pl-4 italic text-ink-muted">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-line" />,
  ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => <h1 className="my-3 text-xl font-semibold text-ink-strong">{children}</h1>,
  h2: ({ children }) => <h2 className="my-3 text-lg font-semibold text-ink-strong">{children}</h2>,
  h3: ({ children }) => <h3 className="my-2 text-base font-semibold text-ink-strong">{children}</h3>,
  p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-ink-strong">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
}

export function MessageMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  )
}
