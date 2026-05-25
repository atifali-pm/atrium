import { test, expect } from '@playwright/test'

test.describe('Phase 1 streaming chat happy path', () => {
  test('sends a prompt, watches tokens stream in, sees the final message', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /welcome to atrium/i })).toBeVisible()

    const composer = page.getByRole('textbox', { name: /message/i })
    await composer.fill('hello there')
    await composer.press('Enter')

    const userMessage = page.getByTestId('message-user').first()
    await expect(userMessage).toContainText('hello there')

    const assistantMessage = page.getByTestId('message-assistant').first()
    await expect(assistantMessage).toBeVisible()
    await expect(assistantMessage).toHaveAttribute('data-status', 'streaming')
    await expect(assistantMessage).toHaveAttribute('data-status', 'done', { timeout: 15000 })
    await expect(assistantMessage).toContainText(/research analyst/i)

    await expect(page.getByRole('button', { name: /send message/i })).toBeVisible()
  })
})
