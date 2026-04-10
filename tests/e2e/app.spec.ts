import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

test.describe('DoctorFormAssist — full user flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('page loads with correct title and key elements', async ({ page }) => {
    await expect(page).toHaveTitle(/DoctorFormAssist/)
    await expect(page.getByText('DoctorFormAssist')).toBeVisible()
    await expect(page.getByLabelText(/date/i)).toBeVisible()
    await expect(page.getByLabelText(/doctor/i)).toBeVisible()
    await expect(page.getByLabelText(/patient name/i)).toBeVisible()
  })

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.getByText('Add to Queue').click()
    await expect(page.getByText(/patient name is required/i)).toBeVisible()
  })

  test('adds a patient to the queue', async ({ page }) => {
    await page.getByLabelText(/date/i).fill('2025-04-12')
    await page.getByLabelText(/doctor/i).fill('Sharma')
    await page.getByLabelText(/patient name/i).fill('Rahul Mehta')
    await page.getByLabel('CBC — Complete Blood Count').check()
    await page.getByLabel('LFT — Liver Function Test').check()
    await page.getByText('Add to Queue').click()

    await expect(page.getByText('Rahul Mehta')).toBeVisible()
    await expect(page.getByText('2 PDFs will be generated')).toBeVisible()
  })

  test('removes a patient from the queue', async ({ page }) => {
    await page.getByLabelText(/date/i).fill('2025-04-12')
    await page.getByLabelText(/doctor/i).fill('Sharma')
    await page.getByLabelText(/patient name/i).fill('Test Patient')
    await page.getByLabel('CBC — Complete Blood Count').check()
    await page.getByText('Add to Queue').click()

    await expect(page.getByText('Test Patient')).toBeVisible()
    await page.getByRole('button', { name: /remove test patient/i }).click()
    await expect(page.getByText('Test Patient')).not.toBeVisible()
  })

  test('download button is disabled with empty queue', async ({ page }) => {
    await expect(page.getByRole('button', { name: /download zip/i })).toBeDisabled()
  })

  test('download button enables after patient added', async ({ page }) => {
    await page.getByLabelText(/date/i).fill('2025-04-12')
    await page.getByLabelText(/doctor/i).fill('Sharma')
    await page.getByLabelText(/patient name/i).fill('Priya Shah')
    await page.getByLabel('TFT — Thyroid Function Test').check()
    await page.getByText('Add to Queue').click()
    await expect(page.getByRole('button', { name: /download zip/i })).toBeEnabled()
  })

  test('downloads a ZIP file on click', async ({ page }) => {
    await page.getByLabelText(/date/i).fill('2025-04-12')
    await page.getByLabelText(/doctor/i).fill('Sharma')
    await page.getByLabelText(/patient name/i).fill('Test Patient')
    await page.getByLabel('CBC — Complete Blood Count').check()
    await page.getByText('Add to Queue').click()

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /download zip/i }).click(),
    ])

    expect(download.suggestedFilename()).toMatch(/lab_reports_.*\.zip/)
    const filePath = await download.path()
    expect(filePath).toBeTruthy()
    const stats = fs.statSync(filePath!)
    expect(stats.size).toBeGreaterThan(0)
  })
})
