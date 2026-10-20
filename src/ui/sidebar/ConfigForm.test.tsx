import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { LayoutId } from '../../layouts'
import { defaultAppConfig } from '../../config/AppConfig'
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

	it('shows the week page and mini calendar options only on the week layout', () => {
		expect(sectionTitles('week-per-page')).toEqual([
			'Layout',
			'Calendar',
			'Header',
			'Week page',
			'Mini calendar',
			'Page',
		])
	})

	it('shows the day page and mini calendar options only on the day layout', () => {
		expect(sectionTitles('day-per-page')).toEqual([
			'Layout',
			'Calendar',
			'Header',
			'Day page',
			'Mini calendar',
			'Page',
		])
		expect(screen.queryByLabelText('Title')).toBeNull()
	})

	it('shows the spine only with mirrored margins', () => {
		const config = defaultAppConfig()
		const { rerender } = render(
			<ConfigForm config={config} onSelectLayout={noop} onUpdate={noop} />,
		)
		expect(screen.queryByRole('group', { name: 'Spine' })).toBeNull()

		const layout = config.layouts[config.layout]
		const mirrored = {
			...config,
			layouts: {
				...config.layouts,
				[config.layout]: { ...layout, page: { ...layout.page, mirrorMargins: true } },
			},
		}
		rerender(<ConfigForm config={mirrored} onSelectLayout={noop} onUpdate={noop} />)
		expect(screen.getByRole('group', { name: 'Spine' })).not.toBeNull()
	})
})
