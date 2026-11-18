import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ThemeButton } from './ThemeButton'

describe('ThemeButton', () => {
	it('names the theme and the one it switches to', () => {
		render(<ThemeButton theme="system" onChange={vi.fn()} />)
		expect(
			screen.getByRole('button', { name: 'Theme: System (switch to Light)' }),
		).toBeDefined()
	})

	it('steps to the next theme, back to the system after dark', () => {
		const onChange = vi.fn()
		const { rerender } = render(<ThemeButton theme="light" onChange={onChange} />)
		fireEvent.click(screen.getByRole('button'))
		expect(onChange).toHaveBeenLastCalledWith('dark')

		rerender(<ThemeButton theme="dark" onChange={onChange} />)
		fireEvent.click(screen.getByRole('button', { name: 'Theme: Dark (switch to System)' }))
		expect(onChange).toHaveBeenLastCalledWith('system')
	})
})
