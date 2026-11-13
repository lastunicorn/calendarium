import { expect, test, type Locator, type Page } from '@playwright/test'

import { openProjectFile, showLayout } from './helpers.ts'

// The preview's behavior on screen, run in Chromium and Firefox (`playwright.config.ts`): the code
// has paths for Firefox (wheel deltas counted in lines, `LINE_PX`; no week data in old versions,
// `localeWeekStart`; container units resolved against the sheet when printing, `Squares.module.css`)
// that only a real browser exercises. Nothing here prints to PDF, which only Chromium can.

/** A leap year starting on a Monday, as in `print.spec.ts`. */
const YEAR = 2024

/** The zoom level the menu shows, as its option's value: `100`, `125`, `fit-page`, … */
function zoomLevel(page: Page): Locator {
	return page.getByRole('combobox', { name: 'Zoom level' })
}

/** The layout box of `locator`, which must be on the page. */
async function box(locator: Locator) {
	const found = await locator.boundingBox()
	if (found === null) throw new Error('Not laid out')
	return found
}

test('Ctrl and the wheel over the preview zoom the pages, not the app', async ({ page }) => {
	await showLayout(page, 'monthly', YEAR)
	await expect(zoomLevel(page)).toHaveValue('100')
	const pageWidth = (await box(page.locator('main section').first())).width

	await page.getByRole('main', { name: 'Preview' }).hover()
	await page.keyboard.down('Control')
	await page.mouse.wheel(0, -300)
	await page.keyboard.up('Control')

	// Smoothly, through every percent, so the level falls between the menu's.
	await expect(zoomLevel(page)).not.toHaveValue('100')
	const zoom = Number(await zoomLevel(page).inputValue())
	expect(zoom).toBeGreaterThan(100)
	expect((await box(page.locator('main section').first())).width).toBeCloseTo(
		(pageWidth * zoom) / 100,
		-1,
	)
	// The browser's own zoom was prevented: the sidebar keeps its size.
	expect(await page.evaluate(() => window.devicePixelRatio)).toBe(1)
})

test('Ctrl and + or 0 zoom the preview while it has the focus', async ({ page }) => {
	await showLayout(page, 'monthly', YEAR)
	await page.getByRole('main', { name: 'Preview' }).focus()

	await page.keyboard.press('Control+=')
	await expect(zoomLevel(page)).toHaveValue('125')
	await page.keyboard.press('Control+0')
	await expect(zoomLevel(page)).toHaveValue('100')
})

test('facing pages show as spreads, the first page alone', async ({ page }) => {
	await openProjectFile(page, 'weekly', {
		calendar: { year: YEAR, locale: 'en-GB', weekStart: 'auto' },
		content: { twoPages: true },
		page: { spine: 'left' },
	})
	const pages = page.locator('main section')
	const [first, second, third] = await Promise.all([0, 1, 2].map((n) => box(pages.nth(n))))

	// The second page faces the third across the spine, and the first is on the third's side.
	expect(second.y).toBeCloseTo(third.y, 0)
	expect(third.x).toBeGreaterThan(second.x + second.width)
	expect(first.x).toBeCloseTo(third.x, 0)
	expect(first.y + first.height).toBeLessThan(second.y)
})

for (const { locale, firstDay } of [
	{ locale: 'en-US', firstDay: 'Sun' },
	{ locale: 'en-GB', firstDay: 'Mon' },
]) {
	test(`weeks start on the language's day: ${firstDay} in ${locale}`, async ({ page }) => {
		await openProjectFile(page, 'monthly', {
			calendar: { year: YEAR, locale, weekStart: 'auto' },
			content: { weekdayFormat: 'short' },
		})
		// The grid's weekday names, in capitals, after the mini month's initials.
		const text = await page.locator('main section').first().innerText()
		const weekdays = text.match(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/gi)
		expect(weekdays?.[0]).toBe(firstDay.toUpperCase())
	})
}

test('the grid of squares stays inside the margins in print', async ({ page }) => {
	await openProjectFile(page, 'daily', {
		calendar: { year: YEAR, locale: 'en-GB', weekStart: 'auto' },
		content: { fill: 'squares' },
	})
	await page.emulateMedia({ media: 'print' })
	const sheet = page.locator('main section').first()
	const grid = sheet.locator('[class*="squareGrid"]')
	const [sheetBox, gridBox] = await Promise.all([box(sheet), box(grid)])
	const margins = await sheet.evaluate((section) => {
		const style = getComputedStyle(section)
		return {
			top: Number.parseFloat(style.paddingTop),
			right: Number.parseFloat(style.paddingRight),
			bottom: Number.parseFloat(style.paddingBottom),
			left: Number.parseFloat(style.paddingLeft),
		}
	})

	// Half a pixel for the line its tracks may round past its edge.
	expect(gridBox.x).toBeGreaterThanOrEqual(sheetBox.x + margins.left - 0.5)
	expect(gridBox.y).toBeGreaterThanOrEqual(sheetBox.y + margins.top - 0.5)
	expect(gridBox.x + gridBox.width).toBeLessThanOrEqual(
		sheetBox.x + sheetBox.width - margins.right + 0.5,
	)
	expect(gridBox.y + gridBox.height).toBeLessThanOrEqual(
		sheetBox.y + sheetBox.height - margins.bottom + 0.5,
	)
})
