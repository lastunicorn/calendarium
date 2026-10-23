import { describe, expect, it } from 'vitest'
import {
	defaultPreferences,
	parsePreferences,
	SIDEBAR_MIN_WIDTH,
	withSectionToggled,
} from './Preferences'

describe('preferences', () => {
	it('start with the narrowest sidebar, every section closed and the pages at their printed size', () => {
		expect(defaultPreferences()).toEqual({
			sidebarWidth: SIDEBAR_MIN_WIDTH,
			openSection: null,
			previewZoom: 100,
		})
	})

	it('parse valid stored values and leave out unknown fields', () => {
		expect(
			parsePreferences({
				sidebarWidth: 480,
				openSection: 'Page',
				previewZoom: 'fit-page',
				theme: 'dark',
			}),
		).toEqual({ sidebarWidth: 480, openSection: 'Page', previewZoom: 'fit-page' })
	})

	it('fall back to the defaults for invalid values, one field at a time', () => {
		expect(
			parsePreferences({ sidebarWidth: 100, openSection: 'Page', previewZoom: 50 }),
		).toEqual({
			sidebarWidth: SIDEBAR_MIN_WIDTH,
			openSection: 'Page',
			previewZoom: 50,
		})
		expect(parsePreferences({ sidebarWidth: 400.5, openSection: 3, previewZoom: 60 })).toEqual(
			defaultPreferences(),
		)
		expect(parsePreferences('wide')).toEqual(defaultPreferences())
	})

	it('open one section at a time, closing the open one when toggled again', () => {
		const calendar = withSectionToggled(defaultPreferences(), 'Calendar')
		expect(calendar.openSection).toBe('Calendar')
		expect(withSectionToggled(calendar, 'Page').openSection).toBe('Page')
		expect(withSectionToggled(calendar, 'Calendar').openSection).toBeNull()
	})
})
