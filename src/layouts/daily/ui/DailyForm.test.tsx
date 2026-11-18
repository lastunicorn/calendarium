import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { formSectionTitles, renderWithSectionsOpen } from '../../../test/formSections'
import { DAILY_SPEC, type DailyCalendarOptions } from '../options'
import { CalendarSection } from './CalendarSection'
import { DailyForm } from './DailyForm'

const CALENDAR_DEFAULTS = DAILY_SPEC.defaults().calendar

/** The daily Calendar section showing `options`, and its update. */
function renderCalendarSection(options: DailyCalendarOptions = CALENDAR_DEFAULTS) {
	const onUpdate = vi.fn()
	renderWithSectionsOpen(
		<CalendarSection options={options} defaults={CALENDAR_DEFAULTS} onUpdate={onUpdate} />,
	)
	return onUpdate
}

describe('DailyForm', () => {
	it('shows the header, mini calendar and content options, without a title', () => {
		expect(formSectionTitles(DailyForm, DAILY_SPEC.defaults())).toEqual([
			'Calendar',
			'Events',
			'Header',
			'Mini calendar',
			'Content',
			'Footer',
			'Page',
		])
		expect(screen.queryByLabelText('Title')).toBeNull()
	})
})

describe('daily CalendarSection', () => {
	it('shows the month right after the year', () => {
		renderCalendarSection()
		const section = screen.getByRole('group', { name: /Calendar/ })
		const labels = [...section.querySelectorAll('label')].map((label) => label.textContent)
		expect(labels).toEqual(['Year', 'Month', 'Language', 'Week starts on'])
		expect(
			screen.getByLabelText<HTMLSelectElement>('Month').selectedOptions[0].textContent,
		).toBe('Whole year')
	})

	it('sets the month, counted from 1', () => {
		const onUpdate = renderCalendarSection()
		const month = screen.getByLabelText('Month')
		fireEvent.change(month, { target: { value: '2' } })
		expect(onUpdate).toHaveBeenLastCalledWith({ month: 2 })
		fireEvent.change(month, { target: { value: 'all' } })
		expect(onUpdate).toHaveBeenLastCalledWith({ month: 'all' })
	})

	it('resets the month with the rest of the calendar', () => {
		const onUpdate = renderCalendarSection({ ...CALENDAR_DEFAULTS, year: 2030, month: 5 })
		fireEvent.click(screen.getByRole('button', { name: 'Reset Calendar settings' }))
		const question = screen.getByRole('alertdialog')
		fireEvent.click(within(question).getByRole('button', { name: 'Reset' }))
		expect(onUpdate).toHaveBeenCalledWith(CALENDAR_DEFAULTS)
	})
})
