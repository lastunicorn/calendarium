import { describe, expect, it } from 'vitest'

import { APP_VERSION, FORMAT_VERSION, isLaterAppVersion } from './version'

const [major, minor, patch] = APP_VERSION.split('.').map(Number)

describe('APP_VERSION', () => {
	it('is major.minor.patch, its major the format version', () => {
		expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/)
		expect(FORMAT_VERSION).toBe(major)
	})
})

describe('isLaterAppVersion', () => {
	it('is true of a later major, minor or patch', () => {
		expect(isLaterAppVersion(`${major + 1}.0.0`)).toBe(true)
		expect(isLaterAppVersion(`${major}.${minor + 1}.0`)).toBe(true)
		expect(isLaterAppVersion(`${major}.${minor}.${patch + 1}`)).toBe(true)
	})

	it('compares the parts as numbers, not as text', () => {
		// "x.10.0" sorts before "x.9.0" as text.
		expect(isLaterAppVersion(`${major}.${minor + 10}.0`)).toBe(true)
		expect(isLaterAppVersion(`${major + 10}.0.0`)).toBe(true)
	})

	it('is false of this version and of earlier ones', () => {
		expect(isLaterAppVersion(APP_VERSION)).toBe(false)
		expect(isLaterAppVersion(`${major - 1}.99.99`)).toBe(false)
		expect(isLaterAppVersion('0.0.0')).toBe(false)
	})

	it('is false of anything that is not major.minor.patch', () => {
		expect(isLaterAppVersion(`${major + 1}.0.0-beta`)).toBe(false)
		expect(isLaterAppVersion(`${major + 1}.0`)).toBe(false)
		expect(isLaterAppVersion(`v${major + 1}.0.0`)).toBe(false)
		expect(isLaterAppVersion(major + 1)).toBe(false)
		expect(isLaterAppVersion(null)).toBe(false)
		expect(isLaterAppVersion(undefined)).toBe(false)
	})
})
