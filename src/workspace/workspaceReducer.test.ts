import { describe, expect, it } from 'vitest'
import { workspaceReducer } from './workspaceReducer'
import { defaultWorkspace } from './Workspace'
import { defaultLayoutOptions } from '../layouts'

describe('workspaceReducer', () => {
	it('selectLayout changes only the active layout', () => {
		const workspace = defaultWorkspace()
		const selected = workspaceReducer(workspace, {
			type: 'selectLayout',
			layout: 'daily',
		})
		expect(selected).toEqual({ ...workspace, layout: 'daily' })
		expect(selected.layouts).toBe(workspace.layouts)
	})

	it('restores a layout’s options when switching back to it', () => {
		let workspace = defaultWorkspace()
		workspace = workspaceReducer(workspace, {
			type: 'update',
			layout: 'yearly',
			patch: { calendar: { year: 2030 }, header: { title: 'Hi' } },
		})
		workspace = workspaceReducer(workspace, { type: 'selectLayout', layout: 'monthly' })
		workspace = workspaceReducer(workspace, {
			type: 'update',
			layout: 'monthly',
			patch: { calendar: { year: 2040 } },
		})
		workspace = workspaceReducer(workspace, { type: 'selectLayout', layout: 'yearly' })
		expect(workspace.layouts['yearly']).toMatchObject({
			calendar: { year: 2030 },
			header: { title: 'Hi' },
		})
		expect(workspace.layouts.monthly.calendar.year).toBe(2040)
	})

	it('update changes only the patched fields of the given layout', () => {
		const workspace = defaultWorkspace()
		const updated = workspaceReducer(workspace, {
			type: 'update',
			layout: 'yearly',
			patch: { calendar: { year: 2030 }, header: { title: 'Hi' } },
		})
		expect(updated.layouts['yearly']).toEqual({
			...workspace.layouts.yearly,
			calendar: { ...workspace.layouts.yearly.calendar, year: 2030 },
			header: { ...workspace.layouts.yearly.header, title: 'Hi' },
		})
		expect(updated.layouts['monthly']).toBe(workspace.layouts['monthly'])
		expect(updated.layouts['daily']).toBe(workspace.layouts['daily'])
	})

	it('update patches a nested object field by field', () => {
		const workspace = defaultWorkspace()
		const updated = workspaceReducer(workspace, {
			type: 'update',
			layout: 'daily',
			patch: { page: { margins: { top: 5 } }, miniMonth: { size: 'large' } },
		})
		const { page, miniMonth } = workspace.layouts.daily
		expect(updated.layouts.daily.page).toEqual({
			...page,
			margins: { ...page.margins, top: 5 },
			// The top margin alone changed, so the margins are no longer equal.
			equalMargins: false,
		})
		expect(updated.layouts.daily.miniMonth).toEqual({ ...miniMonth, size: 'large' })
	})

	it('update keeps the workspace when the patch changes nothing', () => {
		const workspace = defaultWorkspace()
		const { calendar, page } = workspace.layouts.weekly
		const patch = {
			calendar: { year: calendar.year },
			page: { margins: { top: page.margins.top } },
		}
		expect(workspaceReducer(workspace, { type: 'update', layout: 'weekly', patch })).toBe(
			workspace,
		)
	})

	it('update returns a new object and leaves the old one untouched', () => {
		const workspace = defaultWorkspace()
		const before = structuredClone(workspace)
		const updated = workspaceReducer(workspace, {
			type: 'update',
			layout: 'daily',
			patch: {
				miniMonth: {
					...workspace.layouts['daily'].miniMonth,
					showWeekNumbers: false,
				},
			},
		})
		expect(updated).not.toBe(workspace)
		expect(workspace).toEqual(before)
	})

	it('newProject restores one layout’s defaults and keeps the active layout and the others', () => {
		let workspace = defaultWorkspace()
		workspace = workspaceReducer(workspace, {
			type: 'update',
			layout: 'daily',
			patch: { calendar: { year: 1999 }, firstHour: 3 },
		})
		workspace = workspaceReducer(workspace, {
			type: 'update',
			layout: 'yearly',
			patch: { header: { title: 'Hi' } },
		})
		const started = workspaceReducer(workspace, { type: 'newProject', layout: 'daily' })
		expect(started.layouts['daily']).toEqual(defaultLayoutOptions('daily'))
		expect(started.layouts['yearly']).toBe(workspace.layouts['yearly'])
		expect(started.layout).toBe('yearly')
	})

	it('openProject swaps in one layout’s project and shows that layout', () => {
		const next = { ...defaultLayoutOptions('monthly'), year: 1999 }
		const opened = workspaceReducer(defaultWorkspace(), {
			type: 'openProject',
			project: { layout: 'monthly', options: next },
		})
		expect(opened.layout).toBe('monthly')
		expect(opened.layouts['monthly']).toBe(next)
	})
})
