// Writes the format fixtures of the release it runs in: copied into a worktree of that release's
// tag as `src/formatFixtures.gen.test.ts` by `scripts/format-fixtures/generate.sh`, which runs it
// there, so every file is written by that release's own code, never rebuilt from memory. For each
// layout, a project file with every option changed from its default, as far as that release
// accepts a change of it alone, and, for 3 to 5, the stored settings (`calendarium-config`) of all
// the layouts so changed. It finds the release's code by the modules it has (3.x kept it in
// `config/`, 4.x and 5.x in `layouts/` and `workspace/`, 6 in serialized projects), loose-typed
// since their types differ from one release to the next.
// oxlint-disable typescript/no-explicit-any -- the API of whichever release it runs in
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { isDeepStrictEqual } from 'node:util'
import { expect, test } from 'vitest'

type Options = Record<string, any>

/** How the release saves and opens a layout's options, and stores all of them. */
interface Release {
	version: string
	layouts: readonly string[]
	defaults: (layout: string) => Options
	/** `options` as the release saves them to a file. */
	fileText: (layout: string, options: Options) => string
	/** A file as the release opens it: its options, normalized, and the fields it ignored. */
	open: (text: string, layout: string) => { options: Options; ignored: string[] }
	/** All the layouts' options as the release stores them, `shown` showing; none from 6 on. */
	stored?: (shown: string, layouts: Record<string, Options>) => object
}

const modules = import.meta.glob<any>(
	[
		'./config/{configFile,parseConfig,version}.ts',
		'./config/layouts/index.ts',
		'./config/CalendarConfig.ts',
		'./layouts/index.ts',
		'./workspace/{projectFile,parseWorkspace,version}.ts',
	],
	{ eager: true },
)

/** The fixed id and name of a 6 file, which has both. */
const PROJECT_ID = '6f0e2c1a-3b4d-4e5f-8a6b-7c8d9e0f1a2b'

function release(): Release {
	const version = modules['./config/version.ts'] ?? modules['./workspace/version.ts']
	if (modules['./config/configFile.ts'] !== undefined) {
		// 3.x: one config per layout, saved and stored flat.
		const file = modules['./config/configFile.ts']
		const specs = modules['./config/layouts/index.ts']
		const { toStoredConfig } = modules['./config/parseConfig.ts']
		return {
			version: version.APP_VERSION,
			layouts: modules['./config/CalendarConfig.ts'].LAYOUT_IDS,
			defaults: (layout) => specs.defaultLayoutConfig(layout),
			fileText: (layout, options) => file.serializeLayoutConfig(layout, options),
			open: (text, layout) => {
				const opened = file.parseConfigFile(text, layout)
				return { options: opened.config, ignored: opened.ignored }
			},
			stored: (shown, layouts) => toStoredConfig({ layout: shown, layouts }),
		}
	}
	const layouts = modules['./layouts/index.ts']
	const file = modules['./workspace/projectFile.ts']
	if (modules['./workspace/parseWorkspace.ts'] !== undefined) {
		// 4.x and 5.x: a project is a layout and its options, saved and stored flat.
		const { toStoredWorkspace } = modules['./workspace/parseWorkspace.ts']
		return {
			version: version.APP_VERSION,
			layouts: layouts.LAYOUT_IDS,
			defaults: (layout) => layouts.defaultLayoutOptions(layout),
			fileText: (layout, options) => file.serializeProject({ layout, options }),
			open: (text, layout) => {
				const opened = file.parseProjectFile(text, layout)
				return { options: opened.options, ignored: opened.ignored }
			},
			stored: (shown, all) => toStoredWorkspace({ layout: shown, layouts: all }),
		}
	}
	// 6: a serialized project, its options in groups, with an id and a name.
	return {
		version: version.APP_VERSION,
		layouts: layouts.LAYOUT_IDS,
		defaults: (layout) => layouts.defaultLayoutOptions(layout),
		fileText: (layout, options) =>
			file.projectFile({ id: PROJECT_ID, name: `Fixture ${layout}`, layout, options }).text,
		open: (text) => {
			const opened = file.parseProjectFile(text, 'fixture.json')
			if (!opened.ok) throw new Error(`Not opened: ${opened.reason}`)
			return { options: opened.project.options, ignored: opened.ignored }
		},
	}
}

