import { describe, expect, it } from 'vitest'
import { applyPatch } from '../core/data'
import { defaultLayoutOptions, LAYOUT_IDS } from '../layouts'
import type { Project } from './Project'
import { parseProjectDocument, PROJECT_FORMAT, serializeProject } from './projectDocument'
import { APP_VERSION, FORMAT_VERSION } from './version'

const ID = '3f0c9a52-7d1e-4b8a-9c61-2e5f4a8b7d10'

/** A serialized project of the current version, with `fields` beside or instead of its tags. */
function document(fields: Record<string, unknown>) {
	return {
		format: PROJECT_FORMAT,
		version: FORMAT_VERSION,
		app: APP_VERSION,
		id: ID,
		name: 'Ours',
		layout: 'daily',
		options: {},
		...fields,
	}
}

/** Each layout's project with options other than its defaults, in every group it has. */
const CHANGED: Project[] = [
	{
		id: ID,
		name: 'Wall 2030',
		layout: 'yearly',
		options: applyPatch(defaultLayoutOptions('yearly'), {
			calendar: { year: 2030, locale: 'de-DE', weekStart: 0 },
			events: ['0000-12-25 Weihnachten', 'not an event'],
			header: { title: 'Wir', subtitle: 'Zuhause', fontSize: 40 },
			content: { monthSize: 'large', highlightWeekends: 'columns' },
			page: { paperSize: 'a3', orientation: 'portrait' },
		}),
	},
	{
		id: ID,
		name: '',
		layout: 'monthly',
		options: applyPatch(defaultLayoutOptions('monthly'), {
			header: { title: 'Office', alignment: 'left' },
			miniMonth: { showPreviousMonth: false, size: 'large' },
			content: { showGridLines: false, dayNumber: { verticalAlignment: 'bottom' } },
		}),
	},
	{
		id: ID,
		name: '  Work  ',
		layout: 'weekly',
		options: applyPatch(defaultLayoutOptions('weekly'), {
			header: { alignment: 'right', showWeek: false },
			miniMonth: { showNextMonth: true, showEvents: false },
			content: { twoPages: true, fill: 'none', schedule: { firstHour: 6, lastHour: 22 } },
			footer: { show: true, height: 30 },
			page: { mirrorMargins: true, equalMargins: false },
		}),
	},
	{
		id: ID,
		name: '日記',
		layout: 'daily',
		options: applyPatch(defaultLayoutOptions('daily'), {
			header: { heading: 'weekday', showDayOfYear: false },
			miniMonth: { show: false },
			content: { fill: 'genkoYoshi', genkoYoshi: { direction: 'horizontal', guides: true } },
			footer: { show: true },
			page: { booklet: true },
		}),
	},
]

describe('serializeProject', () => {
	it('writes the tags, then the project, its options in sidebar order', () => {
		const project = {
			id: ID,
			name: 'Ours',
			layout: 'weekly',
			options: defaultLayoutOptions('weekly'),
		} as const
		const data = JSON.parse(serializeProject(project, { pretty: false }))
		expect(data).toEqual({
			format: PROJECT_FORMAT,
			version: FORMAT_VERSION,
			app: APP_VERSION,
			...project,
		})
		expect(Object.keys(data)).toEqual([
			'format',
			'version',
			'app',
			'id',
			'name',
			'layout',
			'options',
		])
		expect(Object.keys(data.options)).toEqual([
			'calendar',
			'events',
			'header',
			'miniMonth',
			'content',
			'footer',
			'page',
		])
	})

	it('pretty-prints with tabs for a file, compact for storage, the same JSON', () => {
		const project = CHANGED[0]
		const pretty = serializeProject(project, { pretty: true })
		const compact = serializeProject(project, { pretty: false })
		expect(pretty).toBe(JSON.stringify(JSON.parse(compact), null, '\t') + '\n')
		expect(compact).not.toContain('\n')
	})
})

