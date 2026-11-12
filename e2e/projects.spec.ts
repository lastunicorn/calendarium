import { expect, test } from '@playwright/test'

// What a project file carries across: saved from the app as the browser downloads it, then opened
// back through the file input once the project is gone.
test('a project saved to a file opens back with its name, layout and settings', async ({
	page,
}) => {
	await page.goto('/')
	const newProject = page.getByRole('dialog', { name: 'New project' })
	await newProject.getByRole('textbox', { name: 'Name' }).fill('Desk 2031')
	await newProject.getByRole('radio', { name: /^Monthly / }).check()
	await newProject.getByRole('button', { name: 'Create' }).click()

	await page.getByRole('button', { name: 'Calendar', exact: true }).click()
	await page.getByRole('spinbutton', { name: 'Year' }).fill('2031')

	const project = page.getByRole('group', { name: 'Project' })
	const downloading = page.waitForEvent('download')
	await project.getByRole('button', { name: 'Save project to a file' }).click()
	const download = await downloading
	expect(download.suggestedFilename()).toBe('desk-2031.json')
	const file = await download.path()

	await project.getByRole('button', { name: 'Delete project' }).click()
	const question = page.getByRole('dialog', { name: 'Delete project' })
	await question.getByRole('button', { name: 'Delete' }).click()
	// The last project gone, the app asks for a new one.
	await newProject.getByRole('button', { name: 'Cancel' }).click()
	await expect(project.getByRole('button', { name: 'Change project…' })).toHaveCount(0)

	await page.locator('input[type="file"]').setInputFiles(file)
	await expect(project.getByRole('textbox', { name: 'Name' })).toHaveValue('Desk 2031')
	await expect(project.getByText('Layout: Monthly', { exact: false })).toBeVisible()
	await expect(page.getByRole('spinbutton', { name: 'Year' })).toHaveValue('2031')
	await expect(page.locator('main section')).toHaveCount(12)
})
