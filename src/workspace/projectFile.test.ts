import { describe, expect, it } from 'vitest'
import { defaultLayoutOptions, LAYOUT_IDS } from '../layouts'
import { activeProject, defaultWorkspace } from './Workspace'
import { parseProjectFile, projectFile, serializeProject } from './projectFile'
import { FILE_FORMAT } from './migrations'
import { APP_VERSION, FORMAT_VERSION } from './version'

/** A file's text: this app's format and the current version, plus `fields`. */
function fileText(fields: Record<string, unknown>): string {
	return JSON.stringify({ format: FILE_FORMAT, version: FORMAT_VERSION, ...fields })
}

describe('project files', () => {
	it('round-trips a project through serializeProject', () => {
		const defaults = defaultLayoutOptions('daily')
		const options = {
			...defaults,
			content: {
				...defaults.content,
				schedule: { ...defaults.content.schedule, firstHour: 5 },
			},
			page: { ...defaults.page, paperSize: 'a3' as const },
		}
		const text = serializeProject({ layout: 'daily', options })
		expect(parseProjectFile(text, 'yearly')).toEqual({
			layout: 'daily',
			options,
			ignored: [],
			newer: false,
		})
	})

	it('saves the active project, named after its layout and year', () => {
		const workspace = { ...defaultWorkspace(), layout: 'weekly' as const }
		workspace.layouts.weekly.calendar = { ...workspace.layouts.weekly.calendar, year: 2031 }
		const file = projectFile(activeProject(workspace))
		expect(file.fileName).toBe('calendar-weekly-2031.json')
		expect(file.text).toBe(
			serializeProject({
				layout: 'weekly',
				options: workspace.layouts['weekly'],
			}),
		)
	})

	it('writes the format, the versions, the layout and only that layout’s options', () => {
		const options = defaultLayoutOptions('monthly')
		const data = JSON.parse(serializeProject({ layout: 'monthly', options }))
		expect(data).toEqual({
			format: FILE_FORMAT,
			version: FORMAT_VERSION,
			app: APP_VERSION,
			layout: 'monthly',
			...options,
		})
		expect(data).not.toHaveProperty('subtitle')
		expect(data).not.toHaveProperty('layouts')
	})

	it('opens a file from before 6 into the layout its old id names', () => {
		const file = JSON.stringify({
			format: FILE_FORMAT,
			version: 5,
			layout: 'day-per-page',
			year: 2031,
			dayPageLines: 'ruled',
		})
		const opened = parseProjectFile(file, 'yearly')
		expect(opened?.layout).toBe('daily')
		expect(opened?.options).toMatchObject({
			calendar: { year: 2031 },
			content: { fill: 'ruled' },
		})
		expect(opened?.ignored).toEqual([])
	})

	it('opens into the current layout when the file names none or an unknown one', () => {
		expect(parseProjectFile(fileText({ year: 2031 }), 'monthly')?.layout).toBe('monthly')
		expect(parseProjectFile(fileText({ layout: 'week' }), 'daily')?.layout).toBe('daily')
	})

	it('keeps only the fields of the layout it opens into', () => {
		const opened = parseProjectFile(
			fileText({ layout: 'monthly', subtitle: 'Office' }),
			'yearly',
		)
		expect(opened?.options).not.toHaveProperty('subtitle')
	})

	it('rejects files that are not a JSON object', () => {
		for (const text of ['not json', '[]', 'null', '2030']) {
			expect(parseProjectFile(text, 'yearly')).toBeNull()
		}
	})

	it('rejects JSON objects that are not a project file', () => {
		const files = [
			{ name: 'package', version: 3 },
			{ version: FORMAT_VERSION, year: 2030 },
			{ format: 'something-else', version: FORMAT_VERSION, year: 2030 },
		]
		for (const file of files) {
			expect(parseProjectFile(JSON.stringify(file), 'yearly')).toBeNull()
		}
	})

	it('rejects files without a version this app knows', () => {
		for (const version of [undefined, 1, 2, '3']) {
			const file = JSON.stringify({ format: FILE_FORMAT, version, year: 2030 })
			expect(parseProjectFile(file, 'yearly')).toBeNull()
		}
	})

	it('accepts a file holding no options', () => {
		const file = JSON.stringify({ format: FILE_FORMAT, version: FORMAT_VERSION })
		expect(parseProjectFile(file, 'monthly')?.options).toEqual(defaultLayoutOptions('monthly'))
	})

	it('reports a file made by a later format version and keeps what it can read', () => {
		const file = JSON.stringify({
			format: FILE_FORMAT,
			version: FORMAT_VERSION + 1,
			layout: 'daily',
			calendar: { year: 2031 },
			futureOption: 'x',
		})
		const opened = parseProjectFile(file, 'yearly')
		expect(opened?.newer).toBe(true)
		expect(opened?.options.calendar.year).toBe(2031)
		expect(opened?.options).not.toHaveProperty('futureOption')
	})

	it('reports a file made by a later app version of the same format version', () => {
		const file = (app: string) =>
			JSON.stringify({ format: FILE_FORMAT, version: FORMAT_VERSION, app, year: 2031 })
		expect(parseProjectFile(file(`${FORMAT_VERSION}.999.0`), 'yearly')?.newer).toBe(true)
		expect(parseProjectFile(file(APP_VERSION), 'yearly')?.newer).toBe(false)
		expect(parseProjectFile(file('0.1.0'), 'yearly')?.newer).toBe(false)
	})

	it('falls back to the layout’s defaults for invalid fields', () => {
		for (const layout of LAYOUT_IDS) {
			const file = JSON.stringify({
				format: FILE_FORMAT,
				version: FORMAT_VERSION,
				calendar: { year: 2030 },
				page: { orientation: 'up' },
			})
			expect(parseProjectFile(file, layout)).toEqual({
				layout,
				options: {
					...defaultLayoutOptions(layout),
					calendar: { ...defaultLayoutOptions(layout).calendar, year: 2030 },
				},
				ignored: ['page.orientation'],
				newer: false,
			})
		}
	})

	it('lists the fields that were present but invalid', () => {
		const file = JSON.stringify({
			format: FILE_FORMAT,
			version: FORMAT_VERSION,
			layout: 'daily',
			year: 2030,
			content: { schedule: { firstHour: 25, hourFormat: 'sundial' } },
			title: 'Not a daily field',
			page: { paperSize: 'a4', margins: { top: 99, left: 5, right: 'wide' } },
		})
		expect(parseProjectFile(file, 'yearly')?.ignored).toEqual([
			'page.margins.top',
			'page.margins.right',
			'content.schedule.hourFormat',
			'content.schedule.firstHour',
		])
		const badPage = JSON.stringify({
			format: FILE_FORMAT,
			version: FORMAT_VERSION,
			page: 'big',
		})
		expect(parseProjectFile(badPage, 'yearly')?.ignored).toEqual(['page'])
	})
})
