import { describe, expect, it, vi } from 'vitest'
import { LAYOUT_IDS, layoutSpec } from '../layouts'
import type { OptionsMigration } from '../layouts/LayoutSpec'
import {
	FILE_FORMAT,
	FILE_MIGRATIONS,
	FIRST_FORMAT_VERSION,
	isProjectFile,
	isFromLaterVersion,
	STORAGE_MIGRATIONS,
	upgradeFile,
	upgradeStorage,
	versionOf,
} from './migrations'
import { APP_VERSION, FORMAT_VERSION } from './version'

describe('format version', () => {
	it('is the app’s major version', () => {
		expect(FORMAT_VERSION).toBe(Number(APP_VERSION.split('.')[0]))
	})

	// Fails when the major version in `package.json` is bumped without a migration step.
	it('has a migration step for every version since the first', () => {
		expect(FIRST_FORMAT_VERSION + STORAGE_MIGRATIONS.length).toBe(FORMAT_VERSION)
		expect(FIRST_FORMAT_VERSION + FILE_MIGRATIONS.length).toBe(FORMAT_VERSION)
	})
})

describe('versionOf', () => {
	it('reads a version from the first one up', () => {
		expect(versionOf({ version: FIRST_FORMAT_VERSION })).toBe(FIRST_FORMAT_VERSION)
		expect(versionOf({ version: 9 })).toBe(9)
	})

	it('is null for a missing, earlier or invalid version', () => {
		for (const version of [undefined, 0, 1, 2, 3.5, '3', null]) {
			expect(versionOf({ version })).toBeNull()
		}
	})
})

describe('isFromLaterVersion', () => {
	it('is true for a later format version', () => {
		expect(isFromLaterVersion({ version: FORMAT_VERSION + 1 })).toBe(true)
	})

	// Derived from `APP_VERSION`, so the test holds whatever version `package.json` is at.
	const [major, minor, patch] = APP_VERSION.split('.').map(Number)

	it('is true for a later app version of the same format version', () => {
		for (const app of [`${major}.${minor}.${patch + 1}`, `${major}.${minor + 1}.0`]) {
			expect(isFromLaterVersion({ version: FORMAT_VERSION, app })).toBe(true)
		}
	})

	it('is false for this app’s version, an earlier one, or none', () => {
		expect(isFromLaterVersion({ version: FORMAT_VERSION, app: APP_VERSION })).toBe(false)
		expect(isFromLaterVersion({ version: FORMAT_VERSION, app: `${major}.0.0` })).toBe(false)
		expect(isFromLaterVersion({ version: FORMAT_VERSION, app: '0.9.9' })).toBe(false)
		expect(isFromLaterVersion({ version: FORMAT_VERSION })).toBe(false)
		expect(isFromLaterVersion({ version: FORMAT_VERSION, app: 'latest' })).toBe(false)
		expect(isFromLaterVersion({ app: '99.0.0' })).toBe(false)
	})
})

describe('upgradeStorage and upgradeFile', () => {
	it('leave current and later data as is', () => {
		for (const upgrade of [upgradeStorage, upgradeFile]) {
			const current = { version: FORMAT_VERSION, year: 2030 }
			expect(upgrade(current)).toBe(current)
			const later = { version: FORMAT_VERSION + 1, year: 2030 }
			expect(upgrade(later)).toBe(later)
		}
	})

	it('reject data without a valid version', () => {
		expect(upgradeStorage({ year: 2030 })).toBeNull()
		expect(upgradeFile({ version: 2, year: 2030 })).toBeNull()
	})
})