describe('parseProjectDocument', () => {
	it('round-trips each layout’s defaults', () => {
		for (const layout of LAYOUT_IDS) {
			const project = {
				id: ID,
				name: '',
				layout,
				options: defaultLayoutOptions(layout),
			} as Project
			for (const pretty of [true, false]) {
				const text = serializeProject(project, { pretty })
				expect(parseProjectDocument(JSON.parse(text))).toEqual({
					ok: true,
					project,
					ignored: [],
					newer: false,
				})
			}
		}
	})

	it('round-trips projects with other options, keeping the name as typed', () => {
		for (const project of CHANGED) {
			const text = serializeProject(project, { pretty: true })
			expect(parseProjectDocument(JSON.parse(text))).toEqual({
				ok: true,
				project,
				ignored: [],
				newer: false,
			})
		}
	})

	it('is not a project without the format, or with the format and a version before 6', () => {
		const rejected = [
			null,
			'text',
			[],
			{ layout: 'daily', options: {} },
			document({ format: 'printable-calendar/layout' }),
			document({ format: 'something-else' }),
			document({ format: undefined }),
			document({ version: 5 }),
			document({ version: 3 }),
			document({ version: undefined }),
			document({ version: '6' }),
		]
		for (const data of rejected) {
			expect(parseProjectDocument(data)).toEqual({ ok: false, reason: 'notProject' })
		}
	})

	it('rejects a layout this version doesn’t have, or none, with its own reason', () => {
		for (const layout of ['quarterly', 'week-per-page', undefined, 42]) {
			expect(parseProjectDocument(document({ layout }))).toEqual({
				ok: false,
				reason: 'unknownLayout',
			})
		}
	})

	it('reads a missing or invalid id as none', () => {
		for (const id of [undefined, null, '', 'project-1', ID.toUpperCase(), 42]) {
			const parsed = parseProjectDocument(document({ id }))
			expect(parsed.ok && parsed.project.id, String(id)).toBeNull()
		}
	})

	it('reads a name that is not a string as none', () => {
		for (const name of [undefined, null, 42, ['Ours'], { text: 'Ours' }]) {
			const parsed = parseProjectDocument(document({ name }))
			expect(parsed.ok && parsed.project.name).toBe('')
		}
	})

	it('falls back to the defaults for missing options, and lists the invalid fields by path', () => {
		expect(parseProjectDocument(document({ options: undefined }))).toEqual({
			ok: true,
			project: {
				id: ID,
				name: 'Ours',
				layout: 'daily',
				options: defaultLayoutOptions('daily'),
			},
			ignored: [],
			newer: false,
		})
		const options = {
			calendar: { year: 2030 },
			header: { title: 'Not a daily field' },
			content: { schedule: { firstHour: 25, hourFormat: 'sundial' } },
			page: { paperSize: 'a4', margins: { top: 99, left: 5, right: 'wide' } },
		}
		const parsed = parseProjectDocument(document({ options }))
		expect(parsed.ok && parsed.project.options.calendar.year).toBe(2030)
		expect(parsed.ok && parsed.project.options.page.margins.left).toBe(5)
		expect(parsed.ok && parsed.ignored).toEqual([
			'page.margins.top',
			'page.margins.right',
			'content.schedule.hourFormat',
			'content.schedule.firstHour',
		])
		expect(parsed.ok && parsed.project.options).not.toHaveProperty('header.title')
	})

	it('lists options that are not an object whole', () => {
		const parsed = parseProjectDocument(document({ options: 'big' }))
		expect(parsed).toMatchObject({ ok: true, ignored: ['options'] })
		expect(parsed.ok && parsed.project.options).toEqual(defaultLayoutOptions('daily'))
	})

	// Derived from `APP_VERSION`, so the test holds whatever version `package.json` is at.
	const [major, minor] = APP_VERSION.split('.').map(Number)

	it('reports a project from a later app version of the same format version', () => {
		const later = parseProjectDocument(document({ app: `${major}.${minor + 1}.0` }))
		expect(later).toMatchObject({ ok: true, newer: true })
		expect(parseProjectDocument(document({}))).toMatchObject({ ok: true, newer: false })
		expect(parseProjectDocument(document({ app: '0.1.0' }))).toMatchObject({ newer: false })
	})

	it('reads a project from a later format version as far as it matches, and reports it', () => {
		const parsed = parseProjectDocument(
			document({
				version: FORMAT_VERSION + 1,
				options: { calendar: { year: 2031 }, futureGroup: { x: 1 } },
			}),
		)
		expect(parsed).toMatchObject({ ok: true, newer: true, ignored: [] })
		expect(parsed.ok && parsed.project.options.calendar.year).toBe(2031)
		expect(parsed.ok && parsed.project.options).not.toHaveProperty('futureGroup')
	})
})