/** Every string listed in an array the release's domain modules export: the values of its choices. */
function choiceValues(): string[] {
	const domain = import.meta.glob<Record<string, unknown>>(
		['./{core,config,layouts}/**/*.ts', '!**/*.test.ts', '!**/ui/**'],
		{ eager: true },
	)
	const values = new Set<string>()
	for (const path of Object.keys(domain).toSorted()) {
		for (const value of Object.values(domain[path])) {
			if (!Array.isArray(value)) continue
			for (const item of value) if (typeof item === 'string') values.add(item)
		}
	}
	return [...values]
}

/** The events of the files, on one date and every year, when the release has events. */
const EVENTS = ['2031-03-14 Fixture day', '0000-12-25 Every year']

/**
 * The values to try for the field at `path`, its default being `value`, in order: a fixed year and
 * language, so the files don't depend on when and where they were made, the other boolean, nearby
 * numbers (first `step` away, the field's rank among the numbers, so that fields with the same
 * default, like the margins, differ and a mix-up of two shows), any text, or another of the
 * release's choices.
 */
function candidates(path: string[], value: unknown, choices: string[], step: number): unknown[] {
	const key = path.at(-1)
	if (key === 'year') return [2031]
	if (key === 'locale') return ['fr-FR', 'de-DE']
	if (key === 'events') return [EVENTS, EVENTS.join('\n')]
	if (typeof value === 'boolean') return [!value]
	if (typeof value === 'number') {
		return [step, -step, 1, -1, 2, -2, 5, -5, 0.5, 10, -10]
			.map((delta) => value + delta)
			.concat([value * 2, value / 2])
	}
	if (typeof value === 'string') {
		return [`Fixture ${path.join('.')}`, ...choices, 0, 1, 2, 3, 4, 5, 6].filter(
			(candidate) => candidate !== value,
		)
	}
	return []
}

/** The leaves of `options`, by path: every value that isn't a nested object. */
function leaves(options: Options, path: string[] = []): string[][] {
	return Object.entries(options).flatMap(([key, value]) =>
		value !== null && typeof value === 'object' && !Array.isArray(value)
			? leaves(value, [...path, key])
			: [[...path, key]],
	)
}

function at(options: Options, path: string[]): unknown {
	return path.reduce<any>((object, key) => object?.[key], options)
}

function withValue(options: Options, path: string[], value: unknown): Options {
	const copy = structuredClone(options)
	const parent = path.slice(0, -1).reduce<any>((object, key) => object[key], copy)
	parent[path.at(-1)!] = value
	return copy
}

/**
 * `layout`'s options with every field changed: for each, the first candidate the release opens
 * from a file as it is, alone among the defaults; then all of them together, as the release
 * normalizes them, which a rule tying fields together may bring back. Also the fields left at
 * their defaults.
 */
function changedOptions(app: Release, layout: string, choices: string[]) {
	const defaults = app.defaults(layout)
	let changed = defaults
	let step = 0
	for (const path of leaves(defaults)) {
		const value = at(defaults, path)
		if (typeof value === 'number') step += 1
		const accepted = candidates(path, value, choices, step).find((candidate) => {
			const opened = app.open(
				app.fileText(layout, withValue(defaults, path, candidate)),
				layout,
			)
			return (
				opened.ignored.length === 0 &&
				isDeepStrictEqual(at(opened.options, path), candidate)
			)
		})
		if (accepted !== undefined) changed = withValue(changed, path, accepted)
	}
	const opened = app.open(app.fileText(layout, changed), layout)
	expect(opened.ignored).toEqual([])
	const unchanged = leaves(defaults)
		.filter((path) => isDeepStrictEqual(at(opened.options, path), at(defaults, path)))
		.map((path) => path.join('.'))
	return { options: opened.options, unchanged }
}

test('writes the format fixtures', () => {
	const out = process.env.FIXTURES_OUT
	if (out === undefined) throw new Error('FIXTURES_OUT is not set')
	mkdirSync(out, { recursive: true })
	const app = release()
	const choices = choiceValues()
	const all: Record<string, Options> = {}
	for (const layout of app.layouts) {
		const { options, unchanged } = changedOptions(app, layout, choices)
		all[layout] = options
		writeFileSync(
			join(out, `file-v${app.version}-${layout}.json`),
			app.fileText(layout, options),
		)
		if (unchanged.length > 0) {
			process.stderr.write(
				`${app.version} ${layout} keeps its defaults: ${unchanged.join(', ')}\n`,
			)
		}
	}
	if (app.stored !== undefined) {
		// The third layout shows, not the first, which every release preselected.
		const record = app.stored(app.layouts[2], all)
		writeFileSync(join(out, `storage-v${app.version}.json`), JSON.stringify(record))
	}
})
