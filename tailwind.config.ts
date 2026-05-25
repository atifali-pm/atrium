import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d6dae3',
          300: '#b0b8c9',
          400: '#7d8aa3',
          500: '#566280',
          600: '#3f4a64',
          700: '#2f3850',
          800: '#1f263a',
          900: '#11162a',
        },
        accent: {
          400: '#7c9cff',
          500: '#5c7cff',
          600: '#3f5ee0',
        },
      },
    },
  },
  plugins: [animate],
}

export default config
