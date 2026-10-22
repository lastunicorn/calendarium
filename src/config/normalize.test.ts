import { describe, expect, it } from 'vitest'
import { defaultLayoutConfig, LAYOUT_IDS, normalizeLayout } from '../layouts'
import { defaultAppConfig } from './AppConfig'
import { configReducer } from './configReducer'
import { parseConfig, toStoredConfig } from './parseConfig'

// Each layout's own rules are tested in its `options.test.ts`; these check the page rules every
// layout shares, and that every config in state passes through its layout's rules.

const DIFFERING = { top: 5, right: 10, bottom: 15, left: 20 }

describe('normalizeLayout', () => {
	it('applies the page rules in every layout', () => {
		for (const layout of LAYOUT_IDS) {
			const config = defaultLayoutConfig(layout)
			expect(config.page.equalMargins).toBe(true)
			const differing = { ...config.page, margins: DIFFERING }
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
		const { equalMargins: _, ...page } = { ...day.page, margins: DIFFERING }
		const layouts = { ...stored.layouts, 'day-per-page': { ...day, page } }
		expect(parseConfig({ ...stored, layouts }).layouts['day-per-page'].page).toMatchObject({
			margins: DIFFERING,
			equalMargins: false,
		})
	})

	it('applies to every reducer change of a layout’s options', () => {
		const layout = 'month-per-page'
		const { page } = defaultLayoutConfig(layout)
		const updated = configReducer(defaultAppConfig(), {
			type: 'update',
			layout,
			patch: { page: { ...page, mirrorMargins: true } },
		})
		expect(updated.layouts[layout].page.equalMargins).toBe(false)

		const imported = configReducer(defaultAppConfig(), {
			type: 'importLayout',
			layout,
			config: { ...defaultLayoutConfig(layout), page: { ...page, margins: DIFFERING } },
		})
		expect(imported.layouts[layout].page.equalMargins).toBe(false)
	})
})
