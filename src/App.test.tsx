import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App'
import { currentEnvironment } from './core/environment'
import { defaultLayoutOptions, LAYOUT_IDS } from './layouts'
import { LAYOUT_VIEWS } from './ui/layouts/registry'
import { LEGACY_FILE_FORMAT } from './workspace/legacy'
import type { Project } from './workspace/Project'
import { serializeProject } from './workspace/projectDocument'

const ID = '3f0c9a52-7d1e-4b8a-9c61-2e5f4a8b7d10'

/** The always open "Project" section. */
function projectSection(): HTMLElement {
	return screen.getByRole('group', { name: 'Document' })
}

/** The sidebar's Manage documents button. */
function manageButton(): HTMLButtonElement {
	return within(projectSection()).getByRole('button', { name: 'Manage documents' })
}

/** Documents, in the main area; `null` while the preview shows instead. */
function queryDocuments(): HTMLElement | null {
	return screen.queryByRole('main', { name: 'Documents' })
}

/** Documents, which must show. */
function documents(): HTMLElement {
	return screen.getByRole('main', { name: 'Documents' })
}

/** Whether the preview shows. */
function previewShown(): boolean {
	return screen.queryByRole('main', { name: 'Preview' }) !== null
}

/** Shows Documents from Manage documents, unless it shows already. */
function showDocuments(): HTMLElement {
	if (queryDocuments() === null) fireEvent.click(manageButton())
	return documents()
}

/**
 * What `read` finds in Documents, shown for it from Manage documents, and the preview shown again
 * after, when it showed before.
 */
function inDocuments<T>(read: (shown: HTMLElement) => T): T {
	const shown = queryDocuments()
	if (shown !== null) return read(shown)
	fireEvent.click(manageButton())
	const found = read(documents())
	fireEvent.click(manageButton())
	return found
}

/** A row's label, "Work 2027 — Weekly": its radio's name, the Current tag being hidden from it. */
function rowLabel(radio: HTMLInputElement): string {
	const label = radio.closest('label')!.cloneNode(true) as HTMLElement
	for (const hidden of label.querySelectorAll('[aria-hidden="true"]')) hidden.remove()
	return label.textContent
}

/** The projects Documents lists, in its order. */
function projectLabels(): string[] {
	return inDocuments((shown) =>
		within(shown).getAllByRole<HTMLInputElement>('radio').map(rowLabel),
	)
}

/** The open project's label, the one Documents tags Current. */
function currentLabel(): string {
	return inDocuments((shown) =>
		rowLabel(within(shown).getByRole<HTMLInputElement>('radio', { description: 'Current' })),
	)
}

/** The label of the project chosen in Documents, which must show. */
function chosenLabel(): string {
	return rowLabel(within(documents()).getByRole<HTMLInputElement>('radio', { checked: true }))
}

/** The value Documents' details panel shows for `term`; Documents must show. */
function detail(term: string): string {
	return within(documents()).getByText(term, { selector: 'dt' }).nextElementSibling!.textContent
}

/** Chooses the project labeled `label` in Documents, which must show. */
function choose(label: string) {
	fireEvent.click(within(documents()).getByRole('radio', { name: label }))
}

/** Asks to delete the project chosen in Documents, from the details panel; Documents must show. */
function clickDelete() {
	fireEvent.click(within(documents()).getByRole('button', { name: 'Delete' }))
}

/** Confirms the open Delete document dialog. */
function confirmDelete() {
	fireEvent.click(within(dialog('Delete document')).getByRole('button', { name: 'Delete' }))
}

