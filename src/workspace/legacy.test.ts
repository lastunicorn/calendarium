import { describe, expect, it } from 'vitest'

import { layoutSpec } from '../layouts'
import {
	LEGACY_FILE_FORMAT,
	LEGACY_FILE_MIGRATIONS,
	LEGACY_STORAGE_MIGRATIONS,
	legacyFile,
	legacyWorkspace,
} from './legacy'
import { FIRST_FORMAT_VERSION, FIRST_PROJECT_VERSION } from './migrations'

describe('the legacy formats', () => {
	it('have a step for every version from the first to 5', () => {
		expect(FIRST_FORMAT_VERSION + LEGACY_STORAGE_MIGRATIONS.length).toBe(5)
		expect(FIRST_FORMAT_VERSION + LEGACY_FILE_MIGRATIONS.length).toBe(5)
	})
})

describe('legacyWorkspace', () => {
	it('applies each layout’s own steps to its options, by its current id', () => {
		const month = { highlightWeekends: 'columns', showWeekNumbers: true }
		const week = { year: 2030, showWeekNumbers: false }
		const stored = { version: 3, layouts: { 'month-per-page': month, 'week-per-page': week } }
		const weekly = layoutSpec('weekly').migrations
		expect(legacyWorkspace(stored)?.layouts).toEqual({
			monthly: layoutSpec('monthly').migrations[5]!(month),
			weekly: weekly[5]!(weekly[4]!(weekly[3]!(week))),
		})
	})

	it('maps the shown layout and the layouts’ keys to their current ids', () => {
		const stored = {
			version: 5,
			layout: 'week-per-page',
			layouts: { 'day-per-page': { dayPageLines: 'ruled' }, 'year-per-page': {} },
		}
		expect(legacyWorkspace(stored)).toEqual({
			shown: 'weekly',
			layouts: { daily: { content: { fill: 'ruled' } }, yearly: {} },
		})
	})

	it('reads a current id too, and leaves out the layouts this app doesn’t have', () => {
		const stored = {
			version: 4,
			layout: 'quarter-per-page',
			layouts: { 'quarter-per-page': {}, yearly: { title: 'Ours' }, toString: {} },
		}
		expect(legacyWorkspace(stored)).toEqual({
			shown: null,
			layouts: { yearly: { header: { title: 'Ours' } } },
		})
	})

	it('keeps options that are not an object for parsing to drop', () => {
		expect(legacyWorkspace({ version: 5, layouts: { 'year-per-page': 'broken' } })).toEqual({
			shown: null,
			layouts: { yearly: 'broken' },
		})
		expect(legacyWorkspace({ version: 5, layouts: 'broken' })).toEqual({
			shown: null,
			layouts: {},
		})
	})

	it('rejects data without a legacy version', () => {
		for (const version of [undefined, 2, FIRST_PROJECT_VERSION, FIRST_PROJECT_VERSION + 1]) {
			expect(legacyWorkspace({ version, layout: 'weekly', layouts: {} })).toBeNull()
		}
	})
})

describe('legacyFile', () => {
	it('gives a 6 project’s fields: no id, no name, the layout’s current id, its options grouped', () => {
		const file = {
			format: LEGACY_FILE_FORMAT,
			version: 3,
			app: '3.1.0',
			layout: 'day-per-page',
			showMiniMonth: false,
		}
		const { format: _, version: __, app: ___, ...flat } = file
		const { migrations } = layoutSpec('daily')
		const { layout: ____, ...options } = migrations[5]!(migrations[3]!(flat))
		expect(legacyFile(file)).toEqual({ id: null, name: '', layout: 'daily', options })
		expect(options).toMatchObject({ miniMonth: { show: false } })
	})

	it('leaves an unknown layout, or none, as it is', () => {
		expect(legacyFile({ version: 5, layout: 'quarter-per-page', year: 2030 })).toEqual({
			id: null,
			name: '',
			layout: 'quarter-per-page',
			options: { year: 2030 },
		})
		expect(legacyFile({ version: 5, year: 2030 })).toEqual({
			id: null,
			name: '',
			layout: undefined,
			options: { year: 2030 },
		})
	})

	it('has no id and no name, whatever fields the file holds', () => {
		const file = { version: 5, layout: 'yearly', id: 'x', name: 'Ours' }
		expect(legacyFile(file)).toMatchObject({ id: null, name: '' })
	})

	it('rejects a file without a legacy version', () => {
		for (const version of [undefined, 2, '3', FIRST_PROJECT_VERSION]) {
			expect(legacyFile({ version, layout: 'week-per-page' })).toBeNull()
		}
	})
})
