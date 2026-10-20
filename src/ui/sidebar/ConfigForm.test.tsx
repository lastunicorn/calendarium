import { fireEvent, render, screen, within } from '@testing-library/react'
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
	render(
		<ConfigForm
			config={config}
			onSelectLayout={noop}
			onUpdate={noop}
			onResetLayout={noop}
			onImportLayout={noop}
		/>,
	)
	return screen
		.getAllByRole('group')
		.filter((group) => group.parentElement?.closest('fieldset') === null)
		.map((section) => section.querySelector('legend')!.textContent)
}

describe('ConfigForm', () => {
	it('shows the header and content options on the year layout', () => {
		expect(sectionTitles('year-per-page')).toEqual([
			'Layout',
			'Calendar',
			'Header',
			'Content',
			'Page',
		])
	})

	it('shows the header and content options on the month layout', () => {
		expect(sectionTitles('month-per-page')).toEqual([
			'Layout',
			'Calendar',
			'Header',
			'Content',
			'Page',
		])
	})

	it('shows the content and mini calendar options on the week layout', () => {
		expect(sectionTitles('week-per-page')).toEqual([
			'Layout',
			'Calendar',
			'Header',
			'Mini calendar',
			'Content',
			'Page',
		])
	})

	it('shows the day page and mini calendar options only on the day layout', () => {
		expect(sectionTitles('day-per-page')).toEqual([
			'Layout',
			'Calendar',
			'Header',
			'Mini calendar',
			'Day page',
			'Page',
		])
		expect(screen.queryByLabelText('Title')).toBeNull()
	})

	it('keeps the layout picker open, starts every other section collapsed, and opens one when its title is clicked', () => {
		const [layoutTitle, ...titles] = sectionTitles('year-per-page')
		expect(layoutTitle).toBe('Layout')
		expect(screen.queryByRole('button', { name: 'Layout' })).toBeNull()
		expect(screen.getByRole('group', { name: 'Layout' }).querySelector('select')).not.toBeNull()
		const actions = within(screen.getByRole('group', { name: 'Layout' })).getByRole('toolbar')
		expect(
			within(actions)
				.getAllByRole('button')
				.map((button) => button.title),
		).toEqual([
			'Export settings to a file',
			'Import settings from a file',
			'Reset layout settings',
		])
		const toggles = screen.getAllByRole('button', { expanded: false })
		expect(toggles.map((button) => button.textContent)).toEqual(titles)
		expect(screen.queryByLabelText('Year')).toBeNull()

		const calendar = screen.getByRole('button', { name: 'Calendar' })
		fireEvent.click(calendar)
		expect(calendar.getAttribute('aria-expanded')).toBe('true')
		expect(screen.getByLabelText('Year')).not.toBeNull()

		fireEvent.click(calendar)
		expect(screen.queryByLabelText('Year')).toBeNull()
	})

	it('closes the open section when another one is opened', () => {
		sectionTitles('year-per-page')
		const calendar = screen.getByRole('button', { name: 'Calendar' })
		const page = screen.getByRole('button', { name: 'Page' })
		fireEvent.click(calendar)

		fireEvent.click(page)
		expect(page.getAttribute('aria-expanded')).toBe('true')
		expect(calendar.getAttribute('aria-expanded')).toBe('false')
		expect(screen.queryByLabelText('Year')).toBeNull()
		expect(screen.getByRole('group', { name: 'Layout' }).querySelector('select')).not.toBeNull()
		const actions = within(screen.getByRole('group', { name: 'Layout' })).getByRole('toolbar')
		expect(
			within(actions)
				.getAllByRole('button')
				.map((button) => button.title),
		).toEqual([
			'Export settings to a file',
			'Import settings from a file',
			'Reset layout settings',
		])
	})

	it('keeps a section open on another layout and after a reload', () => {
		const config = defaultAppConfig()
		const { rerender, unmount } = render(
			<ConfigForm
				config={config}
				onSelectLayout={noop}
				onUpdate={noop}
				onResetLayout={noop}
				onImportLayout={noop}
			/>,
		)
		fireEvent.click(screen.getByRole('button', { name: 'Calendar' }))

		rerender(
			<ConfigForm
				config={{ ...config, layout: 'day-per-page' }}
				onSelectLayout={noop}
				onUpdate={noop}
				onResetLayout={noop}
				onImportLayout={noop}
			/>,
		)
		expect(screen.getByLabelText('Year')).not.toBeNull()
		expect(screen.getByRole('button', { name: 'Day page' }).getAttribute('aria-expanded')).toBe(
			'false',
		)

		unmount()
		render(
			<ConfigForm
				config={config}
				onSelectLayout={noop}
				onUpdate={noop}
				onResetLayout={noop}
				onImportLayout={noop}
			/>,
		)
		expect(screen.getByLabelText('Year')).not.toBeNull()
	})

	it('shows the spine only with mirrored margins', () => {
		const config = defaultAppConfig()
		const { rerender } = render(
			<ConfigForm
				config={config}
				onSelectLayout={noop}
				onUpdate={noop}
				onResetLayout={noop}
				onImportLayout={noop}
			/>,
		)
		fireEvent.click(screen.getByRole('button', { name: 'Page' }))
		expect(screen.queryByRole('group', { name: 'Spine' })).toBeNull()

		const layout = config.layouts[config.layout]
		const mirrored = {
			...config,
			layouts: {
				...config.layouts,
				[config.layout]: { ...layout, page: { ...layout.page, mirrorMargins: true } },
			},
		}
		rerender(
			<ConfigForm
				config={mirrored}
				onSelectLayout={noop}
				onUpdate={noop}
				onResetLayout={noop}
				onImportLayout={noop}
			/>,
		)
		expect(screen.getByRole('group', { name: 'Spine' })).not.toBeNull()
	})

	it('labels the hovered or focused layout action under the buttons', () => {
		render(
			<ConfigForm
				config={defaultAppConfig()}
				onSelectLayout={noop}
				onUpdate={noop}
				onResetLayout={noop}
				onImportLayout={noop}
			/>,
		)
		const actions = screen.getByRole('toolbar', { name: 'Layout settings' })
		const hint = actions.nextElementSibling!
		expect(hint.textContent).toBe('')

		fireEvent.pointerOver(screen.getByRole('button', { name: 'Reset layout settings' }))
		expect(hint.textContent).toBe('Reset layout settings')
		fireEvent.pointerLeave(actions)
		expect(hint.textContent).toBe('')

		fireEvent.focus(screen.getByRole('button', { name: 'Export settings to a file' }))
		expect(hint.textContent).toBe('Export settings to a file')
	})
})
