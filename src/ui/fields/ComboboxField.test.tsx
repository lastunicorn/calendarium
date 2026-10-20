import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ComboboxField } from './ComboboxField'
import type { FilterOption } from './filter'

const OPTIONS: FilterOption<string>[] = [
	{ value: 'de-DE', label: 'German (Deutsch)', keywords: ['Germany', 'Deutschland'] },
	{ value: 'pt-BR', label: 'Portuguese (Português)', keywords: ['Brazil', 'Brasil'] },
	{ value: 'ro-RO', label: 'Romanian (Română)', keywords: ['Romania'] },
]

function renderField(value = 'de-DE') {
	const onChange = vi.fn()
	render(<ComboboxField label="Language" value={value} options={OPTIONS} onChange={onChange} />)
	return onChange
}

function openList() {
	fireEvent.click(screen.getByRole('button', { name: 'Language' }))
	return screen.getByRole('combobox', { name: 'Filter Language' })
}

function shownOptions() {
	return screen.queryAllByRole('option').map((option) => option.textContent)
}

describe('ComboboxField', () => {
	it('shows the chosen label, and every option once opened, with the focus in the filter', () => {
		renderField('pt-BR')
		expect(screen.getByRole('button', { name: 'Language' }).textContent).toBe(
			'Portuguese (Português)',
		)
		const filter = openList()
		expect(document.activeElement).toBe(filter)
		expect(shownOptions()).toHaveLength(3)
	})

	it('filters on the label and the keywords, ignoring case and accents', () => {
		renderField()
		const filter = openList()
		fireEvent.change(filter, { target: { value: 'brasil' } })
		expect(shownOptions()).toEqual(['Portuguese (Português)'])
		fireEvent.change(filter, { target: { value: 'ROMANA' } })
		expect(shownOptions()).toEqual(['Romanian (Română)'])
		fireEvent.change(filter, { target: { value: 'klingon' } })
		expect(shownOptions()).toEqual([])
		expect(screen.getByText('No matches')).toBeDefined()
	})

	it('picks the first match with Enter, and the next with the arrow keys', () => {
		const onChange = renderField()
		let filter = openList()
		fireEvent.change(filter, { target: { value: 'an' } })
		fireEvent.keyDown(filter, { key: 'Enter' })
		expect(onChange).toHaveBeenLastCalledWith('de-DE')
		expect(screen.queryByRole('listbox')).toBeNull()

		filter = openList()
		fireEvent.change(filter, { target: { value: 'an' } })
		fireEvent.keyDown(filter, { key: 'ArrowDown' })
		fireEvent.keyDown(filter, { key: 'Enter' })
		expect(onChange).toHaveBeenLastCalledWith('ro-RO')
	})

	it('picks a clicked option', () => {
		const onChange = renderField()
		openList()
		fireEvent.click(screen.getByRole('option', { name: 'Romanian (Română)' }))
		expect(onChange).toHaveBeenCalledWith('ro-RO')
	})

	it('closes unchanged on Escape, giving the focus back to the button', () => {
		const onChange = renderField()
		fireEvent.keyDown(openList(), { key: 'Escape' })
		expect(screen.queryByRole('listbox')).toBeNull()
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Language' }))
		expect(onChange).not.toHaveBeenCalled()
	})

	it('opens with the filter started by a letter typed on the button', () => {
		renderField()
		fireEvent.keyDown(screen.getByRole('button', { name: 'Language' }), { key: 'r' })
		expect(screen.getByRole('combobox', { name: 'Filter Language' })).toHaveProperty(
			'value',
			'r',
		)
	})
})
