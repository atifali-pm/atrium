import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import App from './App'
import { useChatStore } from './stores/chat'

describe('App', () => {
  beforeEach(() => {
    useChatStore.getState().reset()
  })

  it('renders the brand and welcome state', () => {
    render(<App />)
    expect(screen.getByText(/^Atrium$/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /welcome to atrium/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /message/i })).toBeInTheDocument()
  })
})
