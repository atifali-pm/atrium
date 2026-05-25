import { test, expect } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const moduleDir = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.resolve(moduleDir, '../../screenshots')
const VIEWPORT = { width: 1440, height: 900 }

test.describe.configure({ mode: 'serial' })

test.use({ viewport: VIEWPORT })

test('01 hero empty state, light theme', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('atrium:theme', JSON.stringify({ state: { preference: 'light' }, version: 0 }))
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /welcome to atrium/i })).toBeVisible()
  await page.waitForTimeout(200)
  await page.screenshot({ path: path.join(OUT_DIR, '01-hero-light.png'), fullPage: false })
})

test('02 streaming mid response, dark theme', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('atrium:theme', JSON.stringify({ state: { preference: 'dark' }, version: 0 }))
  })
  await page.goto('/')
  const composer = page.getByRole('textbox', { name: /message/i })
  await composer.fill('hello there')
  await composer.press('Enter')
  await expect(page.getByTestId('message-assistant').first()).toBeVisible()
  await page.waitForTimeout(550)
  await page.screenshot({ path: path.join(OUT_DIR, '02-streaming-dark.png'), fullPage: false })
})

test('03 final message with code block, dark theme', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('atrium:theme', JSON.stringify({ state: { preference: 'dark' }, version: 0 }))
  })
  await page.goto('/')
  const composer = page.getByRole('textbox', { name: /message/i })
  await composer.fill('write a debounce function in typescript')
  await composer.press('Enter')
  const assistantMessage = page.getByTestId('message-assistant').first()
  await expect(assistantMessage).toHaveAttribute('data-status', 'done', { timeout: 20_000 })
  await page.waitForTimeout(300)
  await page.screenshot({ path: path.join(OUT_DIR, '03-code-block-dark.png'), fullPage: false })
})
