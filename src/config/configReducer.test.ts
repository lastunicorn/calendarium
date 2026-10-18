import { describe, expect, it } from 'vitest'
import { DEFAULTS, defaultAppConfig } from './CalendarConfig'
import { configReducer } from './configReducer'

describe('configReducer', () => {
	it('selectLayout changes only the active layout', () => {
		const config = defaultAppConfig()
		const selected = configReducer(config, { type: 'selectLayout', layout: 'day-per-page' })
		expect(selected).toEqual({ ...config, layout: 'day-per-page' })
		expect(selected.layouts).toBe(config.layouts)
	})

	it('restores a layout’s options when switching back to it', () => {
		let config = defaultAppConfig()
		config = configReducer(config, {
			type: 'update',
			layout: 'year-per-page',
			patch: { year: 2030, title: 'Hi' },
		})
		config = configReducer(config, { type: 'selectLayout', layout: 'month-per-page' })
		config = configReducer(config, {
			type: 'update',
			layout: 'month-per-page',
			patch: { year: 2040 },
		})
		config = configReducer(config, { type: 'selectLayout', layout: 'year-per-page' })
		expect(config.layouts['year-per-page']).toMatchObject({ year: 2030, title: 'Hi' })
		expect(config.layouts['month-per-page'].year).toBe(2040)
	})

	it('update changes only the patched fields of the given layout', () => {
		const config = defaultAppConfig()
		const updated = configReducer(config, {
			type: 'update',
			layout: 'year-per-page',
			patch: { year: 2030, title: 'Hi' },
		})
		expect(updated.layouts['year-per-page']).toEqual({
			...config.layouts['year-per-page'],
			year: 2030,
			title: 'Hi',
		})
		expect(updated.layouts['month-per-page']).toBe(config.layouts['month-per-page'])
		expect(updated.layouts['day-per-page']).toBe(config.layouts['day-per-page'])
	})

	it('update returns a new object and leaves the old one untouched', () => {
		const config = defaultAppConfig()
		const before = structuredClone(config)
		const updated = configReducer(config, {
			type: 'update',
			layout: 'day-per-page',
			patch: { showWeekNumbers: false },
		})
		expect(updated).not.toBe(config)
		expect(config).toEqual(before)
	})

	it('replaceLayout swaps one layout’s options and keeps the active layout', () => {
		const config = defaultAppConfig()
		const next = { ...DEFAULTS['day-per-page'](), year: 1999 }
		const replaced = configReducer(config, {
			type: 'replaceLayout',
			layout: 'day-per-page',
			config: next,
		})
		expect(replaced.layouts['day-per-page']).toBe(next)
		expect(replaced.layouts['year-per-page']).toBe(config.layouts['year-per-page'])
		expect(replaced.layout).toBe('year-per-page')
	})

	it('importLayout swaps one layout’s options and shows that layout', () => {
		const next = { ...DEFAULTS['month-per-page'](), year: 1999 }
		const imported = configReducer(defaultAppConfig(), {
			type: 'importLayout',
			layout: 'month-per-page',
			config: next,
		})
		expect(imported.layout).toBe('month-per-page')
		expect(imported.layouts['month-per-page']).toBe(next)
	})
})
