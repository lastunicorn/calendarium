import { expect, type Page, test } from '@playwright/test'

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
	{ layout: 'year-per-page', pages: 1, width: 210, height: 297 },
	{ layout: 'month-per-page', pages: 12, width: 297, height: 210 },
	{ layout: 'week-per-page', pages: 53, width: 297, height: 210 },
	{ layout: 'day-per-page', pages: 366, width: 210, height: 297 },
]

/** Shows `layout` for `year` through the sidebar, as a user would. */
async function showLayout(page: Page, layout: string, year: number) {
	await page.goto('/')
	await page.getByRole('group', { name: 'Layout' }).locator('select').selectOption(layout)
	const yearField = page.getByRole('spinbutton', { name: 'Year' })
	await yearField.fill(String(year))
	await expect(yearField).toHaveValue(String(year))
}

/**
 * The size of every page of a PDF, in points, from the `/MediaBox` of each page object. Chromium
 * writes them uncompressed, so no PDF library is needed.
 */
function pdfPageSizes(pdf: Buffer): { width: number; height: number }[] {
	const text = pdf.toString('latin1')
	const pages = text.match(/\/Type\s*\/Page\b[^]*?endobj/g) ?? []
	return pages.map((page) => {
		const box = /\/MediaBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\]/.exec(page)
		if (box === null) throw new Error('A PDF page has no /MediaBox')
		return {
			width: Number(box[3]) - Number(box[1]),
			height: Number(box[4]) - Number(box[2]),
		}
	})
}

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
		// Print media turns off `content-visibility`, so every page is laid out as it prints.
		await page.emulateMedia({ media: 'print' })

		const clipped = await page.locator('main section').evaluateAll((sections) =>
			sections.flatMap((section, index) =>
				// The same test as `useOverflow`, which only runs on screen, for visible pages.
				section.scrollHeight > section.clientHeight + 1 ||
				section.scrollWidth > section.clientWidth + 1
					? [index + 1]
					: [],
			),
		)
		expect(clipped, 'pages whose content is cut off').toEqual([])
	})
}
