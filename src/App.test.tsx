import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { defaultLayoutConfig } from './config/layouts'
import { serializeLayoutConfig } from './config/configFile'

/** Chooses `file` in the toolbar's hidden file input, as the import button's dialog would. */
function chooseImportFile(container: HTMLElement, file: File) {
	const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
	fireEvent.change(input, { target: { files: [file] } })
}

/** The layout picker: the select in the "Layout" section. */
function layoutSelect(): HTMLSelectElement {
	return screen.getByRole('group', { name: 'Layout' }).querySelector('select')!
}

describe('App import', () => {
	it('switches to the layout of an imported file and draws its pages', async () => {
		const { container } = render(<App />)
		expect(layoutSelect().value).toBe('year-per-page')

		const options = { ...defaultLayoutConfig('month-per-page'), year: 2030 }
		const text = serializeLayoutConfig('month-per-page', options)
		chooseImportFile(container, new File([text], 'month.json', { type: 'application/json' }))

		await waitFor(() => expect(layoutSelect().value).toBe('month-per-page'))
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
		expect(screen.getByLabelText<HTMLInputElement>('Year').value).toBe(
			String(new Date().getFullYear()),
		)
	})
})
