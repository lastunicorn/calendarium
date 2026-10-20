import { describe, expect, it } from 'vitest'

// The folders, from the bottom up. Each may import only itself and the folders below it:
// `core/` (generic: calendar, languages, paper) ← `layouts/` (each layout's options, rules and
// pages) ← `config/` (the saved settings) ← `ui/`. Only `ui/` may use React.
const LAYERS = ['core', 'layouts', 'config', 'ui'] as const

/** Every source file under `src/`, tests included, keyed by its path from here (`./core/paper.ts`). */
const SOURCES = import.meta.glob<string>('./**/*.{ts,tsx}', {
	query: '?raw',
	import: 'default',
	eager: true,
})

/** The layer of a path from `src/` (`core/paper`), or -1 for the files above them (`App.tsx`). */
function layerOf(path: string): number {
	return LAYERS.indexOf(path.split('/')[0] as (typeof LAYERS)[number])
}

/** `specifier` imported from `file`, as a path from `src/`; `null` for a package. */
function resolve(file: string, specifier: string): string | null {
	if (!specifier.startsWith('.')) return null
	const parts = file.split('/').slice(0, -1)
	for (const part of specifier.split('/')) {
		if (part === '..') parts.pop()
		else if (part !== '.') parts.push(part)
	}
	return parts.join('/')
}

/** Each import of each file that breaks the layering, as `file → specifier`. */
function violations(): string[] {
	const found: string[] = []
	for (const [key, source] of Object.entries(SOURCES)) {
		const file = key.slice(2)
		const layer = layerOf(file)
		if (layer === -1) continue
		for (const [, specifier] of source.matchAll(/from '([^']+)'/g)) {
			const target = resolve(file, specifier)
			const upward = target !== null && layerOf(target) > layer
			const react = target === null && /^react(-dom)?(\/|$)/.test(specifier)
			if (upward || (react && LAYERS[layer] !== 'ui')) found.push(`${file} → ${specifier}`)
		}
	}
	return found
}

describe('layers', () => {
	it('reads the source files', () => {
		expect(Object.keys(SOURCES)).toContain('./core/calendar.ts')
	})

	it('never imports a folder above its own, and uses React only in ui/', () => {
		expect(violations()).toEqual([])
	})
})
