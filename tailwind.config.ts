import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'
import { tokens } from './src/lib/tokens'

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: tokens.font.sans.split(',').map((s) => s.trim().replace(/^"|"$/g, '')),
        mono: tokens.font.mono.split(',').map((s) => s.trim().replace(/^"|"$/g, '')),
      },
      colors: {
        surface: {
          0: 'var(--color-surface-0)',
          1: 'var(--color-surface-1)',
          2: 'var(--color-surface-2)',
          3: 'var(--color-surface-3)',
        },
        ink: {
          DEFAULT: 'var(--color-ink)',
          strong: 'var(--color-ink-strong)',
          muted: 'var(--color-ink-muted)',
          subtle: 'var(--color-ink-subtle)',
          inverse: 'var(--color-ink-inverse)',
        },
        line: {
          DEFAULT: 'var(--color-line)',
          strong: 'var(--color-line-strong)',
          subtle: 'var(--color-line-subtle)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          strong: 'var(--color-accent-strong)',
          soft: 'var(--color-accent-soft)',
          ink: 'var(--color-accent-ink)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          soft: 'var(--color-danger-soft)',
        },
      },
      borderRadius: {
        sm: tokens.radius.sm,
        md: tokens.radius.md,
        lg: tokens.radius.lg,
        xl: tokens.radius.xl,
        '2xl': tokens.radius['2xl'],
      },
      boxShadow: {
        sm: tokens.shadow.sm,
        md: tokens.shadow.md,
        lg: tokens.shadow.lg,
      },
      ringColor: {
        DEFAULT: 'var(--color-ring)',
      },
      transitionTimingFunction: {
        atrium: tokens.motion.easing,
      },
      transitionDuration: {
        fast: tokens.motion.fast,
        base: tokens.motion.base,
        slow: tokens.motion.slow,
      },
    },
  },
  plugins: [animate],
}

export default config
