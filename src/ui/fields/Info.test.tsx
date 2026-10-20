import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CheckboxField } from './CheckboxField'
import { NumberField } from './NumberField'
import { SelectField } from './SelectField'
import { TextField } from './TextField'

const OPTIONS = [
	{ value: 'a', label: 'A' },
	{ value: 'b', label: 'B' },
] as const

function noop() {}

function expectBalloon(name: string, control: HTMLElement) {
	const button = screen.getByRole('button', { name: `About ${name}` })
	const balloon = document.getElementById(button.getAttribute('popovertarget')!)!
	expect(balloon.textContent).toBe('A note')
	expect(balloon.getAttribute('popover')).toBe('auto')
	expect(control.getAttribute('aria-describedby')).toBe(balloon.id)
}

describe('field descriptions', () => {
	it('open from an info button next to a number field label', () => {
		render(
			<NumberField
				label="Year"
				description="A note"
				value={1}
				min={0}
				max={9}
				onChange={noop}
			/>,
		)
		expectBalloon('Year', screen.getByRole('spinbutton', { name: 'Year' }))
	})

	it('open from an info button next to a select field label', () => {
		render(
			<SelectField
				label="Language"
				description="A note"
				value="a"
				options={OPTIONS}
				onChange={noop}
			/>,
		)
		expectBalloon('Language', screen.getByRole('combobox', { name: 'Language' }))
	})

	it('open from an info button next to a text field label', () => {
		render(<TextField label="Title" description="A note" value="" onChange={noop} />)
		expectBalloon('Title', screen.getByRole('textbox', { name: 'Title' }))
	})

	it('open from an info button next to a checkbox label', () => {
		render(<CheckboxField label="Show" description="A note" checked onChange={noop} />)
		expectBalloon('Show', screen.getByRole('checkbox', { name: 'Show' }))
	})

	it('leave out the info button without a description', () => {
		render(
			<>
				<NumberField label="Year" value={1} min={0} max={9} onChange={noop} />
				<CheckboxField label="Show" checked onChange={noop} />
			</>,
		)
		expect(screen.queryByRole('button')).toBeNull()
	})
})
