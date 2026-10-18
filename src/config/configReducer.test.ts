import { describe, expect, it } from 'vitest'
import { defaultConfig } from './CalendarConfig'
import { configReducer } from './configReducer'

describe('configReducer', () => {
	it('update changes only the patched fields', () => {
		const config = defaultConfig()
		const updated = configReducer(config, {
			type: 'update',
			patch: { year: 2030, title: 'Hi' },
		})
		expect(updated).toEqual({ ...config, year: 2030, title: 'Hi' })
	})

	it('update returns a new object and leaves the old one untouched', () => {
		const config = defaultConfig()
		const before = structuredClone(config)
		const updated = configReducer(config, { type: 'update', patch: { showWeekNumbers: true } })
		expect(updated).not.toBe(config)
		expect(config).toEqual(before)
	})

	it('replace returns the given config', () => {
		const next = { ...defaultConfig(), year: 1999 }
		expect(configReducer(defaultConfig(), { type: 'replace', config: next })).toBe(next)
	})
})
