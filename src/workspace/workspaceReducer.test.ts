import { describe, expect, it } from 'vitest'
import { workspaceReducer } from './workspaceReducer'
import { defaultWorkspace } from './Workspace'
import { defaultLayoutOptions } from '../layouts'

describe('workspaceReducer', () => {
	it('selectLayout changes only the active layout', () => {
		const workspace = defaultWorkspace()
		const selected = workspaceReducer(workspace, {
			type: 'selectLayout',
			layout: 'day-per-page',
		})
		expect(selected).toEqual({ ...workspace, layout: 'day-per-page' })
		expect(selected.layouts).toBe(workspace.layouts)
	})

	it('restores a layout’s options when switching back to it', () => {
		let workspace = defaultWorkspace()
		workspace = workspaceReducer(workspace, {
			type: 'update',
			layout: 'year-per-page',
			patch: { year: 2030, title: 'Hi' },
		})
		workspace = workspaceReducer(workspace, { type: 'selectLayout', layout: 'month-per-page' })
		workspace = workspaceReducer(workspace, {
			type: 'update',
			layout: 'month-per-page',
			patch: { year: 2040 },
		})
		workspace = workspaceReducer(workspace, { type: 'selectLayout', layout: 'year-per-page' })
		expect(workspace.layouts['year-per-page']).toMatchObject({ year: 2030, title: 'Hi' })
		expect(workspace.layouts['month-per-page'].year).toBe(2040)
	})

	it('update changes only the patched fields of the given layout', () => {
		const workspace = defaultWorkspace()
		const updated = workspaceReducer(workspace, {
			type: 'update',
			layout: 'year-per-page',
			patch: { year: 2030, title: 'Hi' },
		})
		expect(updated.layouts['year-per-page']).toEqual({
			...workspace.layouts['year-per-page'],
			year: 2030,
			title: 'Hi',
		})
		expect(updated.layouts['month-per-page']).toBe(workspace.layouts['month-per-page'])
		expect(updated.layouts['day-per-page']).toBe(workspace.layouts['day-per-page'])
	})

	it('update returns a new object and leaves the old one untouched', () => {
		const workspace = defaultWorkspace()
		const before = structuredClone(workspace)
		const updated = workspaceReducer(workspace, {
			type: 'update',
			layout: 'day-per-page',
			patch: {
				miniMonth: {
					...workspace.layouts['day-per-page'].miniMonth,
					showWeekNumbers: false,
				},
			},
		})
		expect(updated).not.toBe(workspace)
		expect(workspace).toEqual(before)
	})

	it('resetLayout restores one layout’s defaults and keeps the active layout and the others', () => {
		let workspace = defaultWorkspace()
		workspace = workspaceReducer(workspace, {
			type: 'update',
			layout: 'day-per-page',
			patch: { year: 1999, firstHour: 3 },
		})
		workspace = workspaceReducer(workspace, {
			type: 'update',
			layout: 'year-per-page',
			patch: { title: 'Hi' },
		})
		const reset = workspaceReducer(workspace, { type: 'resetLayout', layout: 'day-per-page' })
		expect(reset.layouts['day-per-page']).toEqual(defaultLayoutOptions('day-per-page'))
		expect(reset.layouts['year-per-page']).toBe(workspace.layouts['year-per-page'])
		expect(reset.layout).toBe('year-per-page')
	})

	it('importLayout swaps one layout’s options and shows that layout', () => {
		const next = { ...defaultLayoutOptions('month-per-page'), year: 1999 }
		const imported = workspaceReducer(defaultWorkspace(), {
			type: 'importLayout',
			layout: 'month-per-page',
			options: next,
		})
		expect(imported.layout).toBe('month-per-page')
		expect(imported.layouts['month-per-page']).toBe(next)
	})
})
