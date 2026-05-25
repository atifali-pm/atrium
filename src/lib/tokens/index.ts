export type ThemeName = 'light' | 'dark'

export const tokens = {
  color: {
    light: {
      surface0: '#ffffff',
      surface1: '#f6f8fc',
      surface2: '#eef1f7',
      surface3: '#e3e7f0',
      ink: {
        strong: '#0b1024',
        default: '#1f2742',
        muted: '#5a6685',
        subtle: '#8a96b3',
        inverse: '#ffffff',
      },
      line: {
        default: '#dee3ee',
        strong: '#c5cddc',
        subtle: '#edf0f6',
      },
      accent: {
        default: '#5c7cff',
        strong: '#3f5ee0',
        soft: '#e8edff',
        ink: '#ffffff',
      },
      danger: {
        default: '#dc2640',
        soft: '#ffeaee',
      },
      ring: '#5c7cff',
    },
    dark: {
      surface0: '#080c1c',
      surface1: '#0f1428',
      surface2: '#161d36',
      surface3: '#202849',
      ink: {
        strong: '#f3f6ff',
        default: '#d7defb',
        muted: '#9ba6c8',
        subtle: '#6c779a',
        inverse: '#080c1c',
      },
      line: {
        default: '#222a48',
        strong: '#384268',
        subtle: '#161d36',
      },
      accent: {
        default: '#7c9cff',
        strong: '#a4b9ff',
        soft: 'rgba(124,156,255,0.16)',
        ink: '#080c1c',
      },
      danger: {
        default: '#ff5872',
        soft: 'rgba(255,88,114,0.18)',
      },
      ring: '#7c9cff',
    },
  },
  radius: {
    sm: '0.375rem',
    md: '0.625rem',
    lg: '0.875rem',
    xl: '1.25rem',
    '2xl': '1.75rem',
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 2px rgba(11, 16, 36, 0.06), 0 1px 1px rgba(11, 16, 36, 0.04)',
    md: '0 8px 24px rgba(11, 16, 36, 0.08), 0 2px 6px rgba(11, 16, 36, 0.04)',
    lg: '0 20px 48px rgba(11, 16, 36, 0.16), 0 4px 12px rgba(11, 16, 36, 0.06)',
  },
  motion: {
    fast: '120ms',
    base: '200ms',
    slow: '360ms',
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    streamTokenDelayMs: 22,
    streamTokenJitterMs: 18,
  },
  font: {
    sans: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  },
} as const

export type Tokens = typeof tokens

interface ColorPalette {
  surface0: string
  surface1: string
  surface2: string
  surface3: string
  ink: {
    strong: string
    default: string
    muted: string
    subtle: string
    inverse: string
  }
  line: {
    default: string
    strong: string
    subtle: string
  }
  accent: {
    default: string
    strong: string
    soft: string
    ink: string
  }
  danger: {
    default: string
    soft: string
  }
  ring: string
}

function flattenColors(palette: ColorPalette): Record<string, string> {
  return {
    '--color-surface-0': palette.surface0,
    '--color-surface-1': palette.surface1,
    '--color-surface-2': palette.surface2,
    '--color-surface-3': palette.surface3,
    '--color-ink-strong': palette.ink.strong,
    '--color-ink': palette.ink.default,
    '--color-ink-muted': palette.ink.muted,
    '--color-ink-subtle': palette.ink.subtle,
    '--color-ink-inverse': palette.ink.inverse,
    '--color-line': palette.line.default,
    '--color-line-strong': palette.line.strong,
    '--color-line-subtle': palette.line.subtle,
    '--color-accent': palette.accent.default,
    '--color-accent-strong': palette.accent.strong,
    '--color-accent-soft': palette.accent.soft,
    '--color-accent-ink': palette.accent.ink,
    '--color-danger': palette.danger.default,
    '--color-danger-soft': palette.danger.soft,
    '--color-ring': palette.ring,
  }
}

function motionVars(): Record<string, string> {
  return {
    '--motion-fast': tokens.motion.fast,
    '--motion-base': tokens.motion.base,
    '--motion-slow': tokens.motion.slow,
    '--motion-easing': tokens.motion.easing,
  }
}

export function buildCssVarsBlock(theme: ThemeName): string {
  const vars = { ...flattenColors(tokens.color[theme]), ...motionVars() }
  return Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')
}
