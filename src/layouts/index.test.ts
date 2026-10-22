import { describe, expect, it } from 'vitest'
import { LAYOUT_IDS, layoutSpec, migrateLayoutOptions } from './index'
import { parseOptions } from './LayoutSpec'

// What every layout's spec must do, whatever its options: a new layout is checked here as soon as
// it is listed. What each one's rules mean is tested in its own folder.
describe.each(LAYOUT_IDS)('the %s spec', (layout) => {
	const spec = layoutSpec(layout)

	it('gives defaults that pass its own validation', () => {
		const defaults = spec.defaults()
		const ignored: string[] = []
		expect(parseOptions(spec, defaults, ignored)).toEqual(defaults)
		expect(ignored).toEqual([])
	})

	it('gives a fresh copy of its defaults each time, nested objects included', () => {
		const first = spec.defaults()
		const second = spec.defaults()
		expect(second).toEqual(first)
		expect(second).not.toBe(first)
		for (const [field, value] of Object.entries(first)) {
			if (typeof value === 'object' && value !== null) {
				expect(second[field as keyof typeof second], field).not.toBe(value)
			}
		}
	})

	it('validates every field of its defaults', () => {
		expect(Object.keys(spec.validators).sort()).toEqual(Object.keys(spec.defaults()).sort())
	})

	it('keeps its defaults as they are when normalizing', () => {
		const defaults = spec.defaults()
		expect(spec.normalize(defaults)).toBe(defaults)
	})

	it('normalizes to options that are already normal', () => {
		const defaults = spec.defaults()
		const margins = { top: 5, right: 10, bottom: 15, left: 20 }
		const normalized = spec.normalize({ ...defaults, page: { ...defaults.page, margins } })
		expect(normalized).not.toBe(defaults)
		expect(spec.normalize(normalized)).toBe(normalized)
	})

	it('keys its migrations by config version', () => {
		for (const version of Object.keys(spec.migrations)) {
			expect(Number.isInteger(Number(version)), version).toBe(true)
		}
	})
})

describe('LAYOUT_IDS', () => {
	it('names each layout once', () => {
		expect(new Set(LAYOUT_IDS).size).toBe(LAYOUT_IDS.length)
	})
})

describe('migrateLayoutOptions', () => {
	it('returns the options of an unknown layout, or of a version without a step, as they are', () => {
		const options = { year: 2030 }
		expect(migrateLayoutOptions('quarter-per-page', 3, options)).toBe(options)
		expect(migrateLayoutOptions(undefined, 3, options)).toBe(options)
		for (const layout of LAYOUT_IDS) {
			expect(migrateLayoutOptions(layout, 999, options)).toBe(options)
		}
	})
})