describe('each layout’s own steps', () => {
	// The layouts' steps say what changed (tested in their folders); these check that storage and
	// files apply them, each to its own layout's options.
	// Data before 6 names the layouts by their old ids (`week-per-page`), as these fixtures do.
	it('apply in storage to each layout’s options, leaving the other layouts as they were', () => {
		const month = { highlightWeekends: 'columns', showWeekNumbers: true }
		const week = { year: 2030, showWeekNumbers: false }
		const stored = {
			version: 3,
			layouts: { 'month-per-page': month, 'week-per-page': week, 'quarter-per-page': week },
		}
		expect(upgradeStorage(stored)?.layouts).toEqual({
			monthly: month,
			weekly: layoutSpec('weekly').migrations[5]!(layoutSpec('weekly').migrations[3]!(week)),
			'quarter-per-page': week,
		})
	})

	it('apply in a file to the options of the layout it names, keeping its tags', () => {
		const file = {
			format: FILE_FORMAT,
			version: 3,
			layout: 'day-per-page',
			showMiniMonth: false,
		}
		expect(upgradeFile(file)).toEqual({
			...layoutSpec('daily').migrations[3]!(file),
			layout: 'daily',
		})
		expect(upgradeFile(file)).toMatchObject({ format: FILE_FORMAT, version: 3 })
		const unnamed = { version: 3, showMiniMonth: false }
		expect(upgradeFile(unnamed)).toEqual(unnamed)
	})

	it('are all applied, from a version that has a step in both lists', () => {
		for (const layout of LAYOUT_IDS) {
			const { migrations } = layoutSpec(layout)
			for (const key of Object.keys(migrations)) {
				const version = Number(key)
				expect(version).toBeGreaterThanOrEqual(FIRST_FORMAT_VERSION)
				expect(version).toBeLessThan(FORMAT_VERSION)
				const step = vi.spyOn(migrations as Record<number, OptionsMigration>, version)
				upgradeStorage({ version, layouts: { [layout]: {} } })
				upgradeFile({ version, layout })
				expect(step, `${layout} from ${version}`).toHaveBeenCalledTimes(2)
				step.mockRestore()
			}
		}
	})
})

describe('the layouts’ ids from 6', () => {
	const RENAMED = {
		'year-per-page': 'yearly',
		'month-per-page': 'monthly',
		'week-per-page': 'weekly',
		'day-per-page': 'daily',
	}

	it('rename the active layout and the layouts’ keys in storage, keeping their options', () => {
		const stored = {
			version: 5,
			layout: 'week-per-page',
			layouts: Object.fromEntries(
				Object.keys(RENAMED).map((layout) => [layout, { title: layout }]),
			),
		}
		expect(upgradeStorage(stored)).toEqual({
			version: 5,
			layout: 'weekly',
			layouts: Object.fromEntries(
				Object.entries(RENAMED).map(([old, layout]) => [layout, { title: old }]),
			),
		})
	})

	it('rename the layout a file names, keeping its tags and options', () => {
		const file = { format: FILE_FORMAT, version: 5, layout: 'month-per-page', title: 'Ours' }
		expect(upgradeFile(file)).toEqual({ ...file, layout: 'monthly' })
	})

	it('rename before applying a layout’s own step from 5', () => {
		const stored = { version: 5, layouts: { 'day-per-page': { dayPageLines: 'ruled' } } }
		expect(upgradeStorage(stored)?.layouts).toEqual({ daily: { dayPageFill: 'ruled' } })
		const file = { version: 5, layout: 'day-per-page', dayPageLines: 'ruled' }
		expect(upgradeFile(file)).toEqual({ version: 5, layout: 'daily', dayPageFill: 'ruled' })
	})

	it('rename from any earlier version too', () => {
		const stored = { version: 3, layout: 'year-per-page', layouts: { 'year-per-page': {} } }
		expect(upgradeStorage(stored)).toEqual({
			version: 3,
			layout: 'yearly',
			layouts: { yearly: {} },
		})
		expect(upgradeFile({ version: 4, layout: 'year-per-page' })?.layout).toBe('yearly')
	})

	it('leave a current id, an unknown one or no layout as they are', () => {
		for (const layout of ['weekly', 'quarter-per-page', 'toString', 42, undefined]) {
			const stored = { version: 5, layout, layouts: { [String(layout)]: {} } }
			expect(upgradeStorage(stored)).toEqual(stored)
			expect(upgradeFile({ version: 5, layout })).toEqual({ version: 5, layout })
		}
		const unnamed = { version: 5, year: 2030 }
		expect(upgradeFile(unnamed)).toEqual(unnamed)
		expect(upgradeStorage(unnamed)).toEqual(unnamed)
	})
})

describe('isProjectFile', () => {
	it('accepts only files marked with the format', () => {
		expect(isProjectFile({ format: FILE_FORMAT })).toBe(true)
		expect(isProjectFile({ year: 2030 })).toBe(false)
		expect(isProjectFile({ format: 'other' })).toBe(false)
	})
})
