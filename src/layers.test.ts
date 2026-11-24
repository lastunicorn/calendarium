import { describe, expect, it } from 'vitest'

import { LAYOUT_IDS } from './layouts'

// The folders, from the bottom up. Each may import only itself and the folders below it:
// `core/` (generic: calendar, languages, paper) ← `ports/` (what the app needs from outside it) ←
// `layouts/` (each layout's options, rules and pages) ← `workspace/` (the saved settings) ←
// `preferences/` (the viewer's own) ← `ui/`. Only `ui/` may use React. A layout's UI, in
// `layouts/<layout-id>/ui/`, is in `ui/`. Above `ports/`, only `ui/` and the files above the layers
// (`main.tsx`) may import a port's adapters; the others import its types only.
const LAYERS = ['core', 'ports', 'layouts', 'workspace', 'preferences', 'ui'] as const

// Each layout is one unit, like a plugin of the host (everything outside the layouts' folders):
// its files import only their own layout's files and the host's, and the host knows a layout only
// through its entry points, imported by the two registries alone.

/** The host files that list the layouts, each importing one kind of entry point. */
const REGISTRIES = ['layouts/index.ts', 'ui/layouts/registry.ts']

/**
 * A layout's entry points, as paths from `src/` without extension: its domain `index.ts`, and its
 * UI's, `ui/index.ts`.
 */
const ENTRY_POINTS = [/^layouts\/[^/]+\/index$/, /^layouts\/[^/]+\/ui\/index$/]

/** Every source file under `src/`, tests included, keyed by its path from here (`./core/paper.ts`). */
const SOURCES = import.meta.glob<string>('./**/*.{ts,tsx}', {
	query: '?raw',
	import: 'default',
	eager: true,
})

/** Every source file's path from `src/` (`core/paper.ts`). */
const FILES = Object.keys(SOURCES).map((key) => key.slice(2))

/** The layout whose folders hold a path from `src/` (`weekly`), or `null` for the host's. */
function layoutOf(path: string): string | null {
	return /^layouts\/([^/]+)\//.exec(path)?.[1] ?? null
}

/** The layer of a path from `src/` (`core/paper`), or -1 for the files above them (`App.tsx`). */
function layerOf(path: string): number {
	if (/^layouts\/[^/]+\/ui\//.test(path)) return LAYERS.indexOf('ui')
	return LAYERS.indexOf(path.split('/')[0] as (typeof LAYERS)[number])
}

/**
 * `specifier` imported from `file`, as a path from `src/`, a folder as its `index`
 * (`layouts/weekly/index`); `null` for a package.
 */
function resolve(file: string, specifier: string): string | null {
	if (!specifier.startsWith('.')) return null
	const parts = file.split('/').slice(0, -1)
	for (const part of specifier.split('/')) {
		if (part === '..') parts.pop()
		else if (part !== '.') parts.push(part)
	}
	const path = parts.join('/')
	return FILES.some((source) => source.startsWith(`${path}/`)) ? `${path}/index` : path
}

/**
 * An import of one file, with the path from `src/` it resolves to (`null` for a package), and
 * whether it imports types only.
 */
interface Import {
	file: string
	specifier: string
	target: string | null
	typeOnly: boolean
}

/** An import's specifier, in `from '…'` (an import or an export), `import '…'` or `import('…')`. */
const IMPORT = /\b(?:from|import\(?)\s*'([^']+)'/g

/** The specifiers `source` imports, in order. */
function specifiers(source: string): string[] {
	return [...source.matchAll(IMPORT)].map(([, specifier]) => specifier)
}

/**
 * An import or export statement from `'…'`: whether it says `type` before its names, the names
 * (`{ … }`, a default one, maybe followed by `{ … }`, or `*`), and the specifier.
 */
const STATEMENT =
	/\b(?:import|export)\s+(type\s+)?(\{[^}]*\}|[\w$]+(?:\s*,\s*\{[^}]*\})?|\*(?:\s+as\s+[\w$]+)?)\s*from\s*'([^']+)'/g

