import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { type Workspace, defaultWorkspace } from '../../workspace/Workspace'
import { LAYOUT_IDS, type LayoutId } from '../../layouts'
import { Preview } from './Preview'

function noop() {}

/** The default workspace showing `layout`. */
function workspaceFor(layout: LayoutId): Workspace {
	return { ...defaultWorkspace(), layout }
}

// What each layout draws is tested in its folder, `layouts/<layout-id>/ui/`; these check that the
// preview draws the chosen one, whichever it is.
describe('Preview', () => {
	it.each(LAYOUT_IDS)('draws the pages of %s', (layout) => {
		const { container } = render(
			<Preview workspace={workspaceFor(layout)} onNewProject={noop} />,
		)
		expect(container.querySelectorAll('section').length).toBeGreaterThan(0)
	})

	it('sets the printed paper size from the layout', () => {
		const { container } = render(
			<Preview workspace={workspaceFor('month-per-page')} onNewProject={noop} />,
		)
		expect(container.querySelector('style')?.textContent).toBe('@page { size: A4 landscape; }')
	})

	it('prints a booklet on a sheet of two pages, completing the last sheet', () => {
		const workspace = workspaceFor('month-per-page')
		const options = workspace.layouts['month-per-page']
		const { container } = render(
			<Preview
				workspace={{
					...workspace,
					layouts: {
						...workspace.layouts,
						'month-per-page': { ...options, page: { ...options.page, booklet: true } },
					},
				}}
				onNewProject={noop}
			/>,
		)
		// Two A4 landscape pages, one above the other.
		expect(container.querySelector('style')?.textContent).toBe('@page { size: 297mm 420mm; }')
		expect(container.querySelectorAll('section')).toHaveLength(12)
	})

	it('marks the pages with the calendar’s language', () => {
		const workspace = workspaceFor('year-per-page')
		const options = { ...workspace.layouts['year-per-page'], locale: 'el-GR' as const }
		const { container } = render(
			<Preview
				workspace={{
					...workspace,
					layouts: { ...workspace.layouts, 'year-per-page': options },
				}}
				onNewProject={noop}
			/>,
		)
		expect(container.querySelector('main')?.lang).toBe('el-GR')
	})
})
