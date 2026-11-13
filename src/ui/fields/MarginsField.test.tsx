import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { Margins } from '../../core/paper'
import { MarginsField } from './MarginsField'

const MARGINS: Margins = { top: 10, right: 12, bottom: 14, left: 16 }

function renderField(equal: boolean) {
	const onChange = vi.fn()
	render(
		<MarginsField value={MARGINS} orientation="portrait" equal={equal} onChange={onChange} />,
	)
	return onChange
}

function marginInput(name: string) {
	return screen.getByRole<HTMLInputElement>('spinbutton', { name })
}

describe('MarginsField', () => {
	it('changes one side alone', () => {
		const onChange = renderField(false)
		fireEvent.change(marginInput('Left margin'), { target: { value: '20' } })
		expect(onChange).toHaveBeenCalledWith({ ...MARGINS, left: 20 })
	})

	it('lets every side be edited', () => {
		renderField(false)
		const inputs = screen.getAllByRole<HTMLInputElement>('spinbutton')
		expect(inputs.map((input) => input.readOnly)).toEqual([false, false, false, false])
	})

	it('with equal margins, sets every side from the top one', () => {
		const onChange = renderField(true)
		fireEvent.change(marginInput('Top margin'), { target: { value: '8' } })
		expect(onChange).toHaveBeenCalledWith({ top: 8, right: 8, bottom: 8, left: 8 })
	})

	it('with equal margins, lets only the top one be edited', () => {
		renderField(true)
		expect(marginInput('Top margin').readOnly).toBe(false)
		for (const name of ['Right margin', 'Bottom margin', 'Left margin']) {
			expect(marginInput(name).readOnly).toBe(true)
		}
	})
})
