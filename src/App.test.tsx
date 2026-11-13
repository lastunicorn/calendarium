import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { defaultLayoutOptions, LAYOUT_IDS } from './layouts'
import { LAYOUT_VIEWS } from './ui/layouts/registry'
import { LEGACY_FILE_FORMAT } from './workspace/legacy'
import type { Project } from './workspace/Project'
import { serializeProject } from './workspace/projectDocument'

const ID = '3f0c9a52-7d1e-4b8a-9c61-2e5f4a8b7d10'

/** The always open "Project" section. */
function projectSection(): HTMLElement {
	return screen.getByRole('group', { name: 'Project' })
}

/** The Change project button. */
function changeProjectButton(): HTMLButtonElement {
	return within(projectSection()).getByRole('button', { name: 'Change project…' })
}

/** The Open project dialog's radios, opened from Change project. */
function openProjectRadios(): HTMLInputElement[] {
	fireEvent.click(changeProjectButton())
	return within(dialog('Open project')).getAllByRole<HTMLInputElement>('radio')
}

/** Cancels the Open project dialog. */
function cancelOpenProject() {
	fireEvent.click(within(dialog('Open project')).getByRole('button', { name: 'Cancel' }))
}

/** A radio's label: "Work 2027 — Weekly". */
function radioLabel(radio: HTMLInputElement): string {
	return radio.closest('label')!.textContent
}

/** The projects the Open project dialog lists, in its order; it is opened and cancelled. */
function projectLabels(): string[] {
	const labels = openProjectRadios().map(radioLabel)
	cancelOpenProject()
	return labels
}

/** The open project's label, the one the Open project dialog checks; it is opened and cancelled. */
function openLabel(): string {
	const label = radioLabel(openProjectRadios().find((radio) => radio.checked)!)
	cancelOpenProject()
	return label
}

/** Opens the project labeled `label` from the Open project dialog. */
function pick(label: string) {
	fireEvent.click(changeProjectButton())
	const openProject = dialog('Open project')
	fireEvent.click(within(openProject).getByRole('radio', { name: label }))
	fireEvent.click(within(openProject).getByRole('button', { name: 'Open' }))
}

/** Clicks the project action labeled `label`. */
function clickAction(label: string) {
	fireEvent.click(within(projectSection()).getByRole('button', { name: label }))
}

/** The open dialog named `name`. */
function dialog(name: string): HTMLElement {
	return screen.getByRole('dialog', { name })
}

/** Whether Print is disabled. */
function printDisabled(): boolean {
	return screen.getByRole<HTMLButtonElement>('button', { name: 'Print' }).disabled
}

/** Creates a project through the New project dialog, opening it first. */
function createProject(name: string, layout: Project['layout']) {
	clickAction('New project…')
	const newProject = dialog('New project')
	fireEvent.change(within(newProject).getByRole('textbox', { name: 'Name' }), {
		target: { value: name },
	})
	fireEvent.click(within(newProject).getByRole('radio', { name: LAYOUT_VIEWS[layout].label }))
	fireEvent.click(within(newProject).getByRole('button', { name: 'Create' }))
}

/** Renders the app with no project, and cancels the New project dialog it opens. */
function renderEmpty() {
	const rendered = render(<App />)
	fireEvent.click(within(dialog('New project')).getByRole('button', { name: 'Cancel' }))
	return rendered
}

/** Chooses a file in the project section's hidden file input, as the open button's dialog would. */
function chooseProjectFile(container: HTMLElement, text: string, fileName = 'project.json') {
	const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
	fireEvent.change(input, { target: { files: [new File([text], fileName)] } })
}

/** Expands the sidebar section titled `title`, which starts collapsed. */
function openSection(title: string) {
	fireEvent.click(screen.getByRole('button', { name: title }))
}

/** The Year field's value; the Calendar section must be open. */
function year(): string {
	return screen.getByLabelText<HTMLInputElement>('Year').value
}

/** A monthly project file of `year`, named `name`, with the id `id`. */
function monthlyFile(id: string, name: string, year: number): string {
	const defaults = defaultLayoutOptions('monthly')
	const options = { ...defaults, calendar: { ...defaults.calendar, year } }
	return serializeProject({ id, name, layout: 'monthly', options }, { pretty: true })
}

const THIS_YEAR = String(new Date().getFullYear())