/** Whether the names a statement imports, `{ type A, type B }`, are each marked as a type. */
function typeNamesOnly(names: string): boolean {
	if (!names.startsWith('{')) return false
	const each = names
		.slice(1, -1)
		.split(',')
		.map((name) => name.trim())
		.filter((name) => name !== '')
	return each.length > 0 && each.every((name) => name.startsWith('type '))
}

/** The specifiers `source` imports types only from, in order. */
function typeOnlySpecifiers(source: string): string[] {
	return [...source.matchAll(STATEMENT)]
		.filter(([, type, names]) => type !== undefined || typeNamesOnly(names))
		.map(([, , , specifier]) => specifier)
}

/** The specifiers `source` imports, in order, each with whether it imports types only. */
function importsOf(source: string): { specifier: string; typeOnly: boolean }[] {
	const typeOnly = typeOnlySpecifiers(source)
	return specifiers(source).map((specifier) => {
		const index = typeOnly.indexOf(specifier)
		if (index !== -1) typeOnly.splice(index, 1)
		return { specifier, typeOnly: index !== -1 }
	})
}

/** Every import of every file under `src/`. */
function imports(): Import[] {
	return FILES.flatMap((file) =>
		importsOf(SOURCES[`./${file}`]).map(({ specifier, typeOnly }) => ({
			file,
			specifier,
			target: resolve(file, specifier),
			typeOnly,
		})),
	)
}

/** The imports breaking `rule`, as `file → specifier`. */
function violations(rule: (i: Import) => boolean): string[] {
	return imports()
		.filter(rule)
		.map(({ file, specifier }) => `${file} → ${specifier}`)
}

describe('layers', () => {
	it('reads the source files', () => {
		expect(FILES).toContain('core/calendar.ts')
	})

	it('reads every kind of import', () => {
		const source = [
			"import a, { type A } from './a'",
			"export { b } from './b'",
			"import './c.css'",
			"const d = await import(\n\t'./d'\n)",
		].join('\n')
		expect(specifiers(source)).toEqual(['./a', './b', './c.css', './d'])
	})

	it('reads which imports are types only', () => {
		const source = [
			"import type { A } from './a'",
			"import { type B, type C } from './b'",
			"import {\n\ttype D,\n\ttype E,\n} from './d'",
			"import { type F, f } from './f'",
			"import g, { type G } from './g'",
			"import * as h from './h'",
			"export type { I } from './i'",
			"export { j } from './j'",
			"export * from './k'",
			"import './l.css'",
			"const m = await import('./m')",
		].join('\n')
		expect(importsOf(source)).toEqual([
			{ specifier: './a', typeOnly: true },
			{ specifier: './b', typeOnly: true },
			{ specifier: './d', typeOnly: true },
			{ specifier: './f', typeOnly: false },
			{ specifier: './g', typeOnly: false },
			{ specifier: './h', typeOnly: false },
			{ specifier: './i', typeOnly: true },
			{ specifier: './j', typeOnly: false },
			{ specifier: './k', typeOnly: false },
			{ specifier: './l.css', typeOnly: false },
			{ specifier: './m', typeOnly: false },
		])
	})

	it('never imports a folder above its own, and uses React only in ui/', () => {
		const rule = ({ file, specifier, target }: Import) => {
			const layer = layerOf(file)
			if (layer === -1) return false
			const upward = target !== null && layerOf(target) > layer
			const react = target === null && /^react(-dom)?(\/|$)/.test(specifier)
			return upward || (react && LAYERS[layer] !== 'ui')
		}
		expect(violations(rule)).toEqual([])
	})

	it('imports a port only for its types above ports/, outside ui/', () => {
		const rule = ({ file, target, typeOnly }: Import) => {
			if (isTest(file) || typeOnly || target === null || !target.startsWith('ports/')) {
				return false
			}
			const layer = layerOf(file)
			return layer > LAYERS.indexOf('ports') && LAYERS[layer] !== 'ui'
		}
		expect(violations(rule)).toEqual([])
	})
})

