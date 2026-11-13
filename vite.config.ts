/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * Keeps Vitest from caching a module that lists files with `import.meta.glob`: its cache is keyed
 * by the module's own source, so it would miss files added or removed since, and
 * `src/layers.test.ts` would pass without checking them.
 */
const freshGlobs: Plugin = {
	name: 'fresh-globs',
	configureVitest({ defineCacheKeyGenerator }) {
		defineCacheKeyGenerator(({ sourceCode }) =>
			sourceCode.includes('import.meta.glob') ? false : undefined,
		)
	},
}

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), freshGlobs],
	// Relative asset URLs, so the build works under any path (e.g. GitHub Pages' /calendarium/).
	base: './',
	// Lets tooling (e.g. the Claude preview) pick the port; Vite's default is used otherwise.
	server: { port: Number(process.env.PORT) || undefined },
	test: {
		passWithNoTests: true,
		// `npm run test:coverage`: what the unit and component tests run, in `coverage/` (`index.html`).
		coverage: {
			provider: 'v8',
			include: ['src/**/*.{ts,tsx}'],
			exclude: ['src/**/*.test.*', 'src/test/**', 'src/main.tsx', 'src/**/*.d.ts'],
			reporter: ['text-summary', 'html'],
			// A little under the measured values, so they catch regressions only: the domain folders
			// (a layout's own files, not its `ui/`) close to fully, the whole app, UI included, looser.
			thresholds: {
				lines: 86,
				statements: 86,
				functions: 83,
				branches: 84,
				'src/core/**': { lines: 98, statements: 98, functions: 98, branches: 94 },
				'src/layouts/{*,*/*}.ts': {
					lines: 97,
					statements: 97,
					functions: 97,
					branches: 97,
				},
				'src/workspace/**': { lines: 96, statements: 95, functions: 94, branches: 94 },
				'src/preferences/**': { lines: 98, statements: 98, functions: 98, branches: 95 },
			},
		},
		// Plain `.test.ts` files stay DOM-free; component tests (`.test.tsx`) run in jsdom.
		projects: [
			{ extends: true, test: { name: 'unit', include: ['src/**/*.test.ts'] } },
			{
				extends: true,
				test: {
					name: 'component',
					include: ['src/**/*.test.tsx'],
					environment: 'jsdom',
					setupFiles: ['src/test/setupDom.ts'],
					// Drawing a year of pages in jsdom takes seconds on a shared CI runner.
					testTimeout: 15_000,
				},
			},
		],
	},
})
