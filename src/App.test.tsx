import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import { defaultLayoutOptions } from './layouts'
import { serializeProject } from './workspace/projectDocument'

const ID = '3f0c9a52-7d1e-4b8a-9c61-2e5f4a8b7d10'

/** Chooses `file` in the layout section's hidden file input, as the open button's dialog would. */
function chooseProjectFile(container: HTMLElement, file: File) {
	const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
	fireEvent.change(input, { target: { files: [file] } })
}

/** Expands the sidebar section titled `title`, which starts collapsed. */
function openSection(title: string) {
	fireEvent.click(screen.getByRole('button', { name: title }))
}

/** The layout picker: the select in the always open "Project" section. */
function layoutSelect(): HTMLSelectElement {
	return screen.getByRole('group', { name: 'Project' }).querySelector('select')!
}

describe('App open project', () => {
	it('switches to the layout of an opened file and draws its pages', async () => {
		const { container } = render(<App />)
		expect(layoutSelect().value).toBe('yearly')

		const options = {
			...defaultLayoutOptions('monthly'),
			calendar: { ...defaultLayoutOptions('monthly').calendar, year: 2030 },
		}
		const text = serializeProject(
			{ id: ID, name: '', layout: 'monthly', options },
			{ pretty: true },
		)
		chooseProjectFile(container, new File([text], 'month.json', { type: 'application/json' }))

		await waitFor(() => expect(layoutSelect().value).toBe('monthly'))
		openSection('Calendar')
		expect(screen.getByLabelText<HTMLInputElement>('Year').value).toBe('2030')
		expect(container.querySelectorAll('main section')).toHaveLength(12)
		expect(screen.queryByRole('alert')).toBeNull()
	})

	it('shows an error for a file that is not a project, and keeps the settings', async () => {
		const { container } = render(<App />)

		chooseProjectFile(container, new File(['{"year": 2030}'], 'other.json'))

		expect((await screen.findByRole('alert')).textContent).toBe(
			'other.json is not a calendar project file.',
		)
		expect(layoutSelect().value).toBe('yearly')
		openSection('Calendar')
		expect(screen.getByLabelText<HTMLInputElement>('Year').value).toBe(
			String(new Date().getFullYear()),
		)
	})

	it('shows an error for a project of a layout this version doesn’t have', async () => {
		const { container } = render(<App />)
		const text = serializeProject(
			{ id: ID, name: '', layout: 'monthly', options: defaultLayoutOptions('monthly') },
			{ pretty: true },
		).replace('"monthly"', '"quarterly"')

		chooseProjectFile(container, new File([text], 'quarter.json'))

		expect((await screen.findByRole('alert')).textContent).toBe(
			'quarter.json was made by a newer version, with a layout this one doesn’t have.',
		)
		expect(layoutSelect().value).toBe('yearly')
	})
})

describe('App new project', () => {
	it('restores the shown layout’s defaults after confirming, and keeps it shown', async () => {
		const { container } = render(<App />)
		const options = {
			...defaultLayoutOptions('monthly'),
			calendar: { ...defaultLayoutOptions('monthly').calendar, year: 2030 },
		}
		const text = serializeProject(
			{ id: ID, name: '', layout: 'monthly', options },
			{ pretty: true },
		)
		chooseProjectFile(container, new File([text], 'month.json', { type: 'application/json' }))
		await waitFor(() => expect(layoutSelect().value).toBe('monthly'))

		const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
		fireEvent.click(screen.getByRole('button', { name: 'New project' }))
		expect(confirm).toHaveBeenCalledWith(
			'Start a new Monthly project? Its settings go back to their defaults; save the current project to a file first to keep it.',
		)
		confirm.mockRestore()

		expect(layoutSelect().value).toBe('monthly')
		expect(
			screen.getByRole<HTMLButtonElement>('button', { name: 'New project' }).disabled,
		).toBe(true)
		openSection('Calendar')
		expect(screen.getByLabelText<HTMLInputElement>('Year').value).toBe(
			String(new Date().getFullYear()),
		)
	})

	it('restores only an open section’s defaults once its reset is confirmed', async () => {
		const { container } = render(<App />)
		const options = {
			...defaultLayoutOptions('monthly'),
			calendar: { ...defaultLayoutOptions('monthly').calendar, year: 2030 },
			events: ['0000-12-25 Christmas'],
		}
		const text = serializeProject(
			{ id: ID, name: '', layout: 'monthly', options },
			{ pretty: true },
		)
		chooseProjectFile(container, new File([text], 'month.json', { type: 'application/json' }))
		await waitFor(() => expect(layoutSelect().value).toBe('monthly'))

		openSection('Calendar')
		fireEvent.click(screen.getByRole('button', { name: 'Reset Calendar settings' }))
		const question = screen.getByRole('alertdialog', {
			name: 'Reset Calendar settings to their defaults?',
		})
		fireEvent.click(within(question).getByRole('button', { name: 'Reset' }))
		expect(screen.queryByRole('alertdialog')).toBeNull()
		expect(screen.getByLabelText<HTMLInputElement>('Year').value).toBe(
			String(new Date().getFullYear()),
		)

		openSection('Events')
		expect(screen.getByLabelText<HTMLTextAreaElement>('Events').value).toBe(
			'0000-12-25 Christmas',
		)
	})
})

describe('App preferences', () => {
	it('keeps the open section and the sidebar width after a reload', () => {
		const { unmount } = render(<App />)
		openSection('Calendar')
		const handle = screen.getByRole('separator', { name: 'Resize sidebar' })
		fireEvent.keyDown(handle, { key: 'ArrowRight' })
		const width = handle.getAttribute('aria-valuenow')
		expect(Number(width)).toBeGreaterThan(320)

		unmount()
		render(<App />)
		expect(screen.getByLabelText('Year')).not.toBeNull()
		expect(
			screen.getByRole('separator', { name: 'Resize sidebar' }).getAttribute('aria-valuenow'),
		).toBe(width)
	})

	it('keeps the preferences apart from the workspace', () => {
		render(<App />)
		openSection('Page')
		expect(JSON.parse(localStorage.getItem('calendarium-preferences')!)).toMatchObject({
			openSection: 'Page',
		})
		expect(Object.keys(localStorage)).toEqual(['calendarium-preferences'])
	})
})

describe('App workspace', () => {
	it('keeps the open project and its settings after a reload', async () => {
		const { container, unmount } = render(<App />)
		const options = {
			...defaultLayoutOptions('monthly'),
			calendar: { ...defaultLayoutOptions('monthly').calendar, year: 2030 },
		}
		const text = serializeProject(
			{ id: ID, name: '', layout: 'monthly', options },
			{ pretty: true },
		)
		chooseProjectFile(container, new File([text], 'month.json', { type: 'application/json' }))
		await waitFor(() => expect(layoutSelect().value).toBe('monthly'))
		// Saved by an effect once the opened file is in the workspace.
		await waitFor(() =>
			expect(localStorage.getItem(`calendarium-project:${ID}`)).not.toBeNull(),
		)

		unmount()
		render(<App />)
		expect(layoutSelect().value).toBe('monthly')
		openSection('Calendar')
		expect(screen.getByLabelText<HTMLInputElement>('Year').value).toBe('2030')
	})
})
