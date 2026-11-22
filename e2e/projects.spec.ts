import { expect, test } from '@playwright/test'

import { openNewProjectDialog } from './helpers.ts'

// What a project file carries across: saved from the app as the browser downloads it, then opened
// back through the file input once the project is gone.
test('a project saved to a file opens back with its name, layout and settings', async ({
	page,
}) => {
	await page.goto('/')
	const newProject = await openNewProjectDialog(page)
	await newProject.getByRole('textbox', { name: 'Name' }).fill('Desk 2031')
	await newProject.getByRole('radio', { name: /^Monthly / }).check()
	await newProject.getByRole('button', { name: 'Create' }).click()

	await page.getByRole('button', { name: 'Calendar', exact: true }).click()
	await page.getByRole('spinbutton', { name: 'Year' }).fill('2031')

	const project = page.getByRole('group', { name: 'Document' })
	const downloading = page.waitForEvent('download')
	await project.getByRole('button', { name: 'Save document to a file' }).click()
	const download = await downloading
	expect(download.suggestedFilename()).toBe('desk-2031.json')
	const file = await download.path()

	await project.getByRole('button', { name: 'Delete document' }).click()
	const question = page.getByRole('dialog', { name: 'Delete document' })
	await question.getByRole('button', { name: 'Delete' }).click()
	// The last project gone, Documents shows, and no dialog opens by itself.
	await expect(page.getByRole('main', { name: 'Documents' })).toBeVisible()
	await expect(page.getByRole('dialog')).toHaveCount(0)

	await page.locator('input[type="file"]').setInputFiles(file)
	await expect(project.getByRole('textbox', { name: 'Name' })).toHaveValue('Desk 2031')
	await expect(project.getByLabel('Layout')).toHaveText('Monthly (one month per page)')
	await expect(page.getByRole('spinbutton', { name: 'Year' })).toHaveValue('2031')
	await expect(page.locator('main section')).toHaveCount(12)
})
