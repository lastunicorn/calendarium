import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TEST_ENV } from '../../../test/environment'
import { formSectionTitles } from '../../../test/formSections'
import { WEEKLY_SPEC } from '../options'
import { WeeklyForm } from './WeeklyForm'

describe('WeeklyForm', () => {
	it('shows the header, mini calendar and content options', () => {
		expect(formSectionTitles(WeeklyForm, WEEKLY_SPEC.defaults(TEST_ENV))).toEqual([
			'Calendar',
			'Events',
			'Header',
			'Mini calendar',
			'Content',
			'Footer',
			'Page',
		])
	})

	it('offers the current and the next month as mini calendars', () => {
		formSectionTitles(WeeklyForm, WEEKLY_SPEC.defaults(TEST_ENV))
		expect(
			screen.getByRole<HTMLInputElement>('checkbox', { name: 'Show current month' }).checked,
		).toBe(true)
		expect(
			screen.getByRole<HTMLInputElement>('checkbox', { name: 'Show next month' }).checked,
		).toBe(false)
	})
})
