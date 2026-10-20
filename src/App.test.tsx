import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import { defaultLayoutConfig } from './layouts'
import { serializeLayoutConfig } from './config/configFile'

/** Chooses `file` in the toolbar's hidden file input, as the import button's dialog would. */
function chooseImportFile(container: HTMLElement, file: File) {
	const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
	fireEvent.change(input, { target: { files: [file] } })
}

/** Expands the sidebar section titled `title`, which starts collapsed. */
function openSection(title: string) {
	fireEvent.click(screen.getByRole('button', { name: title }))
}

/** The layout picker: the select in the "Layout" section, once that section is open. */
function layoutSelect(): HTMLSelectElement {
	return screen.getByRole('group', { name: 'Layout' }).querySelector('select')!
}

describe('App import', () => {
	it('switches to the layout of an imported file and draws its pages', async () => {
		const { container } = render(<App />)
		openSection('Layout')
		expect(layoutSelect().value).toBe('year-per-page')

		const options = { ...defaultLayoutConfig('month-per-page'), year: 2030 }
		const text = serializeLayoutConfig('month-per-page', options)
		chooseImportFile(container, new File([text], 'month.json', { type: 'application/json' }))

		await waitFor(() => expect(layoutSelect().value).toBe('month-per-page'))
		openSection('Calendar')
		expect(screen.getByLabelText<HTMLInputElement>('Year').value).toBe('2030')
		expect(container.querySelectorAll('main section')).toHaveLength(12)
		expect(screen.queryByRole('alert')).toBeNull()
	})

	it('shows an error for a file that is not a configuration, and keeps the settings', async () => {
		const { container } = render(<App />)
		openSection('Layout')

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
		openSection('Layout')
		const options = { ...defaultLayoutConfig('month-per-page'), year: 2030 }
		const text = serializeLayoutConfig('month-per-page', options)
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
})
