import { expect, type Page } from '@playwright/test'

/** Expands the sidebar section titled `title`, which starts collapsed. */
export async function openSection(page: Page, title: string) {
	await page.getByRole('button', { name: title, exact: true }).click()
}

/** Opens the New document dialog from the sidebar's toolbar, whose project opens in the preview. */
export async function openNewProjectDialog(page: Page) {
	await page
		.getByRole('toolbar', { name: 'Document' })
		.getByRole('button', { name: 'New document…' })
		.click()
	return page.getByRole('dialog', { name: 'New document' })
}

/**
 * Shows `layout` for `year` as a user would: creates a project of it in the New document dialog,
 * opened from the sidebar on a fresh page, picking the layout by its label ("Weekly (one week per
 * page)"), then sets the year in the sidebar.
 */
export async function showLayout(page: Page, layout: string, year: number) {
	await page.goto('/')
	const dialog = await openNewProjectDialog(page)
	await dialog.getByRole('radio', { name: new RegExp(`^${layout} `, 'i') }).check()
	await dialog.getByRole('button', { name: 'Create' }).click()
	await expect(dialog).toBeHidden()
	await expect(page.getByRole('main', { name: 'Preview' })).toBeVisible()
	await openSection(page, 'Calendar')
	const yearField = page.getByRole('spinbutton', { name: 'Year' })
	await yearField.fill(String(year))
	await expect(yearField).toHaveValue(String(year))
}

/**
 * The size of every page of a PDF, in points, from the `/MediaBox` of each page object. Chromium
 * writes them uncompressed, so no PDF library is needed.
 */
export function pdfPageSizes(pdf: Buffer): { width: number; height: number }[] {
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

/** The numbers of the pages whose content doesn't fit inside them, as printed. */
export async function clippedPages(page: Page): Promise<number[]> {
	// Print media turns off `content-visibility`, so every page is laid out as it prints.
	await page.emulateMedia({ media: 'print' })
	return page.locator('main section').evaluateAll((sections) =>
		sections.flatMap((section, index) =>
			// The same test as `useOverflow`, which only runs on screen, for visible pages.
			section.scrollHeight > section.clientHeight + 1 ||
			section.scrollWidth > section.clientWidth + 1
				? [index + 1]
				: [],
		),
	)
}

/**
 * Opens a project of `layout` with `options` as a user would, from a project file picked on a
 * fresh page, cancelling the New document dialog builds before 6.0.0's release opened by itself. The file is tagged as written
 * by 6.0.0, the first version of the project format, so later versions read it through their
 * migrations; options it leaves out take their defaults. The main area and the dialog are found by
 * their role alone, not their names, so the visual comparison can run this against an older
 * build's labels (the empty preview a fresh page showed before Documents).
 */
export async function openProjectFile(page: Page, layout: string, options: object) {
	await page.goto('/')
	await expect(page.getByRole('main')).toBeVisible()
	const dialog = page.getByRole('dialog')
	if (await dialog.isVisible()) await dialog.getByRole('button', { name: 'Cancel' }).click()
	const project = { format: 'calendarium/document', version: 6, app: '6.0.0', layout, options }
	await page.locator('input[type="file"]').setInputFiles({
		name: `${layout}.json`,
		mimeType: 'application/json',
		buffer: Buffer.from(JSON.stringify(project)),
	})
	await expect(page.locator('main section').first()).toBeVisible()
}
