import { buildCssVarsBlock } from './index'

const STYLE_ID = 'atrium-tokens'

export function installTokenStyles(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return

  const css = `:root {\n${buildCssVarsBlock('light')}\n}\n.dark {\n${buildCssVarsBlock('dark')}\n}\n`

  const styleEl = document.createElement('style')
  styleEl.id = STYLE_ID
  styleEl.textContent = css
  document.head.appendChild(styleEl)
}
