import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { installTokenStyles } from '@/lib/tokens/install'
import './index.css'

installTokenStyles()

const root = document.getElementById('root')
if (!root) {
  throw new Error('Root element #root not found')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
