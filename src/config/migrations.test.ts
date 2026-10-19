import { describe, expect, it } from 'vitest'
import {
	FILE_FORMAT,
	FILE_MIGRATIONS,
	FIRST_CONFIG_VERSION,
	isConfigFile,
	isFromLaterVersion,
	STORAGE_MIGRATIONS,
	upgradeFile,
	upgradeStorage,
	versionOf,
} from './migrations'
import { APP_VERSION, CONFIG_VERSION } from './version'

describe('config version', () => {
	it('is the app’s major version', () => {
		expect(CONFIG_VERSION).toBe(Number(APP_VERSION.split('.')[0]))
	})

	// Fails when the major version in `package.json` is bumped without a migration step.
	it('has a migration step for every version since the first', () => {
		expect(FIRST_CONFIG_VERSION + STORAGE_MIGRATIONS.length).toBe(CONFIG_VERSION)
		expect(FIRST_CONFIG_VERSION + FILE_MIGRATIONS.length).toBe(CONFIG_VERSION)
	})
})

describe('versionOf', () => {
	it('reads a version from the first one up', () => {
		expect(versionOf({ version: FIRST_CONFIG_VERSION })).toBe(FIRST_CONFIG_VERSION)
		expect(versionOf({ version: 9 })).toBe(9)
	})

	it('is null for a missing, earlier or invalid version', () => {
		for (const version of [undefined, 0, 1, 2, 3.5, '3', null]) {
			expect(versionOf({ version })).toBeNull()
		}
	})
})

describe('isFromLaterVersion', () => {
	it('is true for a later config version', () => {
		expect(isFromLaterVersion({ version: CONFIG_VERSION + 1 })).toBe(true)
	})

	// Derived from `APP_VERSION`, so the test holds whatever version `package.json` is at.
	const [major, minor, patch] = APP_VERSION.split('.').map(Number)

	it('is true for a later app version of the same config version', () => {
		for (const app of [`${major}.${minor}.${patch + 1}`, `${major}.${minor + 1}.0`]) {
			expect(isFromLaterVersion({ version: CONFIG_VERSION, app })).toBe(true)
		}
	})

	it('is false for this app’s version, an earlier one, or none', () => {
		expect(isFromLaterVersion({ version: CONFIG_VERSION, app: APP_VERSION })).toBe(false)
		expect(isFromLaterVersion({ version: CONFIG_VERSION, app: `${major}.0.0` })).toBe(false)
		expect(isFromLaterVersion({ version: CONFIG_VERSION, app: '0.9.9' })).toBe(false)
		expect(isFromLaterVersion({ version: CONFIG_VERSION })).toBe(false)
		expect(isFromLaterVersion({ version: CONFIG_VERSION, app: 'latest' })).toBe(false)
		expect(isFromLaterVersion({ app: '99.0.0' })).toBe(false)
	})
})

describe('upgradeStorage and upgradeFile', () => {
	it('leave current and later data as is', () => {
		for (const upgrade of [upgradeStorage, upgradeFile]) {
			const current = { version: CONFIG_VERSION, year: 2030 }
			expect(upgrade(current)).toBe(current)
			const later = { version: CONFIG_VERSION + 1, year: 2030 }
			expect(upgrade(later)).toBe(later)
		}
	})

	it('reject data without a valid version', () => {
		expect(upgradeStorage({ year: 2030 })).toBeNull()
		expect(upgradeFile({ version: 2, year: 2030 })).toBeNull()
	})
})

describe('isConfigFile', () => {
	it('accepts only files marked with the format', () => {
		expect(isConfigFile({ format: FILE_FORMAT })).toBe(true)
		expect(isConfigFile({ year: 2030 })).toBe(false)
		expect(isConfigFile({ format: 'other' })).toBe(false)
	})
})
