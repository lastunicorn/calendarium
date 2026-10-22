import { describe, expect, it } from 'vitest'
import { defaultLayoutOptions, LAYOUT_IDS } from '../layouts'
import { defaultWorkspace } from './Workspace'
import { exportLayoutFile, parseLayoutFile, serializeLayoutOptions } from './layoutFile'
import { FILE_FORMAT } from './migrations'
import { APP_VERSION, FORMAT_VERSION } from './version'

/** A file's text: this app's format and the current version, plus `fields`. */
function fileText(fields: Record<string, unknown>): string {
	return JSON.stringify({ format: FILE_FORMAT, version: FORMAT_VERSION, ...fields })
}

describe('layout files', () => {
	it('round-trips one layout through serializeLayoutOptions', () => {
		const defaults = defaultLayoutOptions('day-per-page')
		const options = {
			...defaults,
			year: 2031,
			firstHour: 5,
			page: { ...defaults.page, paperSize: 'a3' as const },
		}
		const text = serializeLayoutOptions('day-per-page', options)
		expect(parseLayoutFile(text, 'year-per-page')).toEqual({
			layout: 'day-per-page',
			options,
			ignored: [],
			newer: false,
		})
	})

	it('exports the active layout, named after it and its year', () => {
		const workspace = { ...defaultWorkspace(), layout: 'week-per-page' as const }
		workspace.layouts['week-per-page'] = { ...workspace.layouts['week-per-page'], year: 2031 }
		const file = exportLayoutFile(workspace)
		expect(file.fileName).toBe('calendar-week-per-page-2031.json')
		expect(file.text).toBe(
			serializeLayoutOptions('week-per-page', workspace.layouts['week-per-page']),
		)
	})

	it('writes the format, the versions, the layout and only that layout’s options', () => {
		const options = defaultLayoutOptions('month-per-page')
		const data = JSON.parse(serializeLayoutOptions('month-per-page', options))
		expect(data).toEqual({
			format: FILE_FORMAT,
			version: FORMAT_VERSION,
			app: APP_VERSION,
			layout: 'month-per-page',
			...options,
		})
		expect(data).not.toHaveProperty('subtitle')
		expect(data).not.toHaveProperty('layouts')
	})

	it('imports into the current layout when the file names none or an unknown one', () => {
		expect(parseLayoutFile(fileText({ year: 2031 }), 'month-per-page')?.layout).toBe(
			'month-per-page',
		)
		expect(parseLayoutFile(fileText({ layout: 'week' }), 'day-per-page')?.layout).toBe(
			'day-per-page',
		)
	})

	it('keeps only the fields of the layout it imports into', () => {
		const imported = parseLayoutFile(
			fileText({ layout: 'month-per-page', subtitle: 'Office' }),
			'year-per-page',
		)
		expect(imported?.options).not.toHaveProperty('subtitle')
	})

	it('rejects files that are not a JSON object', () => {
		for (const text of ['not json', '[]', 'null', '2030']) {
			expect(parseLayoutFile(text, 'year-per-page')).toBeNull()
		}
	})

	it('rejects JSON objects that are not a layout file', () => {
		const files = [
			{ name: 'package', version: 3 },
			{ version: FORMAT_VERSION, year: 2030 },
			{ format: 'something-else', version: FORMAT_VERSION, year: 2030 },
		]
		for (const file of files) {
			expect(parseLayoutFile(JSON.stringify(file), 'year-per-page')).toBeNull()
		}
	})

	it('rejects files without a version this app knows', () => {
		for (const version of [undefined, 1, 2, '3']) {
			const file = JSON.stringify({ format: FILE_FORMAT, version, year: 2030 })
			expect(parseLayoutFile(file, 'year-per-page')).toBeNull()
		}
	})

	it('accepts a file holding no options', () => {
		const file = JSON.stringify({ format: FILE_FORMAT, version: FORMAT_VERSION })
		expect(parseLayoutFile(file, 'month-per-page')?.options).toEqual(
			defaultLayoutOptions('month-per-page'),
		)
	})

	it('reports a file made by a later format version and keeps what it can read', () => {
		const file = JSON.stringify({
			format: FILE_FORMAT,
			version: FORMAT_VERSION + 1,
			layout: 'day-per-page',
			year: 2031,
			futureOption: 'x',
		})
		const imported = parseLayoutFile(file, 'year-per-page')
		expect(imported?.newer).toBe(true)
		expect(imported?.options.year).toBe(2031)
		expect(imported?.options).not.toHaveProperty('futureOption')
	})

	it('reports a file made by a later app version of the same format version', () => {
		const file = (app: string) =>
			JSON.stringify({ format: FILE_FORMAT, version: FORMAT_VERSION, app, year: 2031 })
		expect(parseLayoutFile(file(`${FORMAT_VERSION}.999.0`), 'year-per-page')?.newer).toBe(true)
		expect(parseLayoutFile(file(APP_VERSION), 'year-per-page')?.newer).toBe(false)
		expect(parseLayoutFile(file('0.1.0'), 'year-per-page')?.newer).toBe(false)
	})

	it('falls back to the layout’s defaults for invalid fields', () => {
		for (const layout of LAYOUT_IDS) {
			const file = JSON.stringify({
				format: FILE_FORMAT,
				version: FORMAT_VERSION,
				year: 2030,
				page: { orientation: 'up' },
			})
			expect(parseLayoutFile(file, layout)).toEqual({
				layout,
				options: { ...defaultLayoutOptions(layout), year: 2030 },
				ignored: ['page.orientation'],
				newer: false,
			})
		}
	})

	it('lists the fields that were present but invalid', () => {
		const file = JSON.stringify({
			format: FILE_FORMAT,
			version: FORMAT_VERSION,
			layout: 'day-per-page',
			year: 2030,
			firstHour: 25,
			hourFormat: 'sundial',
			title: 'Not a day-per-page field',
			page: { paperSize: 'a4', margins: { top: 99, left: 5, right: 'wide' } },
		})
		expect(parseLayoutFile(file, 'year-per-page')?.ignored).toEqual([
			'page.margins.top',
			'page.margins.right',
			'hourFormat',
			'firstHour',
		])
		const badPage = JSON.stringify({
			format: FILE_FORMAT,
			version: FORMAT_VERSION,
			page: 'big',
		})
		expect(parseLayoutFile(badPage, 'year-per-page')?.ignored).toEqual(['page'])
	})
})
