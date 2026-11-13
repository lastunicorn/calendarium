import { expect, test } from '@playwright/test'

import { clippedPages, openSection, pdfPageSizes, showLayout } from './helpers.ts'

/** PostScript points per mm: PDF sizes are in points. */
const POINTS_PER_MM = 72 / 25.4

/** A leap year, so the day layout has its 366th page. */
const YEAR = 2024

interface PrintCase {
	layout: string
	pages: number
	/** The default paper of the layout, in mm. */
	width: number
	height: number
}

// Each layout with its default settings: A4, portrait except for the month and week layouts.
// 2024 starts on a Monday and ends on a Tuesday, so it has 53 Monday weeks.
const CASES: PrintCase[] = [
	{ layout: 'yearly', pages: 1, width: 210, height: 297 },
	{ layout: 'monthly', pages: 12, width: 297, height: 210 },
	{ layout: 'weekly', pages: 53, width: 297, height: 210 },
	{ layout: 'daily', pages: 366, width: 210, height: 297 },
]

for (const { layout, pages, width, height } of CASES) {
	test(`${layout} prints ${pages} page(s) of ${width} × ${height} mm`, async ({ page }) => {
		await showLayout(page, layout, YEAR)

		// The PDF takes its paper size from the app's `@page` rule, as Chrome's print dialog does.
		const sizes = pdfPageSizes(
			await page.pdf({ preferCSSPageSize: true, printBackground: true }),
		)

		expect(sizes).toHaveLength(pages)
		for (const size of sizes) {
			expect(size.width).toBeCloseTo(width * POINTS_PER_MM, 0)
			expect(size.height).toBeCloseTo(height * POINTS_PER_MM, 0)
		}
	})

	test(`${layout} fits its content on every page`, async ({ page }) => {
		await showLayout(page, layout, YEAR)
		expect(await clippedPages(page), 'pages whose content is cut off').toEqual([])
	})
}

test('daily prints two pages per day when asked', async ({ page }) => {
	await showLayout(page, 'daily', YEAR)
	await openSection(page, 'Content')
	await page.getByRole('checkbox', { name: 'Two pages per day' }).check()

	const sizes = pdfPageSizes(await page.pdf({ preferCSSPageSize: true, printBackground: true }))
	expect(sizes).toHaveLength(2 * 366)
})

test('weekly prints two pages per week when asked', async ({ page }) => {
	await showLayout(page, 'weekly', YEAR)
	await openSection(page, 'Content')
	await page.getByRole('checkbox', { name: 'Two pages per week' }).check()

	const sizes = pdfPageSizes(await page.pdf({ preferCSSPageSize: true, printBackground: true }))
	expect(sizes).toHaveLength(2 * 53)

	await page.getByRole('radio', { name: 'Even page (second page)' }).check()
	const evenSizes = pdfPageSizes(
		await page.pdf({ preferCSSPageSize: true, printBackground: true }),
	)
	expect(evenSizes).toHaveLength(1 + 2 * 53)
})

test('weekly fits its content with both mini calendars, on one page or two', async ({ page }) => {
	await showLayout(page, 'weekly', YEAR)
	await openSection(page, 'Mini calendar')
	await page.getByRole('checkbox', { name: 'Show current month' }).check()
	await page.getByRole('checkbox', { name: 'Show next month' }).check()
	expect(await clippedPages(page), 'pages whose content is cut off').toEqual([])

	await page.emulateMedia({ media: 'screen' })
	await openSection(page, 'Content')
	await page.getByRole('checkbox', { name: 'Two pages per week' }).check()
	expect(await clippedPages(page), 'pages whose content is cut off').toEqual([])
})

test('yearly lists its events on a second page', async ({ page }) => {
	await showLayout(page, 'yearly', YEAR)
	await openSection(page, 'Events')
	await page
		.getByRole('textbox', { name: 'Events' })
		.fill('2024-03-01 Trip\n0000-12-25 Christmas\n2025-01-01 Next year')

	const sizes = pdfPageSizes(await page.pdf({ preferCSSPageSize: true, printBackground: true }))
	expect(sizes).toHaveLength(2)
	await expect(page.locator('main section').nth(1).getByRole('listitem')).toHaveCount(2)
	expect(await clippedPages(page), 'pages whose content is cut off').toEqual([])
})

// A booklet prints two pages on each side of a paper twice their size, so the 12 months fill 3
// sheets printed on both sides, and the year's single page is completed to one sheet.
const BOOKLET_CASES: PrintCase[] = [
	{ layout: 'yearly', pages: 2, width: 420, height: 297 },
	{ layout: 'monthly', pages: 6, width: 297, height: 420 },
]

for (const { layout, pages, width, height } of BOOKLET_CASES) {
	test(`${layout} prints as a booklet on ${pages} side(s) of ${width} × ${height} mm`, async ({
		page,
	}) => {
		await showLayout(page, layout, YEAR)
		await openSection(page, 'Page')
		await page.getByRole('checkbox', { name: 'Print as a booklet' }).check()

		const sizes = pdfPageSizes(
			await page.pdf({ preferCSSPageSize: true, printBackground: true }),
		)
		expect(sizes).toHaveLength(pages)
		// Chrome rounds the paper to whole CSS pixels (0.75 pt), which on A3 is more than 0.5 pt.
		for (const size of sizes) {
			expect(Math.abs(size.width - width * POINTS_PER_MM)).toBeLessThan(1)
			expect(Math.abs(size.height - height * POINTS_PER_MM)).toBeLessThan(1)
		}
		expect(await clippedPages(page), 'pages whose content is cut off').toEqual([])
	})
}