describe('App without a project', () => {
	it('asks for a new project on a first launch, the first layout chosen, with nothing to print', () => {
		render(<App />)
		const chosen = within(dialog('New project')).getByRole('radio', { checked: true })
		expect(chosen.closest('label')?.textContent).toBe(LAYOUT_VIEWS[LAYOUT_IDS[0]].label)
		expect(printDisabled()).toBe(true)
		expect(screen.getByRole('main', { name: 'Preview' }).textContent).toContain(
			'No project is open.',
		)
	})

	it('creates nothing when the dialog is cancelled, and opens it again from the preview', () => {
		renderEmpty()
		expect(screen.queryByRole('dialog')).toBeNull()
		expect(
			within(projectSection()).queryByRole('button', { name: 'Change project…' }),
		).toBeNull()
		expect(printDisabled()).toBe(true)
		expect(Object.keys(localStorage)).toEqual([])

		const preview = screen.getByRole('main', { name: 'Preview' })
		fireEvent.click(within(preview).getByRole('button', { name: 'New project…' }))
		expect(dialog('New project')).not.toBeNull()
	})
})

describe('App new project', () => {
	it.each(LAYOUT_IDS)('creates a named and an unnamed %s project, each opened', (layout) => {
		const { container } = renderEmpty()
		const { name, label } = LAYOUT_VIEWS[layout]
		createProject('Ours', layout)
		expect(screen.queryByRole('dialog')).toBeNull()
		expect(projectLabels()).toEqual([`Ours — ${name}`])
		expect(screen.getByLabelText('Layout').textContent).toBe(label)
		expect(printDisabled()).toBe(false)
		expect(container.querySelectorAll('main section').length).toBeGreaterThan(0)

		createProject('', layout)
		expect(projectLabels()).toEqual([`Ours — ${name}`, `Untitled — ${name}`])
		expect(openLabel()).toBe(`Untitled — ${name}`)
		const nameField = within(projectSection()).getByRole<HTMLInputElement>('textbox', {
			name: 'Name',
		})
		expect(nameField.value).toBe('')
	})

	it('focuses Change project once created from the empty preview', () => {
		renderEmpty()
		const preview = screen.getByRole('main', { name: 'Preview' })
		const button = within(preview).getByRole('button', { name: 'New project…' })
		// A click focuses the button it lands on.
		button.focus()
		fireEvent.click(button)
		fireEvent.click(within(dialog('New project')).getByRole('button', { name: 'Create' }))
		expect(button.isConnected).toBe(false)
		expect(document.activeElement).toBe(changeProjectButton())
	})

	it('focuses Change project once created on a first launch', () => {
		render(<App />)
		fireEvent.click(within(dialog('New project')).getByRole('button', { name: 'Create' }))
		expect(document.activeElement).toBe(changeProjectButton())
	})

	it('gives the focus back to New project once created from it', () => {
		renderEmpty()
		createProject('Home', 'yearly')
		const button = within(projectSection()).getByRole('button', { name: 'New project…' })
		button.focus()
		fireEvent.click(button)
		fireEvent.click(within(dialog('New project')).getByRole('button', { name: 'Create' }))
		expect(document.activeElement).toBe(button)
	})

	it('creates nothing when cancelled', () => {
		renderEmpty()
		createProject('Home', 'yearly')
		clickAction('New project…')
		fireEvent.click(within(dialog('New project')).getByRole('button', { name: 'Close' }))
		expect(screen.queryByRole('dialog')).toBeNull()
		expect(projectLabels()).toEqual(['Home — Yearly'])
	})
})

