import { describe, expect, it } from 'vitest'

import { defaultLayoutOptions, LAYOUT_IDS } from '../layouts'
import {
	defaultPreferences,
	nextTheme,
	parsePreferences,
	SECTION_IDS,
	SIDEBAR_MIN_WIDTH,
	withSectionToggled,
} from './Preferences'

describe('preferences', () => {
	it('start with the narrowest sidebar, every section closed and the pages at their printed size', () => {
		expect(defaultPreferences()).toEqual({
			sidebarWidth: SIDEBAR_MIN_WIDTH,
			openSection: null,
			previewZoom: 100,
			theme: 'system',
		})
	})

	it('parse valid stored values and leave out unknown fields', () => {
		expect(
			parsePreferences({
				sidebarWidth: 480,
				openSection: 'page',
				previewZoom: 'fit-page',
				theme: 'dark',
				language: 'fr',
			}),
		).toEqual({
			sidebarWidth: 480,
			openSection: 'page',
			previewZoom: 'fit-page',
			theme: 'dark',
		})
	})

	it('fall back to the defaults for invalid values, one field at a time', () => {
		expect(
			parsePreferences({ sidebarWidth: 100, openSection: 'page', previewZoom: 50 }),
		).toEqual({
			sidebarWidth: SIDEBAR_MIN_WIDTH,
			openSection: 'page',
			previewZoom: 50,
			theme: 'system',
		})
		expect(
			parsePreferences({
				sidebarWidth: 400.5,
				openSection: 3,
				previewZoom: 60.5,
				theme: 'sepia',
			}),
		).toEqual(defaultPreferences())
		expect(parsePreferences('wide')).toEqual(defaultPreferences())
	})

	it('know a section only by one of its ids', () => {
		expect(parsePreferences({ openSection: 'miniMonth' }).openSection).toBe('miniMonth')
		expect(parsePreferences({ openSection: 'Mini calendar' }).openSection).toBeNull()
		expect(parsePreferences({ openSection: 'toString' }).openSection).toBeNull()
	})

	it('name a section after each option group of every layout', () => {
		const groups = new Set(LAYOUT_IDS.flatMap((id) => Object.keys(defaultLayoutOptions(id))))
		expect(new Set(SECTION_IDS)).toEqual(new Set(['project', ...groups]))
	})

	it('step through the themes, back to the system after dark', () => {
		expect(nextTheme('system')).toBe('light')
		expect(nextTheme('light')).toBe('dark')
		expect(nextTheme('dark')).toBe('system')
	})

	it('open one section at a time, closing the open one when toggled again', () => {
		const calendar = withSectionToggled(defaultPreferences(), 'calendar')
		expect(calendar.openSection).toBe('calendar')
		expect(withSectionToggled(calendar, 'page').openSection).toBe('page')
		expect(withSectionToggled(calendar, 'calendar').openSection).toBeNull()
	})
})
