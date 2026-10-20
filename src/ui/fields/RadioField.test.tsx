import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RadioField } from './RadioField'

const OPTIONS = [
	{ value: 'a', label: 'A' },
	{ value: 'b', label: 'B' },
] as const

function noop() {}

describe('RadioField', () => {
	it('opens its description from an info button next to the label', () => {
		render(
			<RadioField
				label="Days"
				description="A note"
				value="a"
				options={OPTIONS}
				onChange={noop}
			/>,
		)
		const button = screen.getByRole('button', { name: 'About Days' })
		const balloon = document.getElementById(button.getAttribute('popovertarget')!)!
		expect(balloon.textContent).toBe('A note')
		expect(balloon.getAttribute('popover')).toBe('auto')
		expect(screen.getByRole('group', { name: 'Days' }).getAttribute('aria-describedby')).toBe(
			balloon.id,
		)
	})

	it('has no info button without a description', () => {
		render(<RadioField label="Days" value="a" options={OPTIONS} onChange={noop} />)
		expect(screen.queryByRole('button')).toBeNull()
	})
})
