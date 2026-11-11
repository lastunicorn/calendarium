import { describe, expect, it, vi } from 'vitest'
import { LAYOUT_IDS, layoutSpec } from '../layouts'
import type { OptionsMigration } from '../layouts/LayoutSpec'
import { legacyFile, legacyWorkspace } from './legacy'
import {
	FIRST_FORMAT_VERSION,
	FIRST_PROJECT_VERSION,
	isFromLaterVersion,
	PROJECT_MIGRATIONS,
	upgradeProject,
	versionOf,
} from './migrations'
import { APP_VERSION, FORMAT_VERSION } from './version'

describe('format version', () => {
	it('is the app’s major version', () => {
		expect(FORMAT_VERSION).toBe(Number(APP_VERSION.split('.')[0]))
	})

	// Fails when the major version in `package.json` is bumped without a migration step.
	it('has a migration step for every version since the serialized project’s first', () => {
		expect(FIRST_PROJECT_VERSION + PROJECT_MIGRATIONS.length).toBe(FORMAT_VERSION)
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

describe('upgradeProject', () => {
	it('leaves current and later projects as they are', () => {
		const current = { version: FORMAT_VERSION, layout: 'daily', options: {} }
		expect(upgradeProject(current)).toBe(current)
		const later = { version: FORMAT_VERSION + 1, layout: 'daily', options: {} }
		expect(upgradeProject(later)).toBe(later)
	})

	it('rejects data without a version from the serialized project’s first', () => {
		for (const version of [undefined, 2, 3, 5, '6']) {
			expect(upgradeProject({ version, layout: 'daily', options: {} })).toBeNull()
		}
	})
})

describe('each layout’s own steps', () => {
	// The layouts' steps say what changed (tested in their folders); this checks that each one is
	// applied: those from 3 to 5 by both legacy paths, storage's and files', and those from 6 on by
	// `PROJECT_MIGRATIONS`, which storage and files share.
	it('are all applied, from a version that has a step', () => {
		for (const layout of LAYOUT_IDS) {
			const { migrations } = layoutSpec(layout)
			for (const key of Object.keys(migrations)) {
				const version = Number(key)
				expect(version).toBeGreaterThanOrEqual(FIRST_FORMAT_VERSION)
				expect(version).toBeLessThan(FORMAT_VERSION)
				const step = vi.spyOn(migrations as Record<number, OptionsMigration>, version)
				if (version < FIRST_PROJECT_VERSION) {
					legacyWorkspace({ version, layouts: { [layout]: {} } })
					legacyFile({ version, layout })
					expect(step, `${layout} from ${version}`).toHaveBeenCalledTimes(2)
				} else {
					upgradeProject({ version, layout, options: {} })
					expect(step, `${layout} from ${version}`).toHaveBeenCalledTimes(1)
				}
				step.mockRestore()
			}
		}
	})
})
