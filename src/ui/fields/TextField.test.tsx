import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TextField } from './TextField'

describe('TextField', () => {
	it('clears its text from a button at its right end, and keeps the focus in it', () => {
		const onChange = vi.fn()
		render(<TextField label="Title" value="Family" onChange={onChange} />)
		fireEvent.click(screen.getByRole('button', { name: 'Clear Title' }))
		expect(onChange).toHaveBeenCalledWith('')
		expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Title' }))
	})

	it('has no clear button while empty', () => {
		render(<TextField label="Title" value="" onChange={vi.fn()} />)
		expect(screen.queryByRole('button')).toBeNull()
	})
})
