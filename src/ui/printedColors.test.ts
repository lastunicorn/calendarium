import { describe, expect, it } from 'vitest'

// The preview is drawn as it prints, so a printed page's colors never follow the viewer's theme:
// no stylesheet drawn on a page uses a token with a light and a dark value (`light-dark()` in
// `index.css`).

const GLOBAL_CSS = import.meta.glob<string>('../index.css', {
	query: '?raw',
	import: 'default',
	eager: true,
})['../index.css']

/** The stylesheets drawn on a printed page: each layout's UI and the parts several share. */
const PRINTED_CSS = import.meta.glob<string>(
	['../layouts/*/ui/**/*.module.css', './layouts/*.module.css'],
	{ query: '?raw', import: 'default', eager: true },
)

/** The tokens with a light and a dark value, which follow the viewer's theme. */
function themedTokens(css: string): string[] {
	return [...css.matchAll(/(--[\w-]+):\s*light-dark\(/g)].map((match) => match[1])
}

describe('printed colors', () => {
	const tokens = themedTokens(GLOBAL_CSS)

	it('finds the themed tokens and the printed stylesheets', () => {
		expect(tokens).toContain('--color-text')
		expect(tokens).toContain('--color-surface')
		expect(Object.keys(PRINTED_CSS)).toContain('./layouts/Page.module.css')
	})

	it.each(Object.entries(PRINTED_CSS))('%s uses no token of the theme', (_, css) => {
		const used = [...css.matchAll(/var\((--[\w-]+)\)/g)].map((match) => match[1])
		expect(used.filter((token) => tokens.includes(token))).toEqual([])
	})
})
