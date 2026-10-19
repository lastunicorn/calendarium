import { describe, expect, it } from 'vitest'
import { configReducer } from '../configReducer'
import { parseConfig, toStoredConfig } from '../parseConfig'
import { defaultAppConfig, defaultLayoutConfig, normalizeLayout } from './index'

describe('normalizeLayout', () => {
	it('puts a reversed day schedule in order', () => {
		const config = { ...defaultLayoutConfig('day-per-page'), firstHour: 20, lastHour: 8 }
		expect(normalizeLayout('day-per-page', config)).toMatchObject({
			firstHour: 8,
			lastHour: 20,
		})
	})

	it('returns a config that already follows the rules as is', () => {
		const day = { ...defaultLayoutConfig('day-per-page'), firstHour: 9, lastHour: 9 }
		expect(normalizeLayout('day-per-page', day)).toBe(day)
		const year = defaultLayoutConfig('year-per-page')
		expect(normalizeLayout('year-per-page', year)).toBe(year)
	})

	it('applies to parsed data', () => {
		const stored = toStoredConfig(defaultAppConfig())
		stored.layouts['day-per-page'] = {
			...stored.layouts['day-per-page'],
			firstHour: 22,
			lastHour: 6,
		}
		expect(parseConfig(stored).layouts['day-per-page']).toMatchObject({
			firstHour: 6,
			lastHour: 22,
		})
	})

	it('applies to every reducer change of a layout’s options', () => {
		const config = configReducer(defaultAppConfig(), {
			type: 'update',
			layout: 'day-per-page',
			patch: { firstHour: 23 },
		})
		expect(config.layouts['day-per-page']).toMatchObject({ firstHour: 21, lastHour: 23 })

		const imported = configReducer(defaultAppConfig(), {
			type: 'importLayout',
			layout: 'day-per-page',
			config: { ...defaultLayoutConfig('day-per-page'), firstHour: 18, lastHour: 10 },
		})
		expect(imported.layouts['day-per-page']).toMatchObject({ firstHour: 10, lastHour: 18 })
	})
})
