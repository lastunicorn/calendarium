import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { NumberInput } from './NumberInput'

function renderInput(value: number, onChange = vi.fn(), isValid?: (value: number) => boolean) {
	const props = { min: 0, max: 50, label: 'Height', onChange, ...(isValid && { isValid }) }
	const { rerender } = render(<NumberInput value={value} {...props} />)
	const input = screen.getByRole<HTMLInputElement>('spinbutton', { name: 'Height' })
	return {
		input,
		onChange,
		/** Renders it again with `next`, as its parent would once a value is committed. */
		update: (next: number) => rerender(<NumberInput value={next} {...props} />),
	}
}

describe('NumberInput', () => {
	it('commits a valid number as it is typed', () => {
		const { input, onChange } = renderInput(10)
		fireEvent.change(input, { target: { value: '25' } })
		expect(onChange).toHaveBeenCalledWith(25)
	})

	it('keeps the text as typed once its number is committed, a trailing zero included', () => {
		const { input, update } = renderInput(10)
		fireEvent.change(input, { target: { value: '10.50' } })
		update(10.5)
		expect(input.value).toBe('10.50')
	})

	it('can be cleared without committing anything, and shows the value again once left', () => {
		const { input, onChange } = renderInput(10)
		fireEvent.change(input, { target: { value: '' } })
		expect(onChange).not.toHaveBeenCalled()
		expect(input.value).toBe('')
		fireEvent.blur(input)
		expect(input.value).toBe('10')
	})

	it('does not commit a number outside its limits', () => {
		const { input, onChange } = renderInput(10)
		fireEvent.change(input, { target: { value: '51' } })
		fireEvent.change(input, { target: { value: '-1' } })
		expect(onChange).not.toHaveBeenCalled()
		expect(input.value).toBe('-1')
	})

	it('commits what its own check allows, in place of its limits', () => {
		const isEven = (value: number) => value % 2 === 0
		const { input, onChange } = renderInput(10, vi.fn(), isEven)
		fireEvent.change(input, { target: { value: '7' } })
		fireEvent.change(input, { target: { value: '80' } })
		expect(onChange.mock.calls).toEqual([[80]])
	})

	it('shows a value changed from outside in place of the text typed', () => {
		const { input, update } = renderInput(10)
		fireEvent.change(input, { target: { value: '1' } })
		update(20)
		expect(input.value).toBe('20')
	})
})