// What the app reads from where it runs is read in one place each, so the domain stays
// deterministic and DOM-free: the clock and the browser's language by `core/environment.ts` (a
// `Date` built only there and by `utcDate`), storage by its two repositories, the printer by its
// port, and the page (`window`, `document`) by `ui/`, the files above the layers (`main.tsx`) and
// the ports that need it. Tests, and their helpers in `test/`, are exempt.

/** Each environment read, and the paths from `src/` allowed to make it. */
const ENVIRONMENT_READS: { read: RegExp; allowed: RegExp }[] = [
	{ read: /\bnew Date\(/, allowed: /^core\/(calendar|environment)\.ts$/ },
	{ read: /\bnavigator\b/, allowed: /^core\/environment\.ts$/ },
	{ read: /\b(local|session)Storage\b/, allowed: /^(workspace|preferences)\/storage\.ts$/ },
	// `window.print()`, or `print()` alone, but not a port's `printer.print()`.
	{
		read: /\b(window|globalThis)\.print\b|(?<![.\w])print\(/,
		allowed: /^ports\/PrinterAccess\.ts$/,
	},
	{
		read: /\b(window|document)\./,
		allowed: /^((ui|layouts\/[^/]+\/ui)\/|[^/]+$|ports\/PrinterAccess\.ts$)/,
	},
]

/** A comment, or a quoted string on one line, matched in one pass so neither hides the other. */
const COMMENT_OR_STRING = /\/\*[\s\S]*?\*\/|\/\/.*|'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"/g

/**
 * `source`'s code: its comments taken out and its quoted strings emptied, so a word in either
 * (`the window`, `'calendarium-document:'`) isn't taken for a read. Template literals stay, as
 * they hold code too.
 */
function codeOf(source: string): string {
	return source.replaceAll(COMMENT_OR_STRING, (match) => (match.startsWith('/') ? '' : "''"))
}

/** Whether a path from `src/` is a test or one of their helpers. */
function isTest(file: string): boolean {
	return /\.test\.tsx?$/.test(file) || file.startsWith('test/')
}

describe('environment', () => {
	it('is looked for in code, not in comments or strings', () => {
		const source =
			"// the window.\nconst key = 'document.' /* localStorage */ + `${window.name}`"
		expect(codeOf(source)).toBe("\nconst key = ''  + `${window.name}`")
	})

	it('is read only by the files allowed to', () => {
		const offending = ENVIRONMENT_READS.flatMap(({ read, allowed }) =>
			FILES.filter(
				(file) =>
					!isTest(file) && !allowed.test(file) && read.test(codeOf(SOURCES[`./${file}`])),
			).map((file) => `${file}: ${read.source}`),
		)
		expect(offending).toEqual([])
	})
})

describe('layouts', () => {
	it('have a folder each, named after its id', () => {
		const folders = new Set(FILES.map(layoutOf).filter((layout) => layout !== null))
		expect([...folders].toSorted()).toEqual(LAYOUT_IDS.toSorted())
		for (const layout of folders) {
			expect(SOURCES[`./layouts/${layout}/index.ts`], layout).toContain(
				`defineLayout('${layout}',`,
			)
		}
	})

	it('never import one another', () => {
		const rule = ({ file, target }: Import) => {
			const from = layoutOf(file)
			const to = target === null ? null : layoutOf(target)
			return from !== null && to !== null && from !== to
		}
		expect(violations(rule)).toEqual([])
	})

	it('are imported by the host only through their entry points, by the registries', () => {
		const rule = ({ file, target }: Import) => {
			if (layoutOf(file) !== null || target === null || layoutOf(target) === null)
				return false
			const entry = ENTRY_POINTS.some((pattern) => pattern.test(target))
			return !(entry && REGISTRIES.includes(file))
		}
		expect(violations(rule)).toEqual([])
	})
})
