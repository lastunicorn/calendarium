import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WEEK_PER_PAGE_SPEC } from '../options'
import { formSectionTitles } from '../../../test/formSections'
import { WeekPerPageForm } from './WeekPerPageForm'

describe('WeekPerPageForm', () => {
	it('shows the header, mini calendar and content options', () => {
		expect(formSectionTitles(WeekPerPageForm, WEEK_PER_PAGE_SPEC.defaults())).toEqual([
			'Calendar',
			'Events',
			'Header',
			'Mini calendar',
			'Content',
			'Page',
		])
	})

	it('offers the current and the next month as mini calendars', () => {
		formSectionTitles(WeekPerPageForm, WEEK_PER_PAGE_SPEC.defaults())
		expect(
			screen.getByRole<HTMLInputElement>('checkbox', { name: 'Show current month' }).checked,
		).toBe(true)
		expect(
			screen.getByRole<HTMLInputElement>('checkbox', { name: 'Show next month' }).checked,
		).toBe(false)
	})
})
