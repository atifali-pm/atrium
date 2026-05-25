import { test, expect } from '@playwright/test'

test.describe('Phase 2 trace timeline and memory inspector', () => {
  test('research prompt produces a tool trace and a forgettable memory fact', async ({ page }) => {
    test.setTimeout(40_000)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')

    await expect(page.getByTestId('memory-inspector')).toBeVisible()

    const composer = page.getByRole('textbox', { name: /message/i })
    await composer.fill('research the vite ecosystem')
    await composer.press('Enter')

    const assistantMessage = page.getByTestId('message-assistant').first()
    await expect(assistantMessage).toHaveAttribute('data-status', 'done', { timeout: 30_000 })

    const traceDrawer = page.getByTestId('trace-drawer')
    await expect(traceDrawer).toBeVisible()
    await expect(traceDrawer).toContainText(/1 call/)

    const drawerToggle = traceDrawer.getByRole('button', { name: /expand trace timeline/i })
    await drawerToggle.click()
    await expect(traceDrawer).toHaveAttribute('data-expanded', 'true')

    const searchTrace = page.locator('[data-trace-name="search_web"]').first()
    await expect(searchTrace).toBeVisible()
    await expect(searchTrace).toHaveAttribute('data-trace-status', 'ok')

    const memoryInspector = page.getByTestId('memory-inspector')
    const fact = memoryInspector.locator('[data-fact-key="research.last_topic"]')
    await expect(fact).toBeVisible()
    await expect(fact).toContainText('the vite ecosystem')

    const forgetButton = fact.getByRole('button', { name: /forget/i })
    await forgetButton.click()
    await expect(fact).toBeHidden()
    await expect(memoryInspector).toContainText(/no facts yet/i)
  })
})
