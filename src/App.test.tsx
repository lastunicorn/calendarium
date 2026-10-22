import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import { defaultLayoutOptions } from './layouts'
import { serializeLayoutOptions } from './config/configFile'

/** Chooses `file` in the layout section's hidden file input, as the import button's dialog would. */
function chooseImportFile(container: HTMLElement, file: File) {
	const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
	fireEvent.change(input, { target: { files: [file] } })
}

/** Expands the sidebar section titled `title`, which starts collapsed. */
function openSection(title: string) {
	fireEvent.click(screen.getByRole('button', { name: title }))
}

/** The layout picker: the select in the always open "Layout" section. */
function layoutSelect(): HTMLSelectElement {
	return screen.getByRole('group', { name: 'Layout' }).querySelector('select')!
}

describe('App import', () => {
	it('switches to the layout of an imported file and draws its pages', async () => {
		const { container } = render(<App />)
		expect(layoutSelect().value).toBe('year-per-page')

		const options = { ...defaultLayoutOptions('month-per-page'), year: 2030 }
		const text = serializeLayoutOptions('month-per-page', options)
		chooseImportFile(container, new File([text], 'month.json', { type: 'application/json' }))

		await waitFor(() => expect(layoutSelect().value).toBe('month-per-page'))
		openSection('Calendar')
		expect(screen.getByLabelText<HTMLInputElement>('Year').value).toBe('2030')
		expect(container.querySelectorAll('main section')).toHaveLength(12)
		expect(screen.queryByRole('alert')).toBeNull()
	})

	it('shows an error for a file that is not a configuration, and keeps the settings', async () => {
		const { container } = render(<App />)

		chooseImportFile(container, new File(['{"year": 2030}'], 'other.json'))

		expect((await screen.findByRole('alert')).textContent).toBe(
			'other.json is not a valid configuration file.',
		)
		expect(layoutSelect().value).toBe('year-per-page')
		openSection('Calendar')
		expect(screen.getByLabelText<HTMLInputElement>('Year').value).toBe(
			String(new Date().getFullYear()),
		)
	})
})

describe('App reset', () => {
	it('restores the shown layout’s defaults after confirming, and keeps it shown', async () => {
		const { container } = render(<App />)
		const options = { ...defaultLayoutOptions('month-per-page'), year: 2030 }
		const text = serializeLayoutOptions('month-per-page', options)
		chooseImportFile(container, new File([text], 'month.json', { type: 'application/json' }))
		await waitFor(() => expect(layoutSelect().value).toBe('month-per-page'))

		const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
		fireEvent.click(screen.getByRole('button', { name: 'Reset layout settings' }))
		expect(confirm).toHaveBeenCalledWith('Reset Month settings to their defaults?')
		confirm.mockRestore()

		expect(layoutSelect().value).toBe('month-per-page')
		openSection('Calendar')
		expect(screen.getByLabelText<HTMLInputElement>('Year').value).toBe(
			String(new Date().getFullYear()),
		)
	})

	it('restores only an open section’s defaults once its reset is confirmed', async () => {
		const { container } = render(<App />)
		const options = {
			...defaultLayoutOptions('month-per-page'),
			year: 2030,
			events: '0000-12-25 Christmas',
		}
		const text = serializeLayoutOptions('month-per-page', options)
		chooseImportFile(container, new File([text], 'month.json', { type: 'application/json' }))
		await waitFor(() => expect(layoutSelect().value).toBe('month-per-page'))

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
