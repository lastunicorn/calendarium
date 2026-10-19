import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { LayoutId } from '../../config/CalendarConfig'
import { defaultAppConfig } from '../../config/layouts'
import { ConfigForm } from './ConfigForm'

function noop() {}

/**
 * The titles of the form's sections, top to bottom. Each is a `<fieldset>`; groups inside one
 * (like the margins) are part of that section.
 */
function sectionTitles(layout: LayoutId): string[] {
	const config = { ...defaultAppConfig(), layout }
	render(<ConfigForm config={config} onSelectLayout={noop} onUpdate={noop} />)
	return screen
		.getAllByRole('group')
		.filter((group) => group.parentElement?.closest('fieldset') === null)
		.map((section) => section.querySelector('legend')!.textContent)
}

describe('ConfigForm', () => {
	it('shows the header options only on the year layout', () => {
		expect(sectionTitles('year-per-page')).toEqual([
			'Layout',
			'Calendar',
			'Header',
			'Appearance',
			'Page',
		])
	})

	it('shows the shared sections only on the month layout', () => {
		expect(sectionTitles('month-per-page')).toEqual([
			'Layout',
			'Calendar',
			'Appearance',
			'Page',
		])
	})

	it('shows the week page options only on the week layout', () => {
		expect(sectionTitles('week-per-page')).toEqual([
			'Layout',
			'Calendar',
			'Appearance',
			'Week page',
			'Page',
		])
	})

	it('shows the day page options only on the day layout', () => {
		expect(sectionTitles('day-per-page')).toEqual([
			'Layout',
			'Calendar',
			'Appearance',
			'Day page',
			'Page',
		])
		expect(screen.queryByLabelText('Title')).toBeNull()
	})
})
