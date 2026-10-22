import { describe, expect, it } from 'vitest'
import { LAYOUT_IDS } from './layouts'

// The folders, from the bottom up. Each may import only itself and the folders below it:
// `core/` (generic: calendar, languages, paper) ← `layouts/` (each layout's options, rules and
// pages) ← `workspace/` (the saved settings) ← `ui/`. Only `ui/` may use React. A layout's UI, in
// `layouts/<layout-id>/ui/`, is in `ui/`.
const LAYERS = ['core', 'layouts', 'workspace', 'ui'] as const

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

/** The layout whose folders hold a path from `src/` (`week-per-page`), or `null` for the host's. */
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
 * (`layouts/week-per-page/index`); `null` for a package.
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

/** An import of one file, with the path from `src/` it resolves to (`null` for a package). */
interface Import {
	file: string
	specifier: string
	target: string | null
}

/** Every import of every file under `src/`. */
function imports(): Import[] {
	return FILES.flatMap((file) =>
		[...SOURCES[`./${file}`].matchAll(/from '([^']+)'/g)].map(([, specifier]) => ({
			file,
			specifier,
			target: resolve(file, specifier),
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
})

describe('layouts', () => {
	it('have a folder each, named after its id', () => {
		const folders = new Set(FILES.map(layoutOf).filter((layout) => layout !== null))
		expect([...folders].sort()).toEqual([...LAYOUT_IDS].sort())
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
