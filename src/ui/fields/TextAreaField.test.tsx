import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TextAreaField } from './TextAreaField'

describe('TextAreaField', () => {
	it('passes on the text as typed, line breaks included', () => {
		const onChange = vi.fn()
		render(<TextAreaField label="Events" value="" onChange={onChange} />)
		fireEvent.change(screen.getByRole('textbox', { name: 'Events' }), {
			target: { value: 'a\nb' },
		})
		expect(onChange).toHaveBeenCalledWith('a\nb')
	})

	it('shows its warning under the box, and none without one', () => {
		const { rerender } = render(<TextAreaField label="Events" value="" onChange={vi.fn()} />)
		expect(screen.queryByRole('status')).toBeNull()
		rerender(<TextAreaField label="Events" value="x" error="Line 1" onChange={vi.fn()} />)
		expect(screen.getByRole('status').textContent).toBe('Line 1')
	})
})