/** Makes the project labeled `label` current from Documents, choosing it, then Open. */
function pick(label: string) {
	showDocuments()
	choose(label)
	fireEvent.click(within(documents()).getByRole('button', { name: 'Open' }))
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

/** Fills the open New document dialog with `name` and `layout`, then Create. */
function fillNewProject(name: string, layout: Project['layout']) {
	const newProject = dialog('New document')
	fireEvent.change(within(newProject).getByRole('textbox', { name: 'Name' }), {
		target: { value: name },
	})
	fireEvent.click(within(newProject).getByRole('radio', { name: LAYOUT_VIEWS[layout].label }))
	fireEvent.click(within(newProject).getByRole('button', { name: 'Create' }))
}

/** Creates a project from the sidebar's New document, which opens it in the preview. */
function createProject(name: string, layout: Project['layout']) {
	clickAction('New document…')
	fillNewProject(name, layout)
}

/** Adds a project from Documents' New document, which keeps Documents shown. */
function addProject(name: string, layout: Project['layout']) {
	fireEvent.click(within(showDocuments()).getByRole('button', { name: 'New document…' }))
	fillNewProject(name, layout)
}

/** Renders the app with no project. */
function renderEmpty() {
	return render(<App />)
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

const THIS_YEAR = String(currentEnvironment().year)

describe('App without a project', () => {
	it('shows Documents on a first launch, with nothing to close or print, and opens no dialog', () => {
		renderEmpty()
		expect(screen.queryByRole('dialog')).toBeNull()
		expect(within(documents()).getByText('No documents yet.')).not.toBeNull()
		expect(within(documents()).queryByRole('button', { name: 'Close' })).toBeNull()
		expect(manageButton().getAttribute('aria-pressed')).toBe('true')
		expect(previewShown()).toBe(false)
		expect(printDisabled()).toBe(true)
		expect(Object.keys(localStorage)).toEqual([])
	})

	it('asks for a new project from Documents, the first layout chosen, and creates nothing when cancelled', () => {
		renderEmpty()
		fireEvent.click(within(documents()).getByRole('button', { name: 'New document…' }))
		// Starting on the name, the first field, ready to type.
		expect(document.activeElement).toBe(
			within(dialog('New document')).getByRole('textbox', { name: 'Name' }),
		)
		const chosen = within(dialog('New document')).getByRole('radio', { checked: true })
		expect(chosen.closest('label')?.textContent).toBe(LAYOUT_VIEWS[LAYOUT_IDS[0]].label)
		fireEvent.click(within(dialog('New document')).getByRole('button', { name: 'Cancel' }))
		expect(screen.queryByRole('dialog')).toBeNull()
		expect(documents()).not.toBeNull()
		expect(Object.keys(localStorage)).toEqual([])
	})

	it('makes the first project added from Documents current, Documents staying shown', () => {
		renderEmpty()
		addProject('Home', 'yearly')
		expect(screen.queryByRole('dialog')).toBeNull()
		expect(chosenLabel()).toBe('Home — Yearly')
		expect(currentLabel()).toBe('Home — Yearly')
		expect(detail('Name')).toBe('Home')
		// Now there is a preview to go back to.
		fireEvent.click(within(documents()).getByRole('button', { name: 'Close' }))
		expect(previewShown()).toBe(true)
	})
})

describe('App new project', () => {
	it.each(LAYOUT_IDS)(
		'creates a named and an unnamed %s project from the sidebar, each opened in the preview',
		(layout) => {
			const { container } = renderEmpty()
			const { name, label } = LAYOUT_VIEWS[layout]
			createProject('Ours', layout)
			expect(screen.queryByRole('dialog')).toBeNull()
			expect(previewShown()).toBe(true)
			expect(projectLabels()).toEqual([`Ours — ${name}`])
			expect(screen.getByLabelText('Layout').textContent).toBe(label)
			expect(printDisabled()).toBe(false)
			expect(container.querySelectorAll('main section').length).toBeGreaterThan(0)

			createProject('', layout)
			expect(projectLabels()).toEqual([`Ours — ${name}`, `Untitled — ${name}`])
			expect(currentLabel()).toBe(`Untitled — ${name}`)
			const nameField = within(projectSection()).getByRole<HTMLInputElement>('textbox', {
				name: 'Name',
			})
			expect(nameField.value).toBe('')
		},
	)

	it('gives the focus back to New document once created from it', () => {
		renderEmpty()
		createProject('Home', 'yearly')
		const button = within(projectSection()).getByRole('button', { name: 'New document…' })
		button.focus()
		fireEvent.click(button)
		fireEvent.click(within(dialog('New document')).getByRole('button', { name: 'Create' }))
		expect(document.activeElement).toBe(button)
	})

	it('gives the focus back to Documents’ New document once a project is added from it', () => {
		renderEmpty()
		const button = within(documents()).getByRole('button', { name: 'New document…' })
		// Focused by Documents, which has no row to focus.
		expect(document.activeElement).toBe(button)
		fireEvent.click(button)
		fillNewProject('Home', 'yearly')
		expect(document.activeElement).toBe(button)
	})

	it('creates nothing when cancelled', () => {
		renderEmpty()
		createProject('Home', 'yearly')
		clickAction('New document…')
		fireEvent.click(within(dialog('New document')).getByRole('button', { name: 'Close' }))
		expect(screen.queryByRole('dialog')).toBeNull()
		expect(projectLabels()).toEqual(['Home — Yearly'])
	})

	it('adds a project from Documents without opening it, chosen there, Documents staying shown', () => {
		renderEmpty()
		createProject('Home', 'yearly')
		addProject('Work', 'weekly')
		expect(screen.queryByRole('dialog')).toBeNull()
		expect(chosenLabel()).toBe('Work — Weekly')
		expect(detail('Layout')).toBe('Weekly (one week per page)')
		expect(currentLabel()).toBe('Home — Yearly')
		fireEvent.click(within(documents()).getByRole('button', { name: 'Close' }))
		const name = within(projectSection()).getByRole<HTMLInputElement>('textbox', {
			name: 'Name',
		})
		expect(name.value).toBe('Home')
	})

	it('opens a project created from the sidebar while Documents shows in the preview', () => {
		renderEmpty()
		createProject('Home', 'yearly')
		showDocuments()
		createProject('Desk', 'monthly')
		expect(previewShown()).toBe(true)
		expect(currentLabel()).toBe('Desk — Monthly')
	})
})

describe('App projects', () => {
	it('opens the project chosen in Documents, the form following', () => {
		renderEmpty()
		createProject('Wall', 'yearly')
		createProject('Desk', 'monthly')
		openSection('Calendar')
		fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2030' } })
		expect(year()).toBe('2030')

		pick('Wall — Yearly')
		expect(queryDocuments()).toBeNull()
		expect(currentLabel()).toBe('Wall — Yearly')
		expect(screen.getByLabelText('Layout').textContent).toBe(
			'Yearly (the whole year on one page)',
		)
		expect(year()).toBe(THIS_YEAR)

		pick('Desk — Monthly')
		expect(year()).toBe('2030')
	})

	it('shows the chosen project’s details, the open one unchanged, and opens it by a double click or Enter', () => {
		renderEmpty()
		createProject('Wall', 'yearly')
		createProject('Desk', 'monthly')
		showDocuments()
		const desk = within(documents()).getByRole<HTMLInputElement>('radio', {
			name: 'Desk — Monthly',
		})
		expect(desk.checked).toBe(true)
		expect(document.activeElement).toBe(desk)
		choose('Wall — Yearly')
		expect(detail('Name')).toBe('Wall')
		expect(currentLabel()).toBe('Desk — Monthly')

		fireEvent.doubleClick(within(documents()).getByText('Wall — Yearly'))
		expect(previewShown()).toBe(true)
		expect(currentLabel()).toBe('Wall — Yearly')

		showDocuments()
		choose('Desk — Monthly')
		fireEvent.submit(within(documents()).getByRole('radio', { name: 'Desk — Monthly' }))
		expect(previewShown()).toBe(true)
		expect(currentLabel()).toBe('Desk — Monthly')
	})

	it('goes back to the preview from Close, Escape or Manage documents, the open project unchanged, the focus on Manage documents', () => {
		renderEmpty()
		createProject('Wall', 'yearly')
		createProject('Desk', 'monthly')

		function close() {
			fireEvent.click(within(documents()).getByRole('button', { name: 'Close' }))
		}

		function escape() {
			fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
		}

		function manage() {
			fireEvent.click(manageButton())
		}

		for (const leave of [close, escape, manage]) {
			// A click focuses the button it lands on.
			manageButton().focus()
			fireEvent.click(manageButton())
			expect(manageButton().getAttribute('aria-pressed')).toBe('true')
			choose('Wall — Yearly')
			leave()
			expect(previewShown()).toBe(true)
			expect(manageButton().getAttribute('aria-pressed')).toBe('false')
			expect(document.activeElement).toBe(manageButton())
			expect(currentLabel()).toBe('Desk — Monthly')
		}
	})

	it('lists the projects by name with their layout, the unnamed ones last', () => {
		renderEmpty()
		createProject('Work 2027', 'weekly')
		createProject(' ', 'daily')
		createProject('Home', 'yearly')
		pick('Work 2027 — Weekly')
		expect(projectLabels()).toEqual(['Home — Yearly', 'Work 2027 — Weekly', 'Untitled — Daily'])
		expect(currentLabel()).toBe('Work 2027 — Weekly')
	})

	it('renames the open project, Documents following', () => {
		renderEmpty()
		createProject('b', 'yearly')
		createProject('c', 'weekly')
		const name = within(projectSection()).getByRole('textbox', { name: 'Name' })
		fireEvent.change(name, { target: { value: 'a' } })
		expect(projectLabels()).toEqual(['a — Weekly', 'b — Yearly'])
		expect(currentLabel()).toBe('a — Weekly')
	})

	it('asks before deleting the project chosen in Documents, keeps it on Cancel, and deletes it on Delete', () => {
		renderEmpty()
		createProject('a', 'yearly')
		createProject('b', 'monthly')
		createProject('c', 'daily')
		pick('b — Monthly')

		showDocuments()
		choose('a — Yearly')
		clickDelete()
		const question = dialog('Delete document')
		expect(question.textContent).toContain(
			'Delete “a”? It can’t be undone; open it and save it to a file first to keep it.',
		)
		fireEvent.click(within(question).getByRole('button', { name: 'Cancel' }))
		expect(projectLabels()).toEqual(['a — Yearly', 'b — Monthly', 'c — Daily'])

		clickDelete()
		confirmDelete()
		expect(projectLabels()).toEqual(['b — Monthly', 'c — Daily'])
		// The one in its place chosen, the open one still open, Documents still shown.
		expect(chosenLabel()).toBe('b — Monthly')
		expect(currentLabel()).toBe('b — Monthly')
	})

	it('opens the deleted open project’s neighbor, Documents staying shown', () => {
		renderEmpty()
		createProject('a', 'yearly')
		createProject('b', 'monthly')
		createProject('c', 'daily')
		pick('b — Monthly')

		showDocuments()
		clickDelete()
		expect(dialog('Delete document').textContent).toContain(
			'Delete “b”? It can’t be undone; save it to a file first to keep it.',
		)
		confirmDelete()
		expect(projectLabels()).toEqual(['a — Yearly', 'c — Daily'])
		expect(currentLabel()).toBe('c — Daily')
		expect(chosenLabel()).toBe('c — Daily')
	})

	it('shows the empty list once the last project is deleted, and opens no dialog', () => {
		renderEmpty()
		createProject('', 'yearly')
		showDocuments()
		clickDelete()
		expect(dialog('Delete document').textContent).toContain('Delete “Untitled”?')
		confirmDelete()
		expect(screen.queryByRole('dialog')).toBeNull()
		expect(within(documents()).getByText('No documents yet.')).not.toBeNull()
		expect(within(documents()).queryByRole('button', { name: 'Close' })).toBeNull()
		expect(within(projectSection()).queryByRole('textbox', { name: 'Name' })).toBeNull()
		expect(printDisabled()).toBe(true)
	})

	it('hides the open project’s settings beside Documents, and shows them again with its preview', () => {
		renderEmpty()
		createProject('Desk', 'monthly')
		openSection('Calendar')
		expect(year()).toBe(THIS_YEAR)
		showDocuments()
		expect(screen.queryByLabelText('Year')).toBeNull()
		expect(within(projectSection()).queryByRole('textbox', { name: 'Name' })).toBeNull()
		expect(printDisabled()).toBe(true)

		fireEvent.click(manageButton())
		expect(year()).toBe(THIS_YEAR)
		expect(printDisabled()).toBe(false)
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
		expect(currentLabel()).toBe('Work 2030 — Weekly')
		expect(screen.getByText(/^Opened Work 2030\.json/).textContent).toBe(
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
			expect(localStorage.getItem(`calendarium-document:${ID}`)).not.toBeNull(),
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
		const question = await screen.findByRole('dialog', { name: 'Overwrite document' })
		expect(question.textContent).toContain(
			'“Desk” is already one of your documents. Overwrite it with the file’s version? Its current settings are lost.',
		)
		fireEvent.click(within(question).getByRole('button', { name: 'Cancel' }))
		expect(projectLabels()).toEqual(['Desk — Monthly'])
		openSection('Calendar')
		expect(year()).toBe('2030')

		chooseProjectFile(container, monthlyFile(ID, 'Office', 2040))
		const again = await screen.findByRole('dialog', { name: 'Overwrite document' })
		fireEvent.click(within(again).getByRole('button', { name: 'Overwrite' }))
		expect(projectLabels()).toEqual(['Office — Monthly'])
		expect(year()).toBe('2040')
	})

	it('opens a file chosen while Documents shows in the preview', async () => {
		const { container } = renderEmpty()
		createProject('Home', 'yearly')
		showDocuments()
		chooseProjectFile(container, monthlyFile(ID, 'Desk', 2030), 'desk.json')
		await waitFor(() => expect(previewShown()).toBe(true))
		expect(currentLabel()).toBe('Desk — Monthly')
	})

	it('shows an error for a file that is not a project, and keeps the projects', async () => {
		const { container } = renderEmpty()
		createProject('Home', 'yearly')
		chooseProjectFile(container, '{"year": 2030}', 'other.json')
		expect((await screen.findByRole('alert')).textContent).toBe(
			'other.json is not a calendar document file.',
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
			openSection: 'page',
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
		expect(previewShown()).toBe(true)
		expect(projectLabels()).toEqual(['Desk — Monthly', 'Home — Yearly'])
		expect(currentLabel()).toBe('Desk — Monthly')
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