describe('App projects', () => {
	it('changes the open project from Change project, the form following', () => {
		renderEmpty()
		createProject('Wall', 'yearly')
		createProject('Desk', 'monthly')
		openSection('Calendar')
		fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2030' } })
		expect(year()).toBe('2030')

		pick('Wall — Yearly')
		expect(screen.queryByRole('dialog')).toBeNull()
		expect(openLabel()).toBe('Wall — Yearly')
		expect(screen.getByLabelText('Layout').textContent).toBe(
			'Yearly (the whole year on one page)',
		)
		expect(year()).toBe(THIS_YEAR)

		pick('Desk — Monthly')
		expect(year()).toBe('2030')
	})

	it('lists the projects with the open one checked and focused, and opens nothing when cancelled', () => {
		renderEmpty()
		createProject('Wall', 'yearly')
		createProject('Desk', 'monthly')
		changeProjectButton().focus()
		fireEvent.click(changeProjectButton())
		const openProject = dialog('Open project')
		const desk = within(openProject).getByRole<HTMLInputElement>('radio', {
			name: 'Desk — Monthly',
		})
		expect(desk.checked).toBe(true)
		expect(document.activeElement).toBe(desk)

		fireEvent.click(within(openProject).getByRole('radio', { name: 'Wall — Yearly' }))
		fireEvent.click(within(openProject).getByRole('button', { name: 'Close' }))
		expect(screen.queryByRole('dialog')).toBeNull()
		expect(openLabel()).toBe('Desk — Monthly')
		expect(document.activeElement).toBe(changeProjectButton())
	})

	it('renames the open project, the Open project dialog following', () => {
		renderEmpty()
		createProject('b', 'yearly')
		createProject('c', 'weekly')
		const name = within(projectSection()).getByRole('textbox', { name: 'Name' })
		fireEvent.change(name, { target: { value: 'a' } })
		expect(projectLabels()).toEqual(['a — Weekly', 'b — Yearly'])
		expect(openLabel()).toBe('a — Weekly')
	})

	it('asks before deleting a project, keeps it on Cancel, and opens its neighbor on Delete', () => {
		renderEmpty()
		createProject('a', 'yearly')
		createProject('b', 'monthly')
		createProject('c', 'daily')
		pick('b — Monthly')

		clickAction('Delete project')
		const question = dialog('Delete project')
		expect(question.textContent).toContain(
			'Delete “b”? It can’t be undone; save it to a file first to keep it.',
		)
		fireEvent.click(within(question).getByRole('button', { name: 'Cancel' }))
		expect(projectLabels()).toEqual(['a — Yearly', 'b — Monthly', 'c — Daily'])

		clickAction('Delete project')
		fireEvent.click(within(dialog('Delete project')).getByRole('button', { name: 'Delete' }))
		expect(projectLabels()).toEqual(['a — Yearly', 'c — Daily'])
		expect(openLabel()).toBe('c — Daily')
	})

	it('asks for a new project once the last one is deleted', () => {
		renderEmpty()
		createProject('', 'yearly')
		clickAction('Delete project')
		expect(dialog('Delete project').textContent).toContain('Delete “Untitled”?')
		fireEvent.click(within(dialog('Delete project')).getByRole('button', { name: 'Delete' }))
		expect(dialog('New project')).not.toBeNull()
		expect(within(projectSection()).queryByRole('combobox')).toBeNull()
		expect(printDisabled()).toBe(true)
	})

	it('restores only an open section’s defaults once its reset is confirmed', () => {
		renderEmpty()
		createProject('Desk', 'monthly')
		openSection('Calendar')
		fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2030' } })
		fireEvent.click(screen.getByRole('button', { name: 'Reset Calendar settings' }))
		const question = screen.getByRole('alertdialog', {
			name: 'Reset Calendar settings to their defaults?',
		})
		fireEvent.click(within(question).getByRole('button', { name: 'Reset' }))
		expect(screen.queryByRole('alertdialog')).toBeNull()
		expect(year()).toBe(THIS_YEAR)
		expect(projectLabels()).toEqual(['Desk — Monthly'])
	})
})

