import { describe, expect, it } from 'vitest'
import { defaultLayoutOptions, type LayoutId } from '../layouts'
import { LEGACY_FILE_FORMAT } from './legacy'
import type { Project } from './Project'
import { PROJECT_FORMAT, serializeProject } from './projectDocument'
import { parseProjectFile, projectFile } from './projectFile'
import { APP_VERSION, FORMAT_VERSION } from './version'

const ID = '3f0c9a52-7d1e-4b8a-9c61-2e5f4a8b7d10'

/** A weekly project named `name`, of `year`. */
function weekly(name: string, year = 2031): Project {
	const defaults = defaultLayoutOptions('weekly')
	return {
		id: ID,
		name,
		layout: 'weekly',
		options: { ...defaults, calendar: { ...defaults.calendar, year } },
	}
}

describe('projectFile', () => {
	it('pretty-prints the serialized project', () => {
		const project = weekly('Work')
		expect(projectFile(project).text).toBe(serializeProject(project, { pretty: true }))
	})

	it('names the file after the project', () => {
		expect(projectFile(weekly('Work 2027')).fileName).toBe('work-2027.json')
		expect(projectFile(weekly('  Plan:\tA/B  ')).fileName).toBe('plan-a-b.json')
		expect(projectFile(weekly('a\\b*c?d"e<f>g|h')).fileName).toBe('a-b-c-d-e-f-g-h.json')
		expect(projectFile(weekly('Ημερολόγιο 日記')).fileName).toBe('ημερολόγιο-日記.json')
	})

	it('names an unnamed project’s file after its layout and year', () => {
		for (const name of ['', '   ', '???']) {
			expect(projectFile(weekly(name, 2031)).fileName).toBe('calendar-weekly-2031.json')
		}
	})
})

describe('parseProjectFile', () => {
	it('opens a serialized project, keeping its id and name whatever the file’s name', () => {
		const project = weekly('Work')
		const text = projectFile(project).text
		expect(parseProjectFile(text, 'calendar-weekly-2031.json')).toEqual({
			ok: true,
			project,
			ignored: [],
			newer: false,
		})
	})

	it('is not a project for text that is not a JSON object, or another format', () => {
		const texts = [
			'not json',
			'[]',
			'null',
			'2030',
			'{"year": 2030}',
			JSON.stringify({ format: 'something-else', version: FORMAT_VERSION }),
		]
		for (const text of texts) {
			expect(parseProjectFile(text, 'other.json')).toEqual({
				ok: false,
				reason: 'notProject',
			})
		}
	})

	it('rejects the format with a version before 6, and a legacy file from 6 on', () => {
		const files = [
			{ format: PROJECT_FORMAT, version: 5, layout: 'weekly', options: {} },
			{ format: LEGACY_FILE_FORMAT, version: 6, layout: 'weekly' },
			{ format: LEGACY_FILE_FORMAT, version: 2, layout: 'week-per-page' },
			{ format: LEGACY_FILE_FORMAT, layout: 'week-per-page' },
		]
		for (const file of files) {
			expect(parseProjectFile(JSON.stringify(file), 'week.json')).toEqual({
				ok: false,
				reason: 'notProject',
			})
		}
	})

	it('rejects a layout this version doesn’t have, in either format', () => {
		const files = [
			{ format: PROJECT_FORMAT, version: FORMAT_VERSION, layout: 'quarterly', options: {} },
			{ format: LEGACY_FILE_FORMAT, version: 5, layout: 'quarter-per-page' },
			{ format: LEGACY_FILE_FORMAT, version: 5 },
		]
		for (const file of files) {
			expect(parseProjectFile(JSON.stringify(file), 'quarter.json')).toEqual({
				ok: false,
				reason: 'unknownLayout',
			})
		}
	})

	it('reports a file made by a later app version', () => {
		const [major, minor] = APP_VERSION.split('.').map(Number)
		const data = JSON.parse(projectFile(weekly('Work')).text)
		const later = JSON.stringify({ ...data, app: `${major}.${minor + 1}.0` })
		expect(parseProjectFile(later, 'work.json')).toMatchObject({ ok: true, newer: true })
	})
})

