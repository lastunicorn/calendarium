import { describe, expect, it } from 'vitest'
import {
	defaultPreferences,
	parsePreferences,
	SIDEBAR_MIN_WIDTH,
	withSectionToggled,
} from './Preferences'

describe('preferences', () => {
	it('start with the narrowest sidebar and every section closed', () => {
		expect(defaultPreferences()).toEqual({ sidebarWidth: SIDEBAR_MIN_WIDTH, openSection: null })
	})

	it('parse valid stored values and leave out unknown fields', () => {
		expect(parsePreferences({ sidebarWidth: 480, openSection: 'Page', theme: 'dark' })).toEqual(
			{
				sidebarWidth: 480,
				openSection: 'Page',
			},
		)
	})

	it('fall back to the defaults for invalid values, one field at a time', () => {
		expect(parsePreferences({ sidebarWidth: 100, openSection: 'Page' })).toEqual({
			sidebarWidth: SIDEBAR_MIN_WIDTH,
			openSection: 'Page',
		})
		expect(parsePreferences({ sidebarWidth: 400.5, openSection: 3 })).toEqual(
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