describe('App open project file', () => {
	it('adds a file without an id as a new project, named after a legacy file, and opens it', async () => {
		const { container } = renderEmpty()
		createProject('Home', 'yearly')
		const legacy = JSON.stringify({
			format: LEGACY_FILE_FORMAT,
			version: 5,
			layout: 'week-per-page',
			year: 2030,
			firstHour: 25,
		})
		chooseProjectFile(container, legacy, 'Work 2030.json')

		await waitFor(() =>
			expect(projectLabels()).toEqual(['Home — Yearly', 'Work 2030 — Weekly']),
		)
		expect(openLabel()).toBe('Work 2030 — Weekly')
		expect(screen.getByRole('status').textContent).toBe(
			'Opened Work 2030.json; 1 setting was invalid and kept the default: content.schedule.firstHour.',
		)
		openSection('Calendar')
		expect(year()).toBe('2030')
	})

	it('adds a file with an id not in the list under its id, and draws its pages', async () => {
		const { container } = renderEmpty()
		chooseProjectFile(container, monthlyFile(ID, 'Desk', 2030), 'desk.json')
		await waitFor(() => expect(projectLabels()).toEqual(['Desk — Monthly']))
		// Kept under the file's id.
		await waitFor(() =>
			expect(localStorage.getItem(`calendarium-project:${ID}`)).not.toBeNull(),
		)
		expect(container.querySelectorAll('main section')).toHaveLength(12)
		expect(screen.queryByRole('alert')).toBeNull()
		expect(screen.queryByRole('dialog')).toBeNull()
	})

	it('asks before overwriting the project with the file’s id: Cancel keeps it, Overwrite replaces it', async () => {
		const { container } = renderEmpty()
		chooseProjectFile(container, monthlyFile(ID, 'Desk', 2030))
		await waitFor(() => expect(projectLabels()).toEqual(['Desk — Monthly']))

		chooseProjectFile(container, monthlyFile(ID, 'Office', 2040))
		const question = await screen.findByRole('dialog', { name: 'Overwrite project' })
		expect(question.textContent).toContain(
			'“Desk” is already one of your projects. Overwrite it with the file’s version? Its current settings are lost.',
		)
		fireEvent.click(within(question).getByRole('button', { name: 'Cancel' }))
		expect(projectLabels()).toEqual(['Desk — Monthly'])
		openSection('Calendar')
		expect(year()).toBe('2030')

		chooseProjectFile(container, monthlyFile(ID, 'Office', 2040))
		const again = await screen.findByRole('dialog', { name: 'Overwrite project' })
		fireEvent.click(within(again).getByRole('button', { name: 'Overwrite' }))
		expect(projectLabels()).toEqual(['Office — Monthly'])
		expect(year()).toBe('2040')
	})

	it('shows an error for a file that is not a project, and keeps the projects', async () => {
		const { container } = renderEmpty()
		createProject('Home', 'yearly')
		chooseProjectFile(container, '{"year": 2030}', 'other.json')
		expect((await screen.findByRole('alert')).textContent).toBe(
			'other.json is not a calendar project file.',
		)
		expect(projectLabels()).toEqual(['Home — Yearly'])
	})

	it('shows an error for a project of a layout this version doesn’t have', async () => {
		const { container } = renderEmpty()
		const text = monthlyFile(ID, '', 2030).replace('"monthly"', '"quarterly"')
		chooseProjectFile(container, text, 'quarter.json')
		expect((await screen.findByRole('alert')).textContent).toBe(
			'quarter.json was made by a newer version, with a layout this one doesn’t have.',
		)
		expect(within(projectSection()).queryByRole('combobox')).toBeNull()
	})
})

describe('App preferences', () => {
	it('keeps the open section and the sidebar width after a reload', async () => {
		const { unmount } = renderEmpty()
		createProject('', 'yearly')
		openSection('Calendar')
		const handle = screen.getByRole('separator', { name: 'Resize sidebar' })
		fireEvent.keyDown(handle, { key: 'ArrowRight' })
		const width = handle.getAttribute('aria-valuenow')
		expect(Number(width)).toBeGreaterThan(320)
		await waitFor(() => expect(localStorage.getItem('calendarium-workspace')).not.toBeNull())

		unmount()
		render(<App />)
		expect(screen.getByLabelText('Year')).not.toBeNull()
		expect(
			screen.getByRole('separator', { name: 'Resize sidebar' }).getAttribute('aria-valuenow'),
		).toBe(width)
	})

	it('keeps the preferences apart from the workspace', () => {
		renderEmpty()
		createProject('', 'yearly')
		localStorage.clear()
		openSection('Page')
		expect(JSON.parse(localStorage.getItem('calendarium-preferences')!)).toMatchObject({
			openSection: 'Page',
		})
		expect(Object.keys(localStorage)).toEqual(['calendarium-preferences'])
	})
})

describe('App workspace', () => {
	it('keeps the projects and the open one after a reload, without asking for a new one', async () => {
		const { unmount } = renderEmpty()
		createProject('Home', 'yearly')
		createProject('Desk', 'monthly')
		// Saved by an effect once the project is in the workspace.
		await waitFor(() => expect(localStorage.getItem('calendarium-workspace')).not.toBeNull())

		unmount()
		render(<App />)
		expect(screen.queryByRole('dialog')).toBeNull()
		expect(projectLabels()).toEqual(['Desk — Monthly', 'Home — Yearly'])
		expect(openLabel()).toBe('Desk — Monthly')
	})
})

describe('App unsaved changes', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('says changes aren’t saved while storage is full, until a save is written again', async () => {
		renderEmpty()
		const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new DOMException('Full', 'QuotaExceededError')
		})
		createProject('Home', 'yearly')
		const alert = await within(projectSection()).findByRole('alert')
		expect(alert.textContent).toMatch(/storage is full/)
		expect(localStorage.getItem('calendarium-workspace')).toBeNull()

		setItem.mockRestore()
		fireEvent.change(within(projectSection()).getByRole('textbox', { name: 'Name' }), {
			target: { value: 'Desk' },
		})
		await waitFor(() => expect(within(projectSection()).queryByRole('alert')).toBeNull())
		// The failed save's changes are written with the next one's.
		expect(localStorage.getItem('calendarium-workspace')).not.toBeNull()
	})
})
