import { describe, expect, it } from 'vitest'
import { defaultLayoutOptions, LAYOUT_IDS, normalizeLayout } from '../layouts'
import { defaultWorkspace } from './Workspace'
import { workspaceReducer } from './workspaceReducer'
import { parseWorkspace, toStoredWorkspace } from './parseWorkspace'

// Each layout's own rules are tested in its `options.test.ts`; these check the page rules every
// layout shares, and that every layout's options in state pass through its layout's rules.

const DIFFERING = { top: 5, right: 10, bottom: 15, left: 20 }

describe('normalizeLayout', () => {
	it('applies the page rules in every layout', () => {
		for (const layout of LAYOUT_IDS) {
			const workspace = defaultLayoutOptions(layout)
			expect(workspace.page.equalMargins).toBe(true)
			const differing = { ...workspace.page, margins: DIFFERING }
			expect(normalizeLayout(layout, { ...workspace, page: differing }).page).toEqual({
				...differing,
				equalMargins: false,
			})
			const mirrored = { ...workspace.page, mirrorMargins: true }
			expect(
				normalizeLayout(layout, { ...workspace, page: mirrored }).page.equalMargins,
			).toBe(false)
		}
	})

	it('keeps the differing margins of settings saved before equal margins', () => {
		const stored = toStoredWorkspace(defaultWorkspace())
		const day = stored.layouts['day-per-page']
		const { equalMargins: _, ...page } = { ...day.page, margins: DIFFERING }
		const layouts = { ...stored.layouts, 'day-per-page': { ...day, page } }
		expect(parseWorkspace({ ...stored, layouts }).layouts['day-per-page'].page).toMatchObject({
			margins: DIFFERING,
			equalMargins: false,
		})
	})

	it('applies to every reducer change of a layout’s options', () => {
		const layout = 'month-per-page'
		const { page } = defaultLayoutOptions(layout)
		const updated = workspaceReducer(defaultWorkspace(), {
			type: 'update',
			layout,
			patch: { page: { ...page, mirrorMargins: true } },
		})
		expect(updated.layouts[layout].page.equalMargins).toBe(false)

		const imported = workspaceReducer(defaultWorkspace(), {
			type: 'importLayout',
			layout,
			options: { ...defaultLayoutOptions(layout), page: { ...page, margins: DIFFERING } },
		})
		expect(imported.layouts[layout].page.equalMargins).toBe(false)
	})
})