// Files of 3 to 5 of every layout, by its old id, with values other than the defaults, and where
// 6 keeps them. Each layout's steps are tested in its folder; these check a file goes through all
// of them, from its own version.
const LEGACY_FILES: { layout: LayoutId; version: number; file: object; options: object }[] = [
	...[3, 4, 5].map((version) => ({
		layout: 'yearly' as const,
		version,
		file: {
			layout: 'year-per-page',
			year: 2030,
			locale: 'de-DE',
			weekStart: 0,
			events: '0000-12-25 Weihnachten\n2030-01-01 Neujahr',
			title: 'Wir',
			subtitle: 'Zuhause',
			monthSize: 'large',
			weekdayFormat: 'short',
			showWeekNumbers: true,
			page: { paperSize: 'a3', orientation: 'landscape' },
		},
		options: {
			calendar: { year: 2030, locale: 'de-DE', weekStart: 0 },
			events: ['0000-12-25 Weihnachten', '2030-01-01 Neujahr'],
			header: { title: 'Wir', subtitle: 'Zuhause' },
			content: { monthSize: 'large', weekdayFormat: 'short', showWeekNumbers: true },
			page: { paperSize: 'a3', orientation: 'landscape' },
		},
	})),
	...[3, 4, 5].map((version) => ({
		layout: 'monthly' as const,
		version,
		file: {
			layout: 'month-per-page',
			year: 2031,
			title: 'Office',
			monthHeadingAlignment: 'left',
			adjacentMonths: { showPreviousMonth: false, size: 'large' },
			showGridLines: false,
			dayNumberFontSize: 18,
			dayNumberVerticalAlignment: 'bottom',
		},
		options: {
			calendar: { year: 2031 },
			header: { title: 'Office', alignment: 'left' },
			miniMonth: { showPreviousMonth: false, size: 'large' },
			content: {
				showGridLines: false,
				dayNumber: { fontSize: 18, verticalAlignment: 'bottom' },
			},
		},
	})),
	{
		layout: 'weekly',
		version: 3,
		file: {
			layout: 'week-per-page',
			year: 2030,
			highlightWeekends: 'off',
			showWeekNumbers: false,
			twoPagesPerWeek: true,
			firstHour: 6,
			showFooter: true,
		},
		options: {
			calendar: { year: 2030 },
			header: { showWeek: false },
			content: { highlightWeekendDays: false, twoPages: true, schedule: { firstHour: 6 } },
			footer: { show: true },
		},
	},
	{
		layout: 'weekly',
		version: 4,
		file: {
			layout: 'week-per-page',
			weekDayDirection: 'auto',
			headingAlignment: 'right',
			showHeaderWeek: false,
			page: { orientation: 'portrait' },
		},
		options: {
			header: { alignment: 'right', showWeek: false },
			content: { dayDirection: 'horizontal' },
			page: { orientation: 'portrait' },
		},
	},
	{
		layout: 'weekly',
		version: 5,
		file: {
			layout: 'week-per-page',
			miniMonth: { show: false, size: 'large' },
			showNextMonth: true,
			weekPageLines: 'none',
			lastHour: 22,
			footerHeight: 30,
		},
		options: {
			miniMonth: { showCurrentMonth: false, size: 'large', showNextMonth: true },
			content: { fill: 'none', schedule: { lastHour: 22 } },
			footer: { height: 30 },
		},
	},
	{
		layout: 'daily',
		version: 3,
		file: {
			layout: 'day-per-page',
			showMiniMonth: false,
			weekdayFormat: 'short',
			highlightWeekends: 'off',
			dayPageTitle: 'weekday',
		},
		options: {
			header: { heading: 'weekday', highlightWeekendDays: false },
			miniMonth: { show: false, weekdayFormat: 'short' },
		},
	},
	{
		layout: 'daily',
		version: 4,
		file: {
			layout: 'day-per-page',
			twoPagesPerDay: true,
			dayPageLines: 'ruled',
			ruledLineSpacing: 10,
			squareGridAlignment: 'left',
			showHeaderDayOfYear: false,
		},
		options: {
			header: { showDayOfYear: false },
			content: { twoPages: true, fill: 'ruled', ruledLineSpacing: 10, fillAlignment: 'left' },
		},
	},
	{
		layout: 'daily',
		version: 5,
		file: {
			layout: 'day-per-page',
			miniMonth: { show: false },
			dayPageLines: 'squares',
			squareSize: 4,
			hourFormat: '24h',
			firstHour: 5,
			showFooter: true,
		},
		options: {
			miniMonth: { show: false },
			content: {
				fill: 'squares',
				squareSize: 4,
				schedule: { hourFormat: '24h', firstHour: 5 },
			},
			footer: { show: true },
		},
	},
]

describe('parseProjectFile of a legacy file', () => {
	it.each(LEGACY_FILES)(
		'opens a $version file of the $layout layout with its values in the groups',
		({ layout, version, file, options }) => {
			const text = JSON.stringify({
				format: LEGACY_FILE_FORMAT,
				version,
				app: `${version}.0.0`,
				...file,
			})
			const opened = parseProjectFile(text, 'Our calendar.json')
			expect(opened).toMatchObject({
				ok: true,
				project: { id: null, name: 'Our calendar', layout },
				ignored: [],
				newer: false,
			})
			expect(opened.ok && opened.project.options).toMatchObject(options)
		},
	)

	it('opens a legacy file holding no options with its layout’s defaults', () => {
		const text = JSON.stringify({
			format: LEGACY_FILE_FORMAT,
			version: 5,
			layout: 'month-per-page',
		})
		const opened = parseProjectFile(text, 'month.json')
		expect(opened.ok && opened.project.options).toEqual(defaultLayoutOptions('monthly'))
	})

	it('takes the project’s name from the file’s name, unless the app generated it', () => {
		const text = JSON.stringify({ format: LEGACY_FILE_FORMAT, version: 5, layout: 'daily' })
		const named = (fileName: string) => {
			const opened = parseProjectFile(text, fileName)
			return opened.ok && opened.project.name
		}
		expect(named('Work 2027.json')).toBe('Work 2027')
		expect(named('Plan.JSON')).toBe('Plan')
		expect(named('notes')).toBe('notes')
		expect(named('calendar-2030.json')).toBe('calendar-2030')
		for (const generated of [
			'calendar-day-per-page-2026.json',
			'calendar-daily-2026.json',
			'calendar-week-per-page-2031 (1).json',
		]) {
			expect(named(generated), generated).toBe('')
		}
	})

	it('lists the fields that were present but invalid', () => {
		const text = JSON.stringify({
			format: LEGACY_FILE_FORMAT,
			version: 5,
			layout: 'day-per-page',
			firstHour: 25,
			page: { margins: { top: 99 } },
		})
		expect(parseProjectFile(text, 'day.json')).toMatchObject({
			ok: true,
			ignored: ['page.margins.top', 'content.schedule.firstHour'],
		})
	})
})
