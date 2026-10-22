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
})
