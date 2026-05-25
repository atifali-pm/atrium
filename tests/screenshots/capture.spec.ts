import { test, expect } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const moduleDir = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.resolve(moduleDir, '../../screenshots')
const VIEWPORT = { width: 1440, height: 900 }

test.describe.configure({ mode: 'serial' })

test.use({ viewport: VIEWPORT })

function setTheme(value: 'light' | 'dark') {
  return async ({ page }: { page: import('@playwright/test').Page }) => {
    await page.addInitScript((theme) => {
      localStorage.setItem(
        'atrium:theme',
        JSON.stringify({ state: { preference: theme }, version: 0 }),
      )
    }, value)
  }
}

test('01 empty state, light theme', async ({ page }, info) => {
  await setTheme('light')({ page })
  void info
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /welcome to atrium/i })).toBeVisible()
  await page.waitForTimeout(200)
  await page.screenshot({ path: path.join(OUT_DIR, '01-empty-state-light.png'), fullPage: false })
})

test('02 research streaming with running tool call, dark theme', async ({ page }) => {
  await setTheme('dark')({ page })
  await page.goto('/')
  const composer = page.getByRole('textbox', { name: /message/i })
  await composer.fill('research the vite ecosystem')
  await composer.press('Enter')
  await page.waitForTimeout(700)
  await page.screenshot({ path: path.join(OUT_DIR, '02-research-streaming-dark.png'), fullPage: false })
})

test('03 research complete with memory fact, dark theme', async ({ page }) => {
  await setTheme('dark')({ page })
  await page.goto('/')
  const composer = page.getByRole('textbox', { name: /message/i })
  await composer.fill('research the vite ecosystem')
  await composer.press('Enter')
  const assistantMessage = page.getByTestId('message-assistant').first()
  await expect(assistantMessage).toHaveAttribute('data-status', 'done', { timeout: 25_000 })
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(OUT_DIR, '03-research-complete-dark.png'), fullPage: false })
})

test('04 trace drawer expanded with input/output, dark theme', async ({ page }) => {
  await setTheme('dark')({ page })
  await page.goto('/')
  const composer = page.getByRole('textbox', { name: /message/i })
  await composer.fill('summarize https://example.com/vite')
  await composer.press('Enter')
  const assistantMessage = page.getByTestId('message-assistant').first()
  await expect(assistantMessage).toHaveAttribute('data-status', 'done', { timeout: 25_000 })

  const drawer = page.getByTestId('trace-drawer')
  await drawer.getByRole('button', { name: /expand trace timeline/i }).click()
  await expect(drawer).toHaveAttribute('data-expanded', 'true')

  const firstTrace = page.locator('[data-trace-name="fetch_url"]').first()
  await firstTrace.getByRole('button').first().click()
  await page.waitForTimeout(200)
  await page.screenshot({ path: path.join(OUT_DIR, '04-trace-expanded-dark.png'), fullPage: false })
})

test('05 persona switcher menu open, light theme', async ({ page }) => {
  await setTheme('light')({ page })
  await page.goto('/')
  await page.getByTestId('persona-trigger').click()
  await expect(page.getByTestId('persona-menu')).toBeVisible()
  await page.waitForTimeout(150)
  await page.screenshot({ path: path.join(OUT_DIR, '05-persona-menu-light.png'), fullPage: false })
})
