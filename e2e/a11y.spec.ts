import { AxeBuilder } from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { openSection, showLayout } from './helpers.ts'

// The app's own interface checked by axe (WCAG 2.x A and AA rules) in both themes, so a color too
// faint, a button without a name or a broken ARIA reference fails the tests. The printed pages,
// `main section`, are left out: they are a document drawn as paper, not an interface, and some of
// what axe flags there is meant (an `h1` on every page, the other months' days in light gray).

/** The layouts, by the start of their label in the New document dialog. */
const LAYOUTS = ['yearly', 'monthly', 'weekly', 'daily']

/** The system's schemes, which the app's theme follows by default. */
const THEMES = ['light', 'dark'] as const

const OPEN_DIALOG = 'dialog[open]'

/** A leap year starting on a Monday, as in `print.spec.ts`. */
const YEAR = 2024

/**
 * The violations of `serious` or `critical` impact in the elements `include` selects (the whole
 * app by default; the sidebar; an open dialog, `dialog[open]`, all a user can reach then).
 */
async function violations(page: Page, include?: string) {
	let axe = new AxeBuilder({ page })
		.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
		.exclude('main section')
	if (include !== undefined) axe = axe.include(include)
	const results = await axe.analyze()
	return results.violations
		.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
		.map((violation) => ({
			rule: violation.id,
			help: violation.help,
			targets: violation.nodes.map((node) => node.target.join(' ')),
		}))
}

for (const colorScheme of THEMES) {
	test.describe(`in the ${colorScheme} theme`, () => {
		test.use({ colorScheme })

		test('Documents on a first launch, and the New document dialog', async ({ page }) => {
			await page.goto('/')
			const documents = page.getByRole('main', { name: 'Documents' })
			await expect(documents).toBeVisible()
			expect(await violations(page)).toEqual([])

			await documents.getByRole('button', { name: 'New document…' }).click()
			const dialog = page.getByRole('dialog', { name: 'New document' })
			await expect(dialog).toBeVisible()
			expect(await violations(page, OPEN_DIALOG)).toEqual([])
		})

		test('Documents with documents, another one than the current chosen', async ({ page }) => {
			await showLayout(page, 'monthly', YEAR)
			await page.getByRole('button', { name: 'Manage documents' }).click()
			const documents = page.getByRole('main', { name: 'Documents' })
			await expect(documents).toBeVisible()
			// Added from Documents, so chosen there, the current one tagged on its own row.
			await documents.getByRole('button', { name: 'New document…' }).click()
			await page
				.getByRole('dialog', { name: 'New document' })
				.getByRole('button', { name: 'Create' })
				.click()
			await expect(documents.getByRole('radio', { description: 'Current' })).not.toBeChecked()
			expect(await violations(page)).toEqual([])
		})

		for (const layout of LAYOUTS) {
			test(`the ${layout} layout's sidebar, each section open in turn`, async ({ page }) => {
				await showLayout(page, layout, YEAR)
				await expect(page.locator('main section').first()).toBeVisible()
				expect(await violations(page)).toEqual([])
				const sidebar = page.locator('aside')
				// The sections' titles as written, not as shown, in capitals; opening one section
				// closes the one open before.
				const titles = await sidebar
					.locator('legend button[aria-expanded]')
					.allTextContents()
				expect(titles.length).toBeGreaterThan(0)
				for (const title of titles) {
					const toggle = sidebar.getByRole('button', { name: title, exact: true })
					if ((await toggle.getAttribute('aria-expanded')) !== 'true') {
						await openSection(page, title)
					}
					await expect(toggle).toHaveAttribute('aria-expanded', 'true')
					// The sidebar alone, not walking the preview's hundreds of pages each time.
					expect(await violations(page, 'aside'), title).toEqual([])
				}
			})
		}

		test('the confirmation of a section reset', async ({ page }) => {
			await showLayout(page, 'monthly', YEAR)
			await page.getByRole('button', { name: 'Reset Calendar settings' }).click()
			await expect(page.getByRole('alertdialog')).toBeVisible()
			expect(await violations(page)).toEqual([])
		})

		test('the Delete document dialog', async ({ page }) => {
			await showLayout(page, 'monthly', YEAR)

			await page.getByRole('button', { name: 'Delete document' }).click()
			const remove = page.getByRole('dialog', { name: 'Delete document' })
			await expect(remove).toBeVisible()
			expect(await violations(page, OPEN_DIALOG)).toEqual([])
		})

		test('the Overwrite document dialog', async ({ page }) => {
			await showLayout(page, 'monthly', YEAR)
			const download = page.waitForEvent('download')
			await page.getByRole('button', { name: 'Save document to a file' }).click()
			const file = await (await download).path()

			await page.locator('input[type="file"]').setInputFiles(file)
			const overwrite = page.getByRole('dialog', { name: 'Overwrite document' })
			await expect(overwrite).toBeVisible()
			expect(await violations(page, OPEN_DIALOG)).toEqual([])
		})
	})
}
