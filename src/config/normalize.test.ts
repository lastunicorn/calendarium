import { describe, expect, it } from 'vitest'
import { defaultLayoutConfig, LAYOUT_IDS, normalizeLayout } from '../layouts'
import { defaultAppConfig } from './AppConfig'
import { configReducer } from './configReducer'
import { parseConfig, toStoredConfig } from './parseConfig'

describe('normalizeLayout', () => {
	it('puts a reversed day schedule in order', () => {
		const config = { ...defaultLayoutConfig('day-per-page'), firstHour: 20, lastHour: 8 }
		expect(normalizeLayout('day-per-page', config)).toMatchObject({
			firstHour: 8,
			lastHour: 20,
		})
	})

	it('puts a reversed week schedule in order', () => {
		const config = { ...defaultLayoutConfig('week-per-page'), firstHour: 18, lastHour: 9 }
		expect(normalizeLayout('week-per-page', config)).toMatchObject({
			firstHour: 9,
			lastHour: 18,
		})
	})

	it('applies the page rules in every layout', () => {
		for (const layout of LAYOUT_IDS) {
			const config = defaultLayoutConfig(layout)
			expect(config.page.equalMargins).toBe(true)
			const differing = {
				...config.page,
				margins: { top: 5, right: 10, bottom: 15, left: 20 },
			}
			expect(normalizeLayout(layout, { ...config, page: differing }).page).toEqual({
				...differing,
				equalMargins: false,
			})
			const mirrored = { ...config.page, mirrorMargins: true }
			expect(normalizeLayout(layout, { ...config, page: mirrored }).page.equalMargins).toBe(
				false,
			)
		}
	})

	it('keeps the differing margins of settings saved before equal margins', () => {
		const stored = toStoredConfig(defaultAppConfig())
		const day = stored.layouts['day-per-page']
		const sides = { top: 5, right: 10, bottom: 15, left: 20 }
		const { equalMargins: _, ...page } = { ...day.page, margins: sides }
		const layouts = { ...stored.layouts, 'day-per-page': { ...day, page } }
		expect(parseConfig({ ...stored, layouts }).layouts['day-per-page'].page).toMatchObject({
			margins: sides,
			equalMargins: false,
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
